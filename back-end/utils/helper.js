import { hashPassword} from "../utils/hash.js";

async function createUser(db, name, phone, password) {
  const hashed = await hashPassword(password);
  const result = await db.prepare(
    "INSERT INTO users (name, phone, password) VALUES (?, ?, ?)"
  ).bind(name, phone, hashed).run();
  return result.meta.last_row_id;
}

async function claimOrCreateDonor(db, userId, { name, phone, blood_group, location, last_donation }) {
  const existing = await db.prepare(
    "SELECT id FROM donors WHERE phone = ?"
  ).bind(phone).first();

  if (existing) {
    const fields = ["claimed_by_user_id = ?"];
    const values = [userId];

    if (name)          { fields.push("name = ?");          values.push(name); }
    if (blood_group)   { fields.push("blood_group = ?");   values.push(blood_group.toUpperCase()); }
    if (location)      { fields.push("location = ?");      values.push(location); }
    if (last_donation) { fields.push("last_donation = ?"); values.push(last_donation); }

    await db.prepare(
      `UPDATE donors SET ${fields.join(", ")} WHERE phone = ?`
    ).bind(...values, phone).run();
  } else {
    await db.prepare(
      "INSERT INTO donors (name, phone, blood_group, location, last_donation, claimed_by_user_id) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(name, phone, blood_group.toUpperCase(), location, last_donation || null, userId).run();
  }

  return db.prepare(
    "SELECT * FROM donors WHERE claimed_by_user_id = ?"
  ).bind(userId).first();
}

export {createUser, claimOrCreateDonor}