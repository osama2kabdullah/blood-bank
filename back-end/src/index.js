import { verifyToken, generateToken } from "../utils/token.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";

// ---- ROUTES ---- (must be declared before any route assignment)
const routes = {};

// ---- CORS HELPER ----
function getCorsHeaders(origin, allowedOrigin) {
  if (!origin || origin !== allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization", // Fix #2
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

// ---- FETCH ENTRY POINT ----
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "";

    // Handle preflight
    if (request.method === "OPTIONS") {
      if (origin !== allowedOrigin) {
        return new Response("Forbidden", { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin, allowedOrigin)
      });
    }

    const url = new URL(request.url);
    const handler = routes[url.pathname];

    if (!handler) {
      return jsonError("Not Found", 404, origin, allowedOrigin);
    }

    try {
      // Pass origin + allowedOrigin into every handler via request context
      const response = await handler(request, env, ctx, origin, allowedOrigin);
      const corsHdrs = getCorsHeaders(origin, allowedOrigin);
      const headers = new Headers({ "Content-Type": "application/json", ...corsHdrs });
      return new Response(JSON.stringify(await response.json()), {
        status: response.status,
        headers
      });
    } catch (err) {
      return jsonError("Internal Worker error", 500, origin, allowedOrigin, err.message);
    }
  }
};

// ---- HELPERS ----
function jsonResponse(payload, status = 200, extraHeaders = {}) {
  const headers = new Headers({ "Content-Type": "application/json", ...extraHeaders });
  return new Response(JSON.stringify(payload), { status, headers });
}

// Fix #3: origin/allowedOrigin always passed properly at call sites
function jsonError(message, status = 500, origin = "", allowedOrigin = "", details = null) {
  const payload = { status: "error", message };
  if (details) payload.details = details;
  const headers = new Headers({
    "Content-Type": "application/json",
    ...getCorsHeaders(origin, allowedOrigin)
  });
  return new Response(JSON.stringify(payload), { status, headers });
}

// ---- HEALTH ENDPOINT ----
routes["/"] = healthHandler;
function healthHandler(request, env, ctx, origin, allowedOrigin) {
  return jsonResponse({ status: "ok", message: "Worker running" });
}

// ---- DONORS LIST ----
routes["/donors"] = donorsHandler;
async function donorsHandler(request, env, ctx, origin, allowedOrigin) {
  const url = new URL(request.url);

  // Fix #5: normalize blood group cleanly before any logic
  let blood = url.searchParams.get("blood_group")?.trim().toUpperCase().replace(/\s+/g, "") || "";
  const location = url.searchParams.get("location")?.trim();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = 10;
  const offset = (page - 1) * limit;

  // Auto-add '+' only if no sign present
  if (blood && !blood.endsWith("+") && !blood.endsWith("-")) {
    blood = blood + "+";
  }

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
    return jsonResponse({ page, limit, data: results });
  } catch (err) {
    return jsonError("Failed to fetch donors", 500, origin, allowedOrigin, err.message); // Fix #3
  }
}

// ---- REGISTER ----
routes["/auth/donor/register"] = registerHandler;
async function registerHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
      return jsonError("Missing required fields", 400, origin, allowedOrigin);
    }

    const hashedPassword = await hashPassword(password);

    const result = await env.DB.prepare(`
      INSERT INTO users (name, phone, password) VALUES (?, ?, ?)
    `).bind(name, phone, hashedPassword).run();

    const newUserId = result.meta.last_row_id;

    await env.DB.prepare(`
      UPDATE donors SET claimed_by_user_id = ? WHERE phone = ?
    `).bind(newUserId, phone).run();

    return jsonResponse({ success: true, message: "User registered successfully" });

  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return jsonError("Phone already registered", 400, origin, allowedOrigin);
    }
    return jsonError("Registration failed", 500, origin, allowedOrigin, err.message);
  }
}

// ---- LOGIN ----
routes["/auth/donor/login"] = loginHandler;
async function loginHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "POST") {
    return jsonError("Method not allowed", 405, origin, allowedOrigin);
  }

  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return jsonError("Phone and password required", 400, origin, allowedOrigin);
    }

    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE phone = ?"
    ).bind(phone).first();

    if (!user) return jsonError("User not found", 404, origin, allowedOrigin);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return jsonError("Invalid credentials", 401, origin, allowedOrigin);

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
    return jsonError("Login failed", 500, origin, allowedOrigin, err.message);
  }
}

// ---- EDIT DONOR ----
routes["/donors/edit"] = editDonorHandler;
async function editDonorHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "PUT") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { donor_id, name, phone, blood_group, location, last_donation } = body;

    if (!donor_id) return jsonError("donor_id is required", 400, origin, allowedOrigin);

    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE id = ?"
    ).bind(donor_id).first();

    if (!donor) return jsonError("Donor not found", 404, origin, allowedOrigin);

    // Fix #4: coerce both sides to Number for safe comparison
    if (donor.claimed_by_user_id) {
      if (Number(donor.claimed_by_user_id) !== Number(userData.userId))
        return jsonError("You cannot edit this claimed donor", 403, origin, allowedOrigin);
    } else {
      if (Number(donor.added_by_user_id) !== Number(userData.userId))
        return jsonError("You cannot edit this donor", 403, origin, allowedOrigin);
    }

    if (phone && phone !== donor.phone) {
      const existing = await env.DB.prepare(
        "SELECT id FROM donors WHERE phone = ?"
      ).bind(phone).first();
      if (existing) return jsonError("Donor with this phone already exists", 400, origin, allowedOrigin);
    }

    const updates = [];
    const params = [];

    if (name !== undefined)          { updates.push("name = ?");          params.push(name); }
    if (phone !== undefined)         { updates.push("phone = ?");         params.push(phone); }
    if (blood_group !== undefined)   { updates.push("blood_group = ?");   params.push(blood_group.toUpperCase()); }
    if (location !== undefined)      { updates.push("location = ?");      params.push(location); }
    if (last_donation !== undefined) { updates.push("last_donation = ?"); params.push(last_donation); }

    if (updates.length === 0) return jsonError("No fields to update", 400, origin, allowedOrigin);

    const updateQuery = `UPDATE donors SET ${updates.join(", ")} WHERE id = ?`;
    params.push(donor_id);

    await env.DB.prepare(updateQuery).bind(...params).run();

    return jsonResponse({ success: true, message: "Donor updated successfully" });

  } catch (err) {
    return jsonError("Failed to update donor", 500, origin, allowedOrigin, err.message);
  }
}

// ---- ADD DONOR ----
routes["/donors/add"] = addDonorHandler;
async function addDonorHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { name, phone, blood_group, location, last_donation } = body;

    if (!phone || !blood_group || !location) {
      return jsonError("Missing required fields", 400, origin, allowedOrigin);
    }

    const existing = await env.DB.prepare(
      "SELECT id FROM donors WHERE phone = ?"
    ).bind(phone).first();

    if (existing) return jsonError("Donor with this phone already exists", 400, origin, allowedOrigin);

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

    return jsonResponse({ success: true, message: "Donor added successfully" });

  } catch (err) {
    return jsonError("Failed to add donor", 500, origin, allowedOrigin, err.message);
  }
}

// ---- MY DONORS ----
routes["/my-donors"] = myDonorsHandler;
async function myDonorsHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "GET") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM donors
      WHERE added_by_user_id = ? OR claimed_by_user_id = ?
      ORDER BY created_at DESC
    `).bind(userData.userId, userData.userId).all();

    return jsonResponse({ success: true, data: results });

  } catch (err) {
    return jsonError("Failed to fetch your donors", 500, origin, allowedOrigin, err.message);
  }
}

// ---- DELETE DONOR ----
routes["/donors/delete"] = deleteDonorHandler;
async function deleteDonorHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "DELETE") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { donor_id } = body;

    if (!donor_id) return jsonError("donor_id is required", 400, origin, allowedOrigin);

    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE id = ?"
    ).bind(donor_id).first();

    if (!donor) return jsonError("Donor not found", 404, origin, allowedOrigin);

    // Fix #4: coerce both sides to Number for safe comparison
    if (donor.claimed_by_user_id) {
      if (Number(donor.claimed_by_user_id) !== Number(userData.userId))
        return jsonError("You cannot delete this claimed donor", 403, origin, allowedOrigin);
    } else {
      if (Number(donor.added_by_user_id) !== Number(userData.userId))
        return jsonError("You cannot delete this donor", 403, origin, allowedOrigin);
    }

    await env.DB.prepare("DELETE FROM donors WHERE id = ?").bind(donor_id).run();

    return jsonResponse({ success: true, message: "Donor deleted successfully" });

  } catch (err) {
    return jsonError("Failed to delete donor", 500, origin, allowedOrigin, err.message);
  }
}

// web specific endpoint 
routes["/auth/donor/register-full"] = registerFullHandler;
async function registerFullHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { name, phone, password, blood_group, location, last_donation } = body;

    // Validate required fields
    if (!phone || !password || !blood_group || !location) {
      return jsonError("Missing required fields", 400, origin, allowedOrigin);
    }

    const hashedPassword = await hashPassword(password);

    // 1. Create user
    let newUserId;
    try {
      const result = await env.DB.prepare(`
        INSERT INTO users (name, phone, password) VALUES (?, ?, ?)
      `).bind(name, phone, hashedPassword).run();
      newUserId = result.meta.last_row_id;
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        return jsonError("Phone already registered", 400, origin, allowedOrigin);
      }
      throw err;
    }

    // 2. Check if a donor with this phone already exists (unclaimed)
    const existingDonor = await env.DB.prepare(
      "SELECT id FROM donors WHERE phone = ?"
    ).bind(phone).first();

    if (existingDonor) {
      // Claim the existing donor record
      await env.DB.prepare(`
        UPDATE donors SET claimed_by_user_id = ? WHERE phone = ?
      `).bind(newUserId, phone).run();
    } else {
      // Create a new donor record linked to this user
      await env.DB.prepare(`
        INSERT INTO donors (name, phone, blood_group, location, last_donation, claimed_by_user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        name,
        phone,
        blood_group.toUpperCase(),
        location,
        last_donation || null,
        newUserId
      ).run();
    }

    // 3. Auto-login: generate token
    const token = await generateToken(
      { userId: newUserId, phone },
      env.JWT_SECRET
    );

    const donor = await env.DB.prepare(
      "SELECT * FROM donors WHERE claimed_by_user_id = ?"
    ).bind(newUserId).first();

    return jsonResponse({
      success: true,
      message: "Registration successful",
      token,
      user: { id: newUserId, name, phone },
      donor: donor || null
    });

  } catch (err) {
    return jsonError("Registration failed", 500, origin, allowedOrigin, err.message);
  }
}

routes["/user-donation-info"] = infoHandler;
async function infoHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "GET" && request.method !== "PUT") {
    return jsonError("Method not allowed", 405, origin, allowedOrigin);
  }

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    if (request.method === "GET") {
      const user = await env.DB.prepare(
        "SELECT id, name, phone FROM users WHERE id = ?"
      ).bind(userData.userId).first();

      if (!user) return jsonError("User not found", 404, origin, allowedOrigin);

      const donor = await env.DB.prepare(
        "SELECT blood_group, location, last_donation FROM donors WHERE claimed_by_user_id = ?"
      ).bind(userData.userId).first();

      return jsonResponse({
        success: true,
        donor: donor || null
      });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const { blood_group, location, last_donation } = body;

      const updates = [];
      const params = [];

      if (blood_group !== undefined) {
        updates.push("blood_group = ?");
        params.push(blood_group.toUpperCase());
      }
      if (location !== undefined) {
        updates.push("location = ?");
        params.push(location);
      }
      if (last_donation !== undefined) {
        updates.push("last_donation = ?");
        params.push(last_donation);
      }

      if (updates.length === 0) return jsonError("No fields to update", 400, origin, allowedOrigin);

      params.push(userData.userId);
      const updateQuery = `UPDATE donors SET ${updates.join(", ")} WHERE claimed_by_user_id = ?`;

      await env.DB.prepare(updateQuery).bind(...params).run();

      return jsonResponse({ success: true, message: "Info updated successfully" });
    }
  } catch (err) {
    return jsonError("Failed to process request", 500, origin, allowedOrigin, err.message);
  }
}

routes["/me"] = meHandler;
async function meHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "GET" && request.method !== "PUT") {
    return jsonError("Method not allowed", 405, origin, allowedOrigin);
  }

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    if (request.method === "GET") {
      const user = await env.DB.prepare(
        "SELECT id, name, phone FROM users WHERE id = ?"
      ).bind(userData.userId).first();

      if (!user) return jsonError("User not found", 404, origin, allowedOrigin);

      return jsonResponse({ success: true, user });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      const { name, phone } = body;

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
      }
      if (phone !== undefined) {
        updates.push("phone = ?");
        params.push(phone);
      }

      if (updates.length === 0) return jsonError("No fields to update", 400, origin, allowedOrigin);

      params.push(userData.userId);
      const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
      const donorUpdateQuery = `UPDATE donors SET ${updates.join(", ")} WHERE claimed_by_user_id = ?`;

      await env.DB.prepare(updateQuery).bind(...params).run();      
      await env.DB.prepare(donorUpdateQuery).bind(...params).run();

      return jsonResponse({ success: true, message: "User info updated successfully" });
    }
  } catch (err) {
    return jsonError("Failed to process request", 500, origin, allowedOrigin, err.message);
  }
};

routes["/auth/change-password"] = changePasswordHandler;
async function changePasswordHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "POST") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      return jsonError("Both current and new password are required", 400, origin, allowedOrigin);
    }

    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(userData.userId).first();

    if (!user) return jsonError("User not found", 404, origin, allowedOrigin);

    const isValid = await verifyPassword(current_password, user.password);
    if (!isValid) return jsonError("Current password is incorrect", 401, origin, allowedOrigin);

    const hashed = await hashPassword(new_password);
    await env.DB.prepare(
      "UPDATE users SET password = ? WHERE id = ?"
    ).bind(hashed, userData.userId).run();

    return jsonResponse({ success: true, message: "Password changed successfully" });

  } catch (err) {
    return jsonError("Failed to change password", 500, origin, allowedOrigin, err.message);
  }
}

routes["/auth/delete-account"] = deleteAccountHandler;
async function deleteAccountHandler(request, env, ctx, origin, allowedOrigin) {
  if (request.method !== "DELETE") return jsonError("Method not allowed", 405, origin, allowedOrigin);

  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const userData = await verifyToken(token, env.JWT_SECRET);
  if (!userData) return jsonError("Unauthorized", 401, origin, allowedOrigin);

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) return jsonError("Password is required", 400, origin, allowedOrigin);

    const user = await env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(userData.userId).first();

    if (!user) return jsonError("User not found", 404, origin, allowedOrigin);

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return jsonError("Password is incorrect", 401, origin, allowedOrigin);

    await env.DB.prepare(
      "DELETE FROM donors WHERE added_by_user_id = ? AND claimed_by_user_id IS NULL"
    ).bind(userData.userId).run();

    await env.DB.prepare(
      "UPDATE donors SET added_by_user_id = NULL WHERE added_by_user_id = ? AND claimed_by_user_id IS NOT NULL"
    ).bind(userData.userId).run();

    await env.DB.prepare(
      "DELETE FROM donors WHERE claimed_by_user_id = ?"
    ).bind(userData.userId).run();

    await env.DB.prepare(
      "DELETE FROM users WHERE id = ?"
    ).bind(userData.userId).run();

    return jsonResponse({ success: true, message: "Account deleted successfully" });

  } catch (err) {
    return jsonError("Failed to delete account", 500, origin, allowedOrigin, err.message);
  }
}
