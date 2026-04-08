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
  document.querySelectorAll(selector).forEach(el => el.classList.add("active"));
}

function showLoader() {
  document.getElementById("sectionLoader")?.classList.add("active");
}

function hideLoader() {
  document.getElementById("sectionLoader")?.classList.remove("active");
}

async function updateInfoForm(e, form) {
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
  const url = API_BASE + form.getAttribute("action");
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method: form.getAttribute("method"),
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(donorData)
    });
    const data = await res.json();
    if (res.ok) {
      navigateTo(form.getAttribute("data-next"));
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
}

async function loadYourInfo() {
  const section = document.querySelector(".account-info");
  const form = section.querySelector("form");  
  form.addEventListener("submit", async (e) => updateInfoForm(e, form)); 
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/user-donation-info`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.donor.blood_group) {
      const radio = section.querySelector(`input[name="blood_group"][value="${data.donor.blood_group}"]`);
      if (radio) radio.checked = true;
    }
    if (data.donor.location) section.querySelector("#location").value = data.donor.location;
    if (data.donor.last_donation) section.querySelector("#lastDonation").value = data.donor.last_donation;
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
    
    const user = getUser();
    section.querySelector(".donor-list").innerHTML = donors.map(donor => donorCardHTML(donor, user)).join("");
    section.querySelector(".no-donors").style.display = "none";
  } catch (err) {
    console.error("loadMyDonors failed:", err);
  }
}

async function updateUserInfo(e, form) {
  e.preventDefault();
  const formData = new FormData(form);
  const successMsgEl = form.querySelector(".success-message");
  const errorMsgEl = form.querySelector(".error-message");
  successMsgEl.textContent = "";
  successMsgEl.style.display = "none";
  errorMsgEl.textContent = "";
  errorMsgEl.style.display = "none";
  const userData = Object.fromEntries(formData.entries());
  const url = API_BASE + form.getAttribute("action");
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method: form.getAttribute("method"),
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (res.ok) {
      navigateTo(form.getAttribute("data-next"));
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
}

async function updatePassword(e, form) {
  e.preventDefault();
  const formData = new FormData(form);
  const successMsgEl = form.querySelector(".success-message");
  const errorMsgEl = form.querySelector(".error-message");
  successMsgEl.textContent = "";
  successMsgEl.style.display = "none";
  errorMsgEl.textContent = "";
  errorMsgEl.style.display = "none";

  const body = Object.fromEntries(formData.entries());
  if (body.new_password !== body.confirm_password) {
    errorMsgEl.textContent = "New passwords do not match.";
    errorMsgEl.style.display = "block";
    return;
  }

  delete body.confirm_password;
  const url = API_BASE + form.getAttribute("action");
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method: form.getAttribute("method"),
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      form.reset();
      navigateTo(form.getAttribute("data-next"));
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
}

async function deleteAccount(e, form) {
  e.preventDefault();

  const formData = new FormData(form);
  const successMsgEl = form.querySelector(".success-message");
  const errorMsgEl = form.querySelector(".error-message");

  successMsgEl.textContent = "";
  successMsgEl.style.display = "none";
  errorMsgEl.textContent = "";
  errorMsgEl.style.display = "none";

  const body = Object.fromEntries(formData.entries());
  
  if (!body.password) {
    errorMsgEl.textContent = "Please enter the password to delete your account.";
    errorMsgEl.style.display = "block";
    return;
  }

  const url = API_BASE + form.getAttribute("action");

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      method: form.getAttribute("method"),
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.ok) {
      form.reset();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "doner-login.html";
    } else {
      errorMsgEl.textContent = data.message || "Failed to delete account";
      errorMsgEl.style.display = "block";
      console.error("Delete account failed:", data);
    }

  } catch (err) {
    console.error("deleteAccount failed:", err);
    errorMsgEl.textContent = "An error occurred while deleting the account. Please try again.";
    errorMsgEl.style.display = "block";
  }
}

async function loadSettings() {
  const sectionOne = document.querySelector(".account-settings.one");
  const sectionTwo = document.querySelector(".account-settings.two");
  const sectionThree = document.querySelector(".account-settings.three");

  const formOne = sectionOne.querySelector("form");
  const formTwo = sectionTwo.querySelector("form");
  const formThree = sectionThree.querySelector("form");
  
  formOne.addEventListener("submit", async (e) => updateUserInfo(e, formOne));
  formTwo.addEventListener("submit", async (e) => updatePassword(e, formTwo));
  formThree.addEventListener("submit", async (e) => deleteAccount(e, formThree));

  const url = API_BASE + formOne.getAttribute("action");
  try {
    const user = await fetch(url, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    }).then(res => res.json()).then(data => data.user);    
    if (!user) return;
    if (sectionOne.querySelector("#name"))  sectionOne.querySelector("#name").value  = user.name  || "";
    if (sectionOne.querySelector("#phone")) sectionOne.querySelector("#phone").value = user.phone || "";
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