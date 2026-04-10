// ============================================================
// donors.js — Donor listing page only.
// Requires: script.js (apiFetch, getUser, donorCardHTML, showLoader, hideLoader)
// ============================================================

// ── Bangladesh 64 districts ───────────────────────────────────
const DISTRICTS = [
  "All Bangladesh",
  // Barishal Division
  "Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur",
  // Chattogram Division
  "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar",
  "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
  // Dhaka Division
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur",
  "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
  // Khulna Division
  "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia",
  "Magura", "Meherpur", "Narail", "Satkhira",
  // Mymensingh Division
  "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
  // Rajshahi Division
  "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj",
  // Rangpur Division
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
  // Sylhet Division
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
];

// ── DOM refs ──────────────────────────────────────────────────
const donorListEl   = document.getElementById("donorList");
const locationInput = document.getElementById("location");
const filterForm    = document.getElementById("donor-filter-form");
const pagination    = document.querySelector(".pagination");

// ── State ─────────────────────────────────────────────────────
const PAGE_SIZE = 10;
let currentPage  = 1;
let totalPages   = 1;
let totalResults = 0;
let currentFilters = { blood: "", location: "All Bangladesh" };
let dropdownIndex  = -1;

// ── URL sync ──────────────────────────────────────────────────
function getFiltersFromURL() {
  const p = new URLSearchParams(window.location.search);
  return {
    blood:    p.get("blood")    || "",
    location: p.get("location") || "All Bangladesh",
    page:     Number(p.get("page")) || 1,
  };
}

function updateURL() {
  const p = new URLSearchParams();
  if (currentFilters.blood)                      p.set("blood",    currentFilters.blood);
  if (currentFilters.location)                   p.set("location", currentFilters.location);
  if (currentPage > 1)                           p.set("page",     currentPage);
  history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
}

// ── Fetch & render ────────────────────────────────────────────
async function fetchDonors() {
  showLoader();
  updateURL();

  try {
    const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE });
    if (currentFilters.blood)    params.set("blood_group", currentFilters.blood);
    if (currentFilters.location) params.set("location",    currentFilters.location);

    const data = await apiFetch(`/donors?${params.toString()}`);

    totalPages   = data.total_pages || 1;
    totalResults = data.total       || 0;

    renderDonors(data.data || []);
    renderPagination();
    updateSummary();
  } catch (err) {
    donorListEl.innerHTML = `<p class="no-donors">Failed to fetch donors. Try again later.</p>`;
    console.error(err);
  } finally {
    hideLoader();
  }
}

function renderDonors(donors) {
  if (!donors.length) {
    donorListEl.innerHTML = `<p class="no-donors">No donors found. Please adjust your filters or check back later.</p>`;
    return;
  }
  const user = getUser();
  donorListEl.innerHTML = donors.map(d => donorCardHTML(d, user)).join("");
}

function updateSummary() {
  const from = totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(currentPage * PAGE_SIZE, totalResults);

  document.querySelector(".blood_group")   && (document.querySelector(".blood_group").textContent    = currentFilters.blood    || "All");
  document.querySelector(".location-name") && (document.querySelector(".location-name").textContent = currentFilters.location || "Anywhere");
  document.querySelector(".from")          && (document.querySelector(".from").textContent           = from);
  document.querySelector(".to")            && (document.querySelector(".to").textContent             = to);
  document.querySelector(".total")         && (document.querySelector(".total").textContent          = totalResults);
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination() {
  const MAX_VISIBLE = 7;
  let html = prevBtn();

  if (totalPages <= MAX_VISIBLE) {
    for (let i = 1; i <= totalPages; i++) html += pageBtn(i);
  } else {
    html += pageBtn(1);
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) html += `<span class="dots">...</span>`;
    for (let i = start; i <= end; i++) html += pageBtn(i);
    if (end < totalPages - 1) html += `<span class="dots">...</span>`;
    html += pageBtn(totalPages);
  }

  html += nextBtn();
  pagination.innerHTML = html;
}

const prevBtn = () => `
  <button type="button" class="page-btn prev" aria-label="Go to previous page" ${currentPage === 1 ? "disabled" : ""}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
    </svg>
  </button>`;

const nextBtn = () => `
  <button type="button" class="page-btn next" aria-label="Go to next page" ${currentPage === totalPages ? "disabled" : ""}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
    </svg>
  </button>`;

const pageBtn = (page) =>
  `<button class="page-btn ${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;

pagination.addEventListener("click", (e) => {
  const btn = e.target.closest(".page-btn");
  if (!btn || btn.disabled) return;

  if      (btn.classList.contains("prev")) currentPage = Math.max(1, currentPage - 1);
  else if (btn.classList.contains("next")) currentPage = Math.min(totalPages, currentPage + 1);
  else                                     currentPage = Number(btn.dataset.page);

  fetchDonors();
});

// ── Filter form ───────────────────────────────────────────────
filterForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  currentFilters = {
    blood:    document.querySelector('input[name="blood_group"]:checked')?.value || "",
    location: locationInput.value.trim() || "All Bangladesh",
  };
  currentPage = 1;
  fetchDonors();
});

// ── Location dropdown ─────────────────────────────────────────
function renderDropdown(list) {
  let dropdown = document.getElementById("locationDropdown");
  if (!dropdown) {
    dropdown = document.createElement("ul");
    dropdown.id = "locationDropdown";
    locationInput.parentNode.appendChild(dropdown);
  }

  const current = locationInput.value;
  dropdownIndex = list.findIndex(d => d === current);

  dropdown.innerHTML = list.map((d, i) =>
    `<li data-index="${i}" class="${d === current ? "active" : ""}">${d}</li>`
  ).join("");

  dropdown.querySelectorAll("li").forEach(li => {
    li.addEventListener("mousedown", () => selectLocation(li.textContent));
  });
}

function closeDropdown() {
  document.getElementById("locationDropdown")?.remove();
}

function highlightDropdown(items) {
  items.forEach(item => item.classList.remove("active"));
  if (dropdownIndex >= 0 && items[dropdownIndex]) {
    items[dropdownIndex].classList.add("active");
    items[dropdownIndex].scrollIntoView({ block: "nearest" });
  }
}

function selectLocation(value) {
  locationInput.value      = value;
  currentFilters.location  = value;
  currentPage              = 1;
  closeDropdown();
  fetchDonors();
}

locationInput.addEventListener("focus", () => renderDropdown(DISTRICTS));

locationInput.addEventListener("input", () => {
  const val = locationInput.value.toLowerCase();
  renderDropdown(val ? DISTRICTS.filter(d => d.toLowerCase().includes(val)) : DISTRICTS);
});

locationInput.addEventListener("keydown", (e) => {
  const dropdown = document.getElementById("locationDropdown");
  if (!dropdown) return;
  const items = dropdown.querySelectorAll("li");

  if      (e.key === "ArrowDown") { e.preventDefault(); dropdownIndex = (dropdownIndex + 1) % items.length;                  highlightDropdown(items); }
  else if (e.key === "ArrowUp")   { e.preventDefault(); dropdownIndex = (dropdownIndex - 1 + items.length) % items.length;   highlightDropdown(items); }
  else if (e.key === "Enter")     { e.preventDefault(); if (dropdownIndex >= 0) selectLocation(items[dropdownIndex].textContent); }
});

locationInput.addEventListener("blur", () => setTimeout(closeDropdown, 100));

// ── Init ──────────────────────────────────────────────────────
(function init() {
  const url = getFiltersFromURL();
  currentFilters = { blood: url.blood, location: url.location };
  currentPage    = url.page;

  // Sync blood radio from URL
  if (currentFilters.blood) {
    const radio = document.querySelector(`input[name="blood_group"][value="${currentFilters.blood}"]`);
    if (radio) radio.checked = true;
  }

  // Sync location input from URL
  locationInput.value = currentFilters.location;

  fetchDonors();
})();
