import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_PATH = join(import.meta.dirname, '..', 'database', 'grievances.db');

function getDbConnection() {
  if (!existsSync(DB_PATH)) {
    throw new Error(`Database file not found at ${DB_PATH}. Run 'npm run db:init' first.`);
  }
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

// Helper: map SQLite join row to standard JSON representation
function formatGrievanceRow(row) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filedDate = new Date(`${row.date_filed}T00:00:00`);
  const daysPending = row.status === 'Resolved'
    ? null
    : Math.max(0, Math.floor((today - filedDate) / (1000 * 60 * 60 * 24)));

  let resolutionDays = null;
  if (row.status === 'Resolved' && row.date_resolved) {
    const resolvedDate = new Date(`${row.date_resolved}T00:00:00`);
    resolutionDays = Math.max(0, Math.floor((resolvedDate - filedDate) / (1000 * 60 * 60 * 24)));
  }

  return {
    id: row.grievance_id,
    citizen: row.citizen_name,
    citizenPhone: row.citizen_phone || '',
    ward: row.ward_name,
    department: row.dept_name,
    category: row.category_name,
    status: row.status_name,
    date: row.date_filed,
    dateResolved: row.date_resolved || null,
    priority: row.priority,
    affectedCount: row.affected_count,
    assignedOfficer: row.officer_name,
    description: row.description,
    daysPending,
    resolutionDays
  };
}

/**
 * GET /api/grievances
 * Supports query parameters: search, department, status, ward, sort
 */
app.get('/api/grievances', (req, res) => {
  let db;
  try {
    db = getDbConnection();

    const { search, department, status, ward, sort } = req.query;

    let query = `
      SELECT 
        g.grievance_id,
        c.name AS citizen_name,
        c.phone AS citizen_phone,
        w.name AS ward_name,
        d.name AS dept_name,
        cat.name AS category_name,
        s.name AS status_name,
        o.name AS officer_name,
        g.date_filed,
        g.date_resolved,
        g.description,
        g.priority,
        g.affected_count
      FROM grievance g
      JOIN citizen c ON g.citizen_id = c.citizen_id
      JOIN ward w ON g.ward_id = w.ward_id
      JOIN category cat ON g.category_id = cat.category_id
      JOIN department d ON cat.dept_id = d.dept_id
      JOIN status s ON g.status_id = s.status_id
      JOIN officer o ON g.officer_id = o.officer_id
      WHERE 1=1
    `;

    const params = [];

    if (department && department !== 'All Departments' && department !== 'All') {
      query += ` AND d.name = ?`;
      params.push(department);
    }

    if (status && status !== 'All Status' && status !== 'All') {
      query += ` AND s.name = ?`;
      params.push(status);
    }

    if (ward && ward !== 'All Wards' && ward !== 'All') {
      query += ` AND w.name = ?`;
      params.push(ward);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(CAST(g.grievance_id AS TEXT)) LIKE ? OR
        LOWER(c.name) LIKE ? OR
        LOWER(w.name) LIKE ? OR
        LOWER(d.name) LIKE ? OR
        LOWER(cat.name) LIKE ? OR
        LOWER(o.name) LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    // Default sorting: Unresolved cases first (ordered by oldest date_filed / highest pending days), with Resolved cases at the very end
    if (sort === 'newest') {
      query += ` ORDER BY g.date_filed DESC, g.grievance_id DESC`;
    } else if (sort === 'longest_pending') {
      query += ` ORDER BY CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END ASC, g.date_filed ASC, g.grievance_id ASC`;
    } else if (sort === 'recently_updated') {
      query += ` ORDER BY COALESCE(g.date_resolved, g.date_filed) DESC`;
    } else {
      // Default: Oldest unresolved complaints first (highest days pending), resolved at last
      query += ` ORDER BY CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END ASC, g.date_filed ASC, g.grievance_id ASC`;
    }

    const rows = db.prepare(query).all(...params);
    const result = rows.map(formatGrievanceRow);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
});

/**
 * GET /api/statistics
 */
app.get('/api/statistics', (req, res) => {
  let db;
  try {
    db = getDbConnection();

    const counts = db.prepare(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN s.name = 'Open' THEN 1 ELSE 0 END) AS open,
        SUM(CASE WHEN s.name = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved
      FROM grievance g
      JOIN status s ON g.status_id = s.status_id
    `).get();

    const avgRes = db.prepare(`
      SELECT ROUND(AVG(julianday(date_resolved) - julianday(date_filed)), 1) AS avgDays
      FROM grievance
      WHERE date_resolved IS NOT NULL
    `).get();

    const longestPending = db.prepare(`
      SELECT 
        g.grievance_id,
        CAST(julianday('now') - julianday(g.date_filed) AS INTEGER) AS maxDays
      FROM grievance g
      JOIN status s ON g.status_id = s.status_id
      WHERE s.name != 'Resolved'
      ORDER BY g.date_filed ASC
      LIMIT 1
    `).get();

    res.json({
      total: counts.total || 0,
      open: counts.open || 0,
      inProgress: counts.inProgress || 0,
      resolved: counts.resolved || 0,
      avgResolutionDays: avgRes.avgDays !== null ? avgRes.avgDays : 0,
      longestPendingDays: longestPending ? longestPending.maxDays : 0,
      longestPendingId: longestPending ? longestPending.grievance_id : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
});

/**
 * GET /api/history/:id
 */
app.get('/api/history/:id', (req, res) => {
  let db;
  try {
    db = getDbConnection();
    const grievanceId = Number(req.params.id);

    const historyRows = db.prepare(`
      SELECT 
        gh.history_id,
        gh.grievance_id,
        s.name AS status,
        o.name AS changed_by,
        gh.changed_at,
        gh.notes
      FROM grievance_history gh
      JOIN status s ON gh.status_id = s.status_id
      JOIN officer o ON gh.changed_by = o.officer_id
      WHERE gh.grievance_id = ?
      ORDER BY gh.changed_at ASC, gh.history_id ASC
    `).all(grievanceId);

    res.json(historyRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
});

/**
 * GET /api/grievances/:id
 */
app.get('/api/grievances/:id', (req, res) => {
  let db;
  try {
    db = getDbConnection();
    const grievanceId = Number(req.params.id);

    const row = db.prepare(`
      SELECT 
        g.grievance_id,
        c.name AS citizen_name,
        c.phone AS citizen_phone,
        w.name AS ward_name,
        d.name AS dept_name,
        cat.name AS category_name,
        s.name AS status_name,
        o.name AS officer_name,
        g.date_filed,
        g.date_resolved,
        g.description,
        g.priority,
        g.affected_count
      FROM grievance g
      JOIN citizen c ON g.citizen_id = c.citizen_id
      JOIN ward w ON g.ward_id = w.ward_id
      JOIN category cat ON g.category_id = cat.category_id
      JOIN department d ON cat.dept_id = d.dept_id
      JOIN status s ON g.status_id = s.status_id
      JOIN officer o ON g.officer_id = o.officer_id
      WHERE g.grievance_id = ?
    `).get(grievanceId);

    if (!row) {
      return res.status(404).json({ error: `Grievance #${grievanceId} not found` });
    }

    const formatted = formatGrievanceRow(row);

    // Fetch history
    const historyRows = db.prepare(`
      SELECT 
        gh.history_id,
        gh.grievance_id,
        s.name AS status,
        o.name AS changed_by,
        gh.changed_at,
        gh.notes
      FROM grievance_history gh
      JOIN status s ON gh.status_id = s.status_id
      JOIN officer o ON gh.changed_by = o.officer_id
      WHERE gh.grievance_id = ?
      ORDER BY gh.changed_at ASC, gh.history_id ASC
    `).all(grievanceId);

    formatted.history = historyRows;

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (db) db.close();
  }
});

app.listen(PORT, () => {
  console.log(`Panchayat Grievance Tracker API running on http://localhost:${PORT}`);
});
