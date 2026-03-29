// dummyDonors.js

const districts = [
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet",
  "Barishal", "Rangpur", "Mymensingh", "Gazipur", "Narsingdi",
  "Comilla", "Jessore", "Bogra", "Tangail", "Cox's Bazar",
  "Narail", "Pabna", "Sirajganj", "Dinajpur", "Faridpur"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const names = [
  "John", "Jane", "Ali", "Sara", "Mina", "Rafiq", "Nabila", "Tariq",
  "Fatema", "Karim", "Sadia", "Rahim", "Imran", "Laila", "Hasan", "Rina",
  "Jamil", "Tahmina", "Faruk", "Anika"
];

function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

export const dummyDonors = [];

for (let i = 1; i <= 100; i++) {
  const name = `${names[Math.floor(Math.random() * names.length)]} ${names[Math.floor(Math.random() * names.length)]}`;
  const phone = `0171${(10000000 + i).toString().padStart(7, "0")}`;
  const password = "1234";
  const blood_group = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
  const location = districts[Math.floor(Math.random() * districts.length)];
  const last_donation = getRandomDate(new Date(2023, 0, 1), new Date(2024, 2, 28));

  dummyDonors.push({ name, phone, password, blood_group, location, last_donation });
}