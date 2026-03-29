import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export async function generateToken(payload, secret) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // token valid for 7 days
    .sign(encoder.encode(secret));
}

export async function verifyToken(token, secret) {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload;
  } catch (err) {
    return null;
  }
}