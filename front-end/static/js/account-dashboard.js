const API_BASE = "http://127.0.0.1:8787";

const sections = {
  "#your-info":  { el: ".account-info",       load: loadYourInfo },
  "#my-donors":  { el: ".account-donor-list", load: loadMyDonors },
  "#settings":   { el: ".account-settings",   load: loadSettings },
  "#add-donor":  { el: ".account-new-donor",  load: loadAddDonor },
};

const DEFAULT_SECTION = "#your-info";
let currentSection = null;

document.querySelectorAll(".account-sidebar nav a").forEach(link => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const hash = link.getAttribute("href");
    await navigateTo(hash);
  });
});

document.querySelectorAll(".add-donor").forEach(btn => {
  btn.addEventListener("click", () => navigateTo("#add-donor"));
});

async function navigateTo(hash) {
  if (!sections[hash]) return;

  window.location.hash = hash;

  document.querySelectorAll(".account-sidebar nav a").forEach(l => l.classList.remove("active"));
  document.querySelector(`.account-sidebar nav a[href="${hash}"]`)?.classList.add("active");

  hideAllSections();
  showLoader();
  await sections[hash].load();
  hideLoader();
  showSection(sections[hash].el);
  currentSection = hash;
}

function hideAllSections() {
  document.querySelectorAll(".account-content .dashboard-grid, .account-donor-list")
    .forEach(el => el.classList.remove("active"));
}

function showSection(selector) {
  document.querySelector(selector)?.classList.add("active");
}

function showLoader() {
  document.getElementById("sectionLoader")?.classList.add("active");
}

function hideLoader() {
  document.getElementById("sectionLoader")?.classList.remove("active");
}

async function loadYourInfo() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/your-info-endpoint`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    const section = document.querySelector(".account-info");
    if (data.blood_group) {
      const radio = section.querySelector(`input[name="bloodGroup"][value="${data.blood_group}"]`);
      if (radio) radio.checked = true;
    }
    if (data.location) section.querySelector("#location").value = data.location;
    if (data.last_donation) section.querySelector("#lastDonation").value = data.last_donation;
  } catch (err) {
    console.error("loadYourInfo failed:", err);
  }
}

async function loadMyDonors() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/my-donors`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    const donors = data.data || [];
    const section = document.querySelector(".account-donor-list");

    if (!donors.length) {
      section.querySelector(".no-donors").style.display = "block";
      section.querySelector(".donor-list") && (section.querySelector(".donor-list").style.display = "none");
      return;
    }
    
    section.querySelector(".donor-list").innerHTML = donors.map(donorCardHTML).join("");
    section.querySelector(".no-donors").style.display = "none";
  } catch (err) {
    console.error("loadMyDonors failed:", err);
  }
}

async function loadSettings() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;
    const section = document.querySelector(".account-settings");
    if (section.querySelector("#name"))  section.querySelector("#name").value  = user.name  || "";
    if (section.querySelector("#phone")) section.querySelector("#phone").value = user.phone || "";
  } catch (err) {
    console.error("loadSettings failed:", err);
  }
}

async function loadAddDonor() {
  const form = document.querySelector(".account-new-donor form");
  form.reset();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const successMsgEl = form.querySelector(".success-message");
    const errorMsgEl = form.querySelector(".error-message");
    successMsgEl.textContent = "";
    successMsgEl.style.display = "none";
    errorMsgEl.textContent = "";
    errorMsgEl.style.display = "none";
    const bloodGroup = form.querySelector("input[name='blood_group']:checked");
    if (!bloodGroup) {
      form.querySelector(".radio-group").classList.add("error");
      return;
    }
    const donorData = Object.fromEntries(formData.entries());
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/donors/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(donorData)
      });
      const data = await res.json();
      if (res.ok) {
        navigateTo("#my-donors");
      } else {
        errorMsgEl.textContent = data.message || "Unknown error";
        errorMsgEl.style.display = "block";
        successMsgEl.textContent = "";
        successMsgEl.style.display = "none";
        console.error("Add donor failed:", data);
      }
    } catch (err) {
      console.error("loadAddDonor failed:", err);
      errorMsgEl.textContent = "An error occurred while adding the donor. Please try again.";
      errorMsgEl.style.display = "block";
      successMsgEl.textContent = "";
      successMsgEl.style.display = "none";
    }
  });
}

(function init() {
  const hash = window.location.hash || DEFAULT_SECTION;
  navigateTo(sections[hash] ? hash : DEFAULT_SECTION);
})();