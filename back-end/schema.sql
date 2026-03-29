CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  location TEXT,
  last_donation DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blood_group ON users(blood_group);
CREATE INDEX idx_location ON users(location);