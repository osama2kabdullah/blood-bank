const donorListEl = document.getElementById("donorList");
const bloodRadios = document.querySelectorAll("input[name='bloodGroup']");
const locationInput = document.getElementById("location");

const API_BASE = "http://127.0.0.1:8787";

// Bangladesh 64 districts
const districts = [
  // Barishal Division
  "Barguna", "Barishal", "Bhola", "Jhalokathi", "Patuakhali", "Pirojpur",
  // Chattogram Division
  "Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Cumilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
  // Dhaka Division
  "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
  // Khulna Division
  "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
  // Mymensingh Division
  "Jamalpur", "Mymensingh", "Netrokona", "Sherpur",
  // Rajshahi Division
  "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj",
  // Rangpur Division
  "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
  // Sylhet Division
  "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"
];

// --- Render Loader ---
function showLoader() {
  donorListEl.innerHTML = `<p class="loading">Loading donors...</p>`;
}

// --- Render Donors ---
function renderDonors(donors) {
  if (!donors || donors.length === 0) {
    donorListEl.innerHTML = `<p class="no-donors">No donors found. Please adjust your filters or check back later.</p>`;
    return;
  }

  donorListEl.innerHTML = donors.map(donor => donorCardHTML(donor)).join("");
}

// --- Fetch Donors from API ---
async function fetchDonors(blood = "", location = "") {
  showLoader();
  try {
    const url = new URL(`${API_BASE}/donors`);
    if (blood) url.searchParams.set("blood_group", blood);
    if (location) url.searchParams.set("location", location);

    const res = await fetch(url.toString());
    const data = await res.json();
    renderDonors(data.data);
  } catch (err) {
    donorListEl.innerHTML = `<p class="no-donors">Failed to fetch donors. Try again later.</p>`;
    console.error(err);
  }
}

// --- Blood Group Click ---
bloodRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    fetchDonors(radio.value, locationInput.value.trim());
  });
});

// --- Location Input ---
let currentIndex = -1;

function renderDropdown(list) {
  let dropdown = document.getElementById("locationDropdown");

  if (!dropdown) {
    dropdown = document.createElement("ul");
    dropdown.id = "locationDropdown";
    locationInput.parentNode.appendChild(dropdown);
  }

  currentIndex = -1; // reset selection

  dropdown.innerHTML = list.map((d, i) => 
    `<li data-index="${i}">${d}</li>`
  ).join("");

  dropdown.querySelectorAll("li").forEach(li => {
    li.addEventListener("mousedown", () => {
      selectItem(li.textContent);
    });
  });
}

function selectItem(value) {
  locationInput.value = value;

  const dropdown = document.getElementById("locationDropdown");
  if (dropdown) dropdown.remove();

  const selectedBlood = document.querySelector("input[name='bloodGroup']:checked")?.value;
  if (selectedBlood) {
    fetchDonors(selectedBlood, value);
  }
}

// 🔹 Highlight active item
function highlightItem(items) {
  items.forEach(item => item.classList.remove("active"));

  if (currentIndex >= 0 && items[currentIndex]) {
    items[currentIndex].classList.add("active");
    const activeItem = items[currentIndex];
    if (activeItem) {
      activeItem.scrollIntoView({
        block: "nearest"
      });
    }
  }
}

// 🔹 Show all on focus
locationInput.addEventListener("focus", () => {
  renderDropdown(districts);
});

// 🔹 Filter on input
locationInput.addEventListener("input", () => {
  const val = locationInput.value.toLowerCase();

  if (!val) {
    renderDropdown(districts);
    return;
  }

  const matches = districts.filter(d =>
    d.toLowerCase().includes(val)
  );

  renderDropdown(matches);
});

// 🔹 Keyboard navigation
locationInput.addEventListener("keydown", (e) => {
  const dropdown = document.getElementById("locationDropdown");
  if (!dropdown) return;

  const items = dropdown.querySelectorAll("li");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    currentIndex = (currentIndex + 1) % items.length;
    highlightItem(items);
  }

  else if (e.key === "ArrowUp") {
    e.preventDefault();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    highlightItem(items);
  }

  else if (e.key === "Enter") {
    e.preventDefault();
    if (currentIndex >= 0 && items[currentIndex]) {
      selectItem(items[currentIndex].textContent);
    }
  }
});

// 🔹 Hide on blur
locationInput.addEventListener("blur", () => {
  setTimeout(() => {
    const dropdown = document.getElementById("locationDropdown");
    if (dropdown) dropdown.remove();
  }, 100);
});

// --- Initial Load ---
fetchDonors(); // default fetch all