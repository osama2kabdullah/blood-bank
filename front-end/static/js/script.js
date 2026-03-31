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

// DONOR CARD MAKER
function donorCardHTML(donor) {
  return `
    <div class="donor-card">
      <div class="card-header">
        <h3>${donor.name}</h3>
        <span class="blood-badge">${donor.blood_group}</span>
      </div>
      <div class="location">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>
        <span>${donor.location}</span>
      </div>
      <p class="donation">Last Donation: ${donor.last_donation || "N/A"}</p>
      <div class="contact">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-.77a.678.678 0 0 0-.58.122l-2.19 1a12.518 12.518 0 0 1-5.657-5.657l1-2.19a.678.678 0 0 0 .122-.58L3.654 1.328z"/>
        </svg>
        <span>${donor.phone}</span>
      </div>
    </div>`;
}

document.querySelectorAll(".radio-group input[type='radio']").forEach(radio => {
  radio.addEventListener("change", () => {
    radio.closest(".radio-group").classList.remove("error");
  });
});
document.querySelectorAll(".radio-group label").forEach(label => {  
  label.setAttribute("tabindex", "0");
  label.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      label.querySelector("input[type='radio']").click();
    }
  });
});