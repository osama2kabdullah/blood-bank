const API_BASE = "http://127.0.0.1:8787";

document.getElementById("registerForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const location = document.getElementById("location").value.trim();
  const lastDonation = document.getElementById("lastDonation").value;
  const bloodGroup = document.querySelector('input[name="bloodGroup"]:checked')?.value;

  // Basic client-side validation
  if (!phone || !password || !location || !bloodGroup) {
    return alert("Please fill in all required fields and select a blood group.");
  }
  if (password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering...";

  try {
    const res = await fetch(`${API_BASE}/auth/donor/register-full`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        phone,
        password,
        blood_group: bloodGroup,
        location,
        last_donation: lastDonation || null
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    // Save token + user info to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = "doner-account.html";

  } catch (err) {
    alert(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;

  if (!phone || !password) {
    return alert("Please enter both phone number and password.");
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${API_BASE}/auth/donor/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save token + user info to localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to dashboard
    window.location.href = "doner-account.html";

  } catch (err) {
    alert(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Login to Account";
  }

});