/**
 * All 64 Districts of Bangladesh
 * Grouped by Division for better organization
 */

export interface Location {
  label: string;
  value: string;
}

const LOCATIONS: Location[] = [
  { label: 'Barguna', value: 'barguna' },
  { label: 'Barishal', value: 'barishal' },
  { label: 'Bhola', value: 'bhola' },
  { label: 'Jhalokathi', value: 'jhalokathi' },
  { label: 'Patuakhali', value: 'patuakhali' },
  { label: 'Pirojpur', value: 'pirojpur' },

  // --- Chattogram Division ---
  { label: 'Bandarban', value: 'bandarban' },
  { label: 'Brahmanbaria', value: 'brahmanbaria' },
  { label: 'Chandpur', value: 'chandpur' },
  { label: 'Chattogram', value: 'chattogram' },
  { label: 'Cumilla', value: 'cumilla' },
  { label: 'Cox\'s Bazar', value: 'coxsbazar' },
  { label: 'Feni', value: 'feni' },
  { label: 'Khagrachari', value: 'khagrachari' },
  { label: 'Lakshmipur', value: 'lakshmipur' },
  { label: 'Noakhali', value: 'noakhali' },
  { label: 'Rangamati', value: 'rangamati' },

  // --- Dhaka Division ---
  { label: 'Dhaka', value: 'dhaka' },
  { label: 'Faridpur', value: 'faridpur' },
  { label: 'Gazipur', value: 'gazipur' },
  { label: 'Gopalganj', value: 'gopalganj' },
  { label: 'Kishoreganj', value: 'kishoreganj' },
  { label: 'Madaripur', value: 'madaripur' },
  { label: 'Manikganj', value: 'manikganj' },
  { label: 'Munshiganj', value: 'munshiganj' },
  { label: 'Narayanganj', value: 'narayanganj' },
  { label: 'Narsingdi', value: 'narsingdi' },
  { label: 'Rajbari', value: 'rajbari' },
  { label: 'Shariatpur', value: 'shariatpur' },
  { label: 'Tangail', value: 'tangail' },

  // --- Khulna Division ---
  { label: 'Bagerhat', value: 'bagerhat' },
  { label: 'Chuadanga', value: 'chuadanga' },
  { label: 'Jashore', value: 'jashore' },
  { label: 'Jhenaidah', value: 'jhenaidah' },
  { label: 'Khulna', value: 'khulna' },
  { label: 'Kushtia', value: 'kushtia' },
  { label: 'Magura', value: 'magura' },
  { label: 'Meherpur', value: 'meherpur' },
  { label: 'Narail', value: 'narail' },
  { label: 'Satkhira', value: 'satkhira' },

  // --- Mymensingh Division ---
  { label: 'Jamalpur', value: 'jamalpur' },
  { label: 'Mymensingh', value: 'mymensingh' },
  { label: 'Netrokona', value: 'netrokona' },
  { label: 'Sherpur', value: 'sherpur' },

  // --- Rajshahi Division ---
  { label: 'Bogra', value: 'bogra' },
  { label: 'Joypurhat', value: 'joypurhat' },
  { label: 'Naogaon', value: 'naogaon' },
  { label: 'Natore', value: 'natore' },
  { label: 'Chapainawabganj', value: 'chapainawabganj' },
  { label: 'Pabna', value: 'pabna' },
  { label: 'Rajshahi', value: 'rajshahi' },
  { label: 'Sirajganj', value: 'sirajganj' },

  // --- Rangpur Division ---
  { label: 'Dinajpur', value: 'dinajpur' },
  { label: 'Gaibandha', value: 'gaibandha' },
  { label: 'Kurigram', value: 'kurigram' },
  { label: 'Lalmonirhat', value: 'lalmonirhat' },
  { label: 'Nilphamari', value: 'nilphamari' },
  { label: 'Panchagarh', value: 'panchagarh' },
  { label: 'Rangpur', value: 'rangpur' },
  { label: 'Thakurgaon', value: 'thakurgaon' },

  // --- Sylhet Division ---
  { label: 'Habiganj', value: 'habiganj' },
  { label: 'Moulvibazar', value: 'moulvibazar' },
  { label: 'Sunamganj', value: 'sunamganj' },
  { label: 'Sylhet', value: 'sylhet' },
];

export default LOCATIONS;