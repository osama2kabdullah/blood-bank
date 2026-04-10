// ============================================================
// account-dashboard.js — Account page only.
// Requires: script.js (apiFetch, getUser, donorCardHTML, showLoader, hideLoader,
//                       clearMessages, showFormError, showFormSuccess)
// ============================================================

// ── Section map ───────────────────────────────────────────────
const SECTIONS = {
  "#your-info": { selector: ".account-info",       load: loadYourInfo },
  "#my-donors": { selector: ".account-donor-list", load: loadMyDonors },
  "#settings":  { selector: ".account-settings",   load: loadSettings },
  "#add-donor": { selector: ".account-new-donor",  load: loadAddDonor },
};
const DEFAULT_SECTION = "#your-info";
let currentSection = null;

// ── Navigation ────────────────────────────────────────────────
async function navigateTo(hash) {
  const section = SECTIONS[hash];
  if (!section) return;

  window.location.hash = hash;
  currentSection = hash;

  // Update active sidebar link
  document.querySelectorAll(".account-sidebar nav a").forEach(l => l.classList.remove("active"));
  document.querySelector(`.account-sidebar nav a[href="${hash}"]`)?.classList.add("active");

  // Swap visible section
  document.querySelectorAll(".account-content .dashboard-grid, .account-donor-list")
    .forEach(el => el.classList.remove("active"));

  showLoader();
  await section.load();
  hideLoader();

  document.querySelectorAll(section.selector).forEach(el => el.classList.add("active"));
}

// ── Generic form submit handler ───────────────────────────────
// Each form just provides getBody() for custom validation + onSuccess().
async function handleFormSubmit(e, form, { getBody, onSuccess }) {
  e.preventDefault();
  clearMessages(form);

  const body = getBody ? getBody(form) : Object.fromEntries(new FormData(form).entries());
  if (body === null) return; // validation failed inside getBody

  const url    = form.getAttribute("action");
  const method = (form.getAttribute("method") || "POST").toUpperCase();

  try {
    const data = await apiFetch(url, { method, body });
    if (data.ok) {
      onSuccess(data, form);
    } else {
      showFormError(form, data.message || "Unknown error.");
    }
  } catch (err) {
    console.error(err);
    showFormError(form, "Something went wrong. Please try again.");
  }
}

// ── Section loaders ───────────────────────────────────────────
async function loadYourInfo() {
  const section = document.querySelector(".account-info");
  try {
    const data  = await apiFetch("/user-donation-info");
    const donor = data.donor;
    if (!donor) return;

    if (donor.blood_group) {
      section.querySelector(`input[name="blood_group"][value="${donor.blood_group}"]`)?.setAttribute("checked", true);
    }
    if (donor.location)      section.querySelector("#location").value      = donor.location;
    if (donor.last_donation) section.querySelector("#lastDonation").value  = donor.last_donation;
  } catch (err) {
    console.error("loadYourInfo:", err);
  }
}

async function loadMyDonors() {
  const section = document.querySelector(".account-donor-list");
  const list    = section?.querySelector(".donor-list");
  const empty   = section?.querySelector(".no-donors");

  try {
    const data   = await apiFetch("/my-donors");
    const donors = data.data || [];

    if (!donors.length) {
      if (empty) empty.style.display = "block";
      if (list)  list.style.display  = "none";
      return;
    }

    const user = getUser();
    if (list)  list.innerHTML        = donors.map(d => donorCardHTML(d, user)).join("");
    if (empty) empty.style.display   = "none";
    if (list)  list.style.display    = "";
  } catch (err) {
    console.error("loadMyDonors:", err);
  }
}

async function loadSettings() {
  const sectionOne = document.querySelector(".account-settings.one");
  const actionUrl  = sectionOne?.querySelector("form")?.getAttribute("action");
  if (!actionUrl) return;

  try {
    const data = await apiFetch(actionUrl);
    const user = data.user;
    if (!user) return;

    sectionOne.querySelector("#name") && (sectionOne.querySelector("#name").value   = user.name  || "");
    sectionOne.querySelector("#phone") && (sectionOne.querySelector("#phone").value = user.phone || "");
  } catch (err) {
    console.error("loadSettings:", err);
  }
}

async function loadAddDonor() {
  const section = document.querySelector(".account-new-donor");
  const old     = section?.querySelector("form");
  if (!old) return;

  // Clone to remove any stacked listeners from previous visits
  const form = old.cloneNode(true);
  old.parentNode.replaceChild(form, old);
  form.reset();

  form.addEventListener("submit", (e) => {
    handleFormSubmit(e, form, {
      getBody(f) {
        const blood = f.querySelector("input[name='blood_group']:checked");
        if (!blood) {
          f.querySelector(".radio-group")?.classList.add("error");
          return null;
        }
        return Object.fromEntries(new FormData(f).entries());
      },
      onSuccess() {
        navigateTo("#my-donors");
      },
    });
  });
}

// ── Settings forms ────────────────────────────────────────────
function bindSettingsForms() {
  // Section 1: update name/phone
  const s1 = document.querySelector(".account-settings.one form");
  s1?.addEventListener("submit", (e) => {
    handleFormSubmit(e, s1, {
      onSuccess(data, form) {
        navigateTo(form.dataset.next || "#your-info");
      },
    });
  });

  // Section 2: change password
  const s2 = document.querySelector(".account-settings.two form");
  s2?.addEventListener("submit", (e) => {
    handleFormSubmit(e, s2, {
      getBody(form) {
        const body = Object.fromEntries(new FormData(form).entries());
        if (body.new_password !== body.confirm_password) {
          showFormError(form, "New passwords do not match.");
          return null;
        }
        delete body.confirm_password;
        return body;
      },
      onSuccess(data, form) {
        form.reset();
        navigateTo(form.dataset.next || "#your-info");
      },
    });
  });

  // Section 3: delete account
  const s3 = document.querySelector(".account-settings.three form");
  s3?.addEventListener("submit", (e) => {
    handleFormSubmit(e, s3, {
      getBody(form) {
        const body = Object.fromEntries(new FormData(form).entries());
        if (!body.password) {
          showFormError(form, "Please enter your password to delete account.");
          return null;
        }
        return body;
      },
      onSuccess() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "doner-login.html";
      },
    });
  });
}

// ── Account info form (your-info section) ─────────────────────
function bindAccountInfoForm() {
  const form = document.querySelector(".account-info form");
  form?.addEventListener("submit", (e) => {
    handleFormSubmit(e, form, {
      getBody(f) {
        if (!f.querySelector("input[name='blood_group']:checked")) {
          f.querySelector(".radio-group")?.classList.add("error");
          return null;
        }
        return Object.fromEntries(new FormData(f).entries());
      },
      onSuccess(data, f) {
        navigateTo(f.dataset.next || "#your-info");
      },
    });
  });
}

// ── Sidebar identity ──────────────────────────────────────────
function loadSidebarIdentity() {
  const user  = getUser();
  const phone = user?.phone || "";

  const avatarEl = document.querySelector(".account-sidebar .avatar .avatar-placeholder");
  const nameEl   = document.querySelector(".account-sidebar .avatar h2");

  if (avatarEl) avatarEl.textContent = phone.slice(-2);
  if (nameEl)   nameEl.textContent   = phone;
}

// ── Events ────────────────────────────────────────────────────
function bindEvents() {
  document.querySelectorAll(".account-sidebar nav a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.getAttribute("href"));
    });
  });

  document.querySelectorAll(".add-donor").forEach(btn => {
    btn.addEventListener("click", () => navigateTo("#add-donor"));
  });
}

function initAccountSidebar() {
  const hamburger  = document.querySelector(".side-bar-toggle");
  const mobileMenu = document.querySelector(".account-sidebar");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle("active");
  });

  mobileMenu.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => mobileMenu.classList.remove("active"));
}

// ── Init ──────────────────────────────────────────────────────
(function init() {
  loadSidebarIdentity();
  bindEvents();
  bindAccountInfoForm();
  bindSettingsForms();
  initAccountSidebar();

  const hash = window.location.hash;
  navigateTo(SECTIONS[hash] ? hash : DEFAULT_SECTION);
})();
