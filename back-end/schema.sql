CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  name TEXT,
  phone TEXT NOT NULL UNIQUE,
  blood_group TEXT NOT NULL,
  location TEXT NOT NULL,
  last_donation DATE,

  added_by_user_id INTEGER,         -- who added this donor
  claimed_by_user_id INTEGER,       -- if donor registers later

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (added_by_user_id) REFERENCES users(id),
  FOREIGN KEY (claimed_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_donors_blood_group ON donors(blood_group);
CREATE INDEX idx_donors_location ON donors(location);
CREATE INDEX idx_donors_phone ON donors(phone);