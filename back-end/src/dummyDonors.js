// dummyDonors.js

const districts = [
  "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet",
  "Barishal", "Rangpur", "Mymensingh", "Gazipur", "Narsingdi",
  "Comilla", "Jessore", "Bogra", "Tangail", "Cox's Bazar",
  "Narail", "Pabna", "Sirajganj", "Dinajpur", "Faridpur"
];

const blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const names = [
  "John", "Jane", "Ali", "Sara", "Mina", "Rafiq", "Nabila", "Tariq",
  "Fatema", "Karim", "Sadia", "Rahim", "Imran", "Laila", "Hasan", "Rina",
  "Jamil", "Tahmina", "Faruk", "Anika"
];

function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split("T")[0];
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const dummyDonors = Array.from({ length: 500 }, (_, i) => ({
  name:          `${rand(names)} ${rand(names)}`,
  phone:         `0171${String(10000000 + i + 1).padStart(7, "0")}`,
  blood_group:   rand(blood_groups),
  location:      rand(districts),
  last_donation: getRandomDate(new Date(2023, 0, 1), new Date(2024, 2, 28)),
}));