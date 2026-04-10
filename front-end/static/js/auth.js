// ============================================================
// auth.js — Login & Register pages only.
// Requires: script.js (API_BASE)
// ============================================================

// ── Register ──────────────────────────────────────────────────
document.getElementById("registerForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name          = document.getElementById("name").value.trim();
  const phone         = document.getElementById("phone").value.trim();
  const password      = document.getElementById("password").value;
  const confirmPass   = document.getElementById("confirmPassword").value;
  const location      = document.getElementById("location").value.trim();
  const lastDonation  = document.getElementById("lastDonation").value;
  const blood_group   = document.querySelector('input[name="blood_group"]:checked')?.value;

  if (!phone || !password || !location || !blood_group)
    return alert("Please fill in all required fields and select a blood group.");

  if (password !== confirmPass)
    return alert("Passwords do not match.");

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled    = true;
  submitBtn.textContent = "Registering...";

  try {
    const res = await fetch(`${API_BASE}/auth/donor/register-full`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:          name || null,
        phone,
        password,
        blood_group,
        location,
        last_donation: lastDonation || null,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    window.location.href = "doner-account.html";

  } catch (err) {
    alert(err.message);
    submitBtn.disabled    = false;
    submitBtn.textContent = "Create Account";
  }
});

// ── Login ─────────────────────────────────────────────────────
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const phone    = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!phone || !password)
    return alert("Please enter both phone number and password.");

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled    = true;
  submitBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${API_BASE}/auth/donor/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user",  JSON.stringify(data.user));
    window.location.href = "doner-account.html";

  } catch (err) {
    alert(err.message);
    submitBtn.disabled    = false;
    submitBtn.textContent = "Login to Account";
  }
});
