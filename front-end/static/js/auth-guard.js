const GUEST_ONLY_PAGES = [
  "doner-login.html",
  "doner-registration.html"
];
const PROTECTED_PAGES = [
  "doner-account.html",
];
function authGuard() {
  const token = localStorage.getItem("token");
  const loggedIn = !!token;

  const currentPage = window.location.pathname.split("/").pop();

  if (loggedIn && GUEST_ONLY_PAGES.includes(currentPage)) {
    window.location.replace("doner-account.html");
    return;
  }

  if (!loggedIn && PROTECTED_PAGES.includes(currentPage)) {
    window.location.replace("doner-login.html");
    return;
  }
}
authGuard();