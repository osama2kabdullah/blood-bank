// ---- ROUTES ----
const routes = {
  "/": healthHandler
};

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

  // Fix '+' encoding from URL
  blood = blood?.replace(/ /g, "+");

  let query = "SELECT * FROM users WHERE 1=1";
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
import { hashPassword } from "../utils/hash.js";
async function registerHandler(request, env) {
  try {
    if (request.method !== "POST") {
      return jsonError("Method not allowed", 405);
    }

    const body = await request.json();
    const { name, phone, password, blood_group, location } = body;

    if (!name || !phone || !password || !blood_group) {
      return jsonError("Missing required fields", 400);
    }

    const hashedPassword = await hashPassword(password);

    await env.DB.prepare(`
      INSERT INTO users (name, phone, password, blood_group, location)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      name,
      phone,
      hashedPassword,
      blood_group.toUpperCase(),
      location || null
    ).run();

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
import { generateToken } from "../utils/token.js";
import { verifyPassword } from "../utils/hash.js";
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

    if (!isValid) {
      return jsonError("Invalid credentials", 401);
    }

    const token = await generateToken(
      { userId: user.id, phone: user.phone },
      env.JWT_SECRET
    );

    delete user.password;

    return jsonResponse({
      success: true,
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    return jsonError("Login failed", 500, "", "", err.message);
  }
}

routes["/dummy-data"] = dummyDataHandler;
import { dummyDonors } from "./dummyDonors.js";
async function dummyDataHandler(request, env) {
  try {
    const donors = dummyDonors;

    for (const d of donors) {
      await env.DB.prepare(
        `INSERT INTO users (name, phone, password, blood_group, location, last_donation)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(d.name, d.phone, d.password, d.blood_group, d.location, d.last_donation).run();
    }

    return jsonResponse({ success: true, message: "Dummy donors added" });
  } catch (err) {
    return jsonError("Failed to insert dummy data", 500, "", "", err.message);
  }
}

// ---- delete all data route ----
routes["/delete-all"] = deleteAllHandler;
async function deleteAllHandler(request, env) {
  try {
    if (request.method !== "POST") {
      return jsonError("Method not allowed", 405);
    }

    await env.DB.prepare("DELETE FROM users").run();

    return jsonResponse({ success: true, message: "All donors deleted" });
  } catch (err) {
    return jsonError("Failed to delete donors", 500, "", "", err.message);
  }
}