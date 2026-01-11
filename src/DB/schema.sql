PRAGMA foreign_keys = ON;


CREATE TABLE IF NOT EXISTS requests(
	id TEXT PRIMARY KEY,
	buyer_id TEXT NOT NULL,
	factory_id TEXT NOT NULL,
	title TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'PENDING',
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS  request_items (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  fulfilled_evidence_version_id TEXT,
  fulfilled_at DATETIME,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  factory_id TEXT NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLEIF NOT EXISTS  evidence_versions (
  id TEXT PRIMARY KEY,
  evidence_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  expiry DATE,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE,
  UNIQUE (evidence_id, version_number)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  metadata TEXT
);
