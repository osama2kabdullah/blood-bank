import { verifyToken, generateToken } from "../utils/token.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";

// ---- ROUTES ----
const routes = {};

// ---- CORS HELPER ----
function corsHeaders(origin, allowedOrigin) {
  if (origin !== allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

// ---- FETCH ENTRY POINT ----
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin, allowedOrigin) });
    }

    const url = new URL(request.url);
    const handler = routes[url.pathname];

    if (!handler) {
      return jsonError("Not Found", 404, origin, allowedOrigin);
    }

    try {
      const response = await handler(request, env, ctx);
      const headers = new Headers(response.headers);
      const cors = corsHeaders(origin, allowedOrigin);
      for (const key in cors) headers.set(key, cors[key]);
      return jsonResponse(await response.json(), response.status, headers);
    } catch (err) {
      return jsonError("Internal Worker error", 500, origin, allowedOrigin, err.message);
    }
  }
};

// ---- HELPERS ----
function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function jsonError(message, status = 500, origin = "", allowedOrigin = "", details = null) {
  const payload = { status: "error", message };
  if (details) payload.details = details;
  const headers = new Headers({ "Content-Type": "application/json", ...corsHeaders(origin, allowedOrigin) });
  return new Response(JSON.stringify(payload), { status, headers });
}

// ---- HEALTH ENDPOINT ----
routes["/"] = healthHandler;
function healthHandler() {
  return jsonResponse({ status: "ok", message: "Worker running" });
}

routes["/donors"] = donorsHandler;
async function donorsHandler(request, env) {
  const url = new URL(request.url);
  let blood = url.searchParams.get("blood_group")?.trim().toUpperCase();
  const location = url.searchParams.get("location")?.trim();
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 10;
  const offset = (page - 1) * limit;

  // Auto-add '+' if no sign
  if (blood && !blood.endsWith("+") && !blood.endsWith("-")) {
    blood = blood + "+";
  }
  blood = blood?.replace(/ /g, "+");

  let query = "SELECT * FROM donors WHERE 1=1";
  const params = [];

  if (blood) {
    query += " AND blood_group = ?";
    params.push(blood);
  }

  if (location) {
    query += " AND location = ? COLLATE NOCASE";
    params.push(location);
  }

  query += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  try {
    const { results } = await env.DB.prepare(query).bind(...params).all();

    return jsonResponse({
      page,
      limit,
      data: results
    });
  } catch (err) {
    return jsonError("Failed to fetch donors", 500, "", "", err.message);
  }
}

routes["/auth/donor/register"] = registerHandler;
async function registerHandler(request, env) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405);

  try {
    const body = await request.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
      return jsonError("Missing required fields", 400);
    }

    const hashedPassword = await hashPassword(password);

    const result = await env.DB.prepare(`
      INSERT INTO users (name, phone, password)
      VALUES (?, ?, ?)
    `).bind(name, phone, hashedPassword).run();

    const newUserId = result.meta.last_row_id;

    // Auto-claim donor if exists
    await env.DB.prepare(`
      UPDATE donors
      SET claimed_by_user_id = ?
      WHERE phone = ?
    `).bind(newUserId, phone).run();

    return jsonResponse({
      success: true,
      message: "User registered successfully"
    });

  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return jsonError("Phone already registered", 400);
    }

    return jsonError("Registration failed", 500, "", "", err.message);
  }
}

routes["/auth/donor/login"] = loginHandler;
async function loginHandler(request, env) {
  try {
    if (request.method !== "POST") {
      return jsonError("Method not allowed", 405);
    }

    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return jsonError("Phone and password required", 400);
    }

    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE phone = ?"
    ).bind(phone).first();

    if (!user) {
      return jsonError("User not found", 404);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return jsonError("Invalid credentials", 401);

    const token = await generateToken(
      { userId: user.id, phone: user.phone },
      env.JWT_SECRET
    );

    delete user.password;

    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE claimed_by_user_id = ?"
    ).bind(user.id).first();

    return jsonResponse({
      success: true,
      message: "Login successful",
      token,
      user,
      donor: donor || null
    });

  } catch (err) {
    return jsonError("Login failed", 500, "", "", err.message);
  }
}

routes["/donors/edit"] = editDonorHandler;
async function editDonorHandler(request, env) {
  if (request.method !== "PUT") return jsonError("Method not allowed", 405);

  // Auth token
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { donor_id, name, phone, blood_group, location, last_donation } = body;

    if (!donor_id) return jsonError("donor_id is required", 400);

    // Fetch donor
    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE id = ?"
    ).bind(donor_id).first();

    if (!donor) return jsonError("Donor not found", 404);

    // Check ownership
    if (donor.claimed_by_user_id) {
      if (donor.claimed_by_user_id !== userData.userId)
        return jsonError("You cannot edit this claimed donor", 403);
    } else {
      if (donor.added_by_user_id !== userData.userId)
        return jsonError("You cannot edit this donor", 403);
    }

    // If phone is being updated, check uniqueness
    if (phone && phone !== donor.phone) {
      const existing = await env.DB.prepare(
        "SELECT id FROM donors WHERE phone = ?"
      ).bind(phone).first();

      if (existing) return jsonError("Donor with this phone already exists", 400);
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push("name = ?"); params.push(name); }
    if (phone !== undefined) { updates.push("phone = ?"); params.push(phone); }
    if (blood_group !== undefined) { updates.push("blood_group = ?"); params.push(blood_group.toUpperCase()); }
    if (location !== undefined) { updates.push("location = ?"); params.push(location); }
    if (last_donation !== undefined) { updates.push("last_donation = ?"); params.push(last_donation); }

    if (updates.length === 0) return jsonError("No fields to update", 400);

    const updateQuery = `UPDATE donors SET ${updates.join(", ")} WHERE id = ?`;
    params.push(donor_id);

    await env.DB.prepare(updateQuery).bind(...params).run();

    return jsonResponse({
      success: true,
      message: "Donor updated successfully"
    });

  } catch (err) {
    return jsonError("Failed to update donor", 500, "", "", err.message);
  }
}

routes["/donors/add"] = addDonorHandler;
async function addDonorHandler(request, env) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { name, phone, blood_group, location, last_donation } = body;

    if (!phone || !blood_group || !location) {
      return jsonError("Missing required fields", 400);
    }

    const existing = await env.DB.prepare(`
      SELECT id FROM donors WHERE phone = ?
    `).bind(phone).first();

    if (existing) return jsonError("Donor with this phone already exists", 400);

    await env.DB.prepare(`
      INSERT INTO donors (name, phone, blood_group, location, last_donation, added_by_user_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      name || null,
      phone,
      blood_group.toUpperCase(),
      location,
      last_donation || null,
      userData.userId
    ).run();

    return jsonResponse({
      success: true,
      message: "Donor added successfully"
    });

  } catch (err) {
    return jsonError("Failed to add donor", 500, "", "", err.message);
  }
}

routes["/my-donors"] = myDonorsHandler;
async function myDonorsHandler(request, env) {
  if (request.method !== "GET") return jsonError("Method not allowed", 405);

  // Auth token
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401);

  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM donors
      WHERE added_by_user_id = ? OR claimed_by_user_id = ?
      ORDER BY created_at DESC
    `).bind(userData.userId, userData.userId).all();

    return jsonResponse({
      success: true,
      data: results
    });

  } catch (err) {
    return jsonError("Failed to fetch your donors", 500, "", "", err.message);
  }
}

routes["/donors/delete"] = deleteDonorHandler;
async function deleteDonorHandler(request, env) {
  if (request.method !== "DELETE") return jsonError("Method not allowed", 405);

  // Auth token
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { donor_id } = body;

    if (!donor_id) return jsonError("donor_id is required", 400);

    // Fetch donor
    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE id = ?"
    ).bind(donor_id).first();

    if (!donor) return jsonError("Donor not found", 404);

    // Ownership check
    if (donor.claimed_by_user_id) {
      if (donor.claimed_by_user_id !== userData.userId)
        return jsonError("You cannot delete this claimed donor", 403);
    } else {
      if (donor.added_by_user_id !== userData.userId)
        return jsonError("You cannot delete this donor", 403);
    }

    // Delete donor
    await env.DB.prepare("DELETE FROM donors WHERE id = ?").bind(donor_id).run();

    return jsonResponse({
      success: true,
      message: "Donor deleted successfully"
    });

  } catch (err) {
    return jsonError("Failed to delete donor", 500, "", "", err.message);
  }
}
