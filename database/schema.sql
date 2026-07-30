-- =====================================================================
-- Panchayat Grievance Tracker — Database Schema
-- =====================================================================
-- This schema normalizes grievance data across 8 tables instead of
-- storing everything in one flat table. Every foreign key, NOT NULL,
-- CHECK, and UNIQUE constraint here prevents a specific recording
-- mistake that would otherwise corrupt the data.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------
-- ward
-- ---------------------------------------------------------------------
CREATE TABLE ward (
    ward_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL UNIQUE CHECK (name != '')
);

-- ---------------------------------------------------------------------
-- department
-- ---------------------------------------------------------------------
CREATE TABLE department (
    dept_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL UNIQUE CHECK (name != '')
);

-- ---------------------------------------------------------------------
-- category  (belongs to a department)
-- ---------------------------------------------------------------------
CREATE TABLE category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL CHECK (name != ''),
    dept_id     INTEGER NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES department (dept_id),
    -- Prevent the same category name within the same department
    UNIQUE (name, dept_id)
);

-- ---------------------------------------------------------------------
-- status
-- ---------------------------------------------------------------------
CREATE TABLE status (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL UNIQUE CHECK (name != '')
);

-- ---------------------------------------------------------------------
-- citizen
-- ---------------------------------------------------------------------
--before change---
--CREATE TABLE citizen (
--    citizen_id INTEGER PRIMARY KEY AUTOINCREMENT,
--    name       TEXT    NOT NULL CHECK (name != ''),
--    phone      TEXT,
--    address    TEXT
--);

--after change---
CREATE TABLE citizen (
    citizen_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT
);

-- ---------------------------------------------------------------------
-- officer  (belongs to a department)
-- ---------------------------------------------------------------------
CREATE TABLE officer (
    officer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL CHECK (name != ''),
    dept_id    INTEGER NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES department (dept_id)
);

-- ---------------------------------------------------------------------
-- grievance  (core record)
-- ---------------------------------------------------------------------
CREATE TABLE grievance (
    grievance_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    citizen_id      INTEGER NOT NULL,
    ward_id         INTEGER NOT NULL,
    category_id     INTEGER NOT NULL,
    status_id       INTEGER NOT NULL,
    officer_id      INTEGER NOT NULL,
    date_filed      DATE    NOT NULL,
    description     TEXT    NOT NULL CHECK (description != ''),
    priority        INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
    affected_count  INTEGER NOT NULL CHECK (affected_count >= 1),
    date_resolved   DATE    CHECK (date_resolved IS NULL OR date_resolved >= date_filed),
    FOREIGN KEY (citizen_id)  REFERENCES citizen   (citizen_id),
    FOREIGN KEY (ward_id)     REFERENCES ward      (ward_id),
    FOREIGN KEY (category_id) REFERENCES category  (category_id),
    FOREIGN KEY (status_id)   REFERENCES status    (status_id),
    FOREIGN KEY (officer_id)  REFERENCES officer   (officer_id)
);

-- ---------------------------------------------------------------------
-- Trigger: prevent date_filed from being in the future
-- SQLite does not allow non-deterministic functions like date('now')
-- in CHECK constraints, so we use a trigger instead.
-- ---------------------------------------------------------------------
CREATE TRIGGER tr_grievance_date_filed_not_future
    BEFORE INSERT ON grievance
    FOR EACH ROW
    WHEN NEW.date_filed > date('now')
BEGIN
    SELECT RAISE(ABORT, 'date_filed cannot be in the future');
END;

CREATE TRIGGER tr_grievance_date_filed_not_future_update
    BEFORE UPDATE OF date_filed ON grievance
    FOR EACH ROW
    WHEN NEW.date_filed > date('now')
BEGIN
    SELECT RAISE(ABORT, 'date_filed cannot be in the future');
END;

-- ---------------------------------------------------------------------
-- Trigger: prevent date_resolved from being in the future
-- ---------------------------------------------------------------------
CREATE TRIGGER tr_grievance_date_resolved_not_future
    BEFORE INSERT ON grievance
    FOR EACH ROW
    WHEN NEW.date_resolved IS NOT NULL AND NEW.date_resolved > date('now')
BEGIN
    SELECT RAISE(ABORT, 'date_resolved cannot be in the future');
END;

CREATE TRIGGER tr_grievance_date_resolved_not_future_update
    BEFORE UPDATE OF date_resolved ON grievance
    FOR EACH ROW
    WHEN NEW.date_resolved IS NOT NULL AND NEW.date_resolved > date('now')
BEGIN
    SELECT RAISE(ABORT, 'date_resolved cannot be in the future');
END;

-- ---------------------------------------------------------------------
-- grievance_history  (append-only log of every status change)
-- ---------------------------------------------------------------------
CREATE TABLE grievance_history (
    history_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    status_id    INTEGER NOT NULL,
    changed_by   INTEGER NOT NULL,
    changed_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes        TEXT,
    FOREIGN KEY (grievance_id) REFERENCES grievance (grievance_id),
    FOREIGN KEY (status_id)    REFERENCES status    (status_id),
    FOREIGN KEY (changed_by)   REFERENCES officer   (officer_id)
);

CREATE TABLE citizen (
    citizen_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    address TEXT
);

-- ---------------------------------------------------------------------
-- Indexes for Performance & Analytical Query Optimization
-- ---------------------------------------------------------------------
CREATE INDEX idx_grievance_status_id ON grievance(status_id);
CREATE INDEX idx_grievance_ward_id   ON grievance(ward_id);
CREATE INDEX idx_grievance_category_id ON grievance(category_id);
CREATE INDEX idx_grievance_officer_id ON grievance(officer_id);
CREATE INDEX idx_grievance_date_filed ON grievance(date_filed);
CREATE INDEX idx_history_grievance_id ON grievance_history(grievance_id);

