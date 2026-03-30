const hamburger = document.querySelector(".hamburger-menu");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("active");
});

mobileMenu.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
});

function updateHeader() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const loggedIn = !!token && !!user;

  // ---- Desktop nav ----
  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    const link = document.createElement("a");
    if (loggedIn) {
      link.href = "doner-account.html";
      link.classList.add("nav-link");
      link.textContent = "My Account";
    } else {
      link.href = "doner-login.html";
      link.classList.add("nav-link");
      link.textContent = "Login";
    }
    navLinks.appendChild(link);
  }

  // ---- Registration / Sign Out button ----
  const headerRight = document.querySelector(".header-right-side");  
  const existingBtn = headerRight.querySelector("a.action-btn");
  if (loggedIn) {
    existingBtn.href = "javascript:void(0)";
    existingBtn.className = "btn-secondary";
    existingBtn.textContent = "Sign Out";
    console.log(existingBtn);
    
    existingBtn.addEventListener("click", logout);
  } else {
    existingBtn.href = "doner-registration.html";
    existingBtn.className = "btn-primary";
    existingBtn.textContent = "Donor Registration";
  }

  // ---- Mobile menu ----
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    const link = document.createElement("a");
    if (loggedIn) {
      link.href = "account.html";
      link.textContent = "My Account";
    } else {
      link.href = "doner-login.html";
      link.textContent = "Login";
    }
    mobileMenu.appendChild(link);
  }
}

function logout(e) {
  e?.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("donor");
  window.location.href = "doner-login.html";
}
updateHeader();
