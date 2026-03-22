PRAGMA foreign_keys = ON;

CREATE TABLE service_briefs (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK(service_type IN ('Dry Cleaning', 'Wash & Fold', 'Alterations', 'Pickup Coordination')),
  due_date TEXT NOT NULL,
  priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 3),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'ready')),
  notes TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE INDEX idx_service_briefs_status_due_date ON service_briefs(status, due_date, priority DESC);
