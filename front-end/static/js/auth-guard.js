// ============================================================
// auth-guard.js — Loaded on every page (before script.js is fine).
// Redirects logged-in users away from guest pages and vice versa.
// ============================================================

const GUEST_ONLY = ["doner-login.html", "doner-registration.html"];
const PROTECTED  = ["doner-account.html"];

(function authGuard() {
  const loggedIn   = !!localStorage.getItem("token");
  const currentPage = window.location.pathname.split("/").pop();

  if (loggedIn  && GUEST_ONLY.includes(currentPage)) { window.location.replace("doner-account.html"); return; }
  if (!loggedIn && PROTECTED.includes(currentPage))  { window.location.replace("doner-login.html");   return; }
})();
