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

  donorListEl.innerHTML = donors.map(d => `
    <div class="donor-card">
      <div class="card-header">
        <h3>${d.name}</h3>
        <span class="blood-badge">${d.blood_group}</span>
      </div>
      <div class="location">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>
        <span>${d.location || "N/A"}</span>
      </div>
      <p class="donation">Last Donation: ${d.last_donation || "N/A"}</p>
      <div class="contact">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
        </svg>
        <span>${d.phone}</span>
      </div>
    </div>
  `).join('');
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