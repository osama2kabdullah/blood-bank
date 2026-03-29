// utils/hash.js

// Convert string → ArrayBuffer
function encode(str) {
  return new TextEncoder().encode(str);
}

// Convert buffer → hex string
function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// 🔐 Hash password
export async function hashPassword(password) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encode(password));
  return toHex(hashBuffer);
}

// 🔐 Compare password
export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}