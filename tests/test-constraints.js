/**
 * Constraint Tests for the Panchayat Grievance Tracker database.
 *
 * Attempts each invalid insert that a constraint is meant to stop,
 * records the exact error the database returns, then confirms a
 * valid record still inserts successfully.
 *
 * Run:  node tests/test-constraints.js
 */
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DB_PATH = join(__dirname, '..', 'database', 'grievances.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    passed++;
  } catch (err) {
    console.log('  FAIL: ' + name);
    console.log('    Error: ' + err.message);
    failed++;
  }
}

function expectThrow(fn, expectedSubstring) {
  try {
    fn();
    throw new Error('Expected error containing "' + expectedSubstring + '" but none was thrown');
  } catch (err) {
    const msg = err.message.toLowerCase();
    const expected = expectedSubstring.toLowerCase();
    if (!msg.includes(expected)) {
      throw new Error('Expected error containing "' + expectedSubstring + '" but got: ' + err.message, { cause: err });
    }
    console.log('    SQLite error: ' + err.message);
  }
}

function insertGrievance(overrides) {
  const defaults = {
    citizen_id: 1, ward_id: 1, category_id: 1, status_id: 1, officer_id: 1,
    date_filed: '2026-07-20', description: 'Test description', priority: 3, affected_count: 10
  };
  const vals = Object.assign({}, defaults, overrides);
  return db.prepare(
    'INSERT INTO grievance (citizen_id, ward_id, category_id, status_id, officer_id, date_filed, description, priority, affected_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(
    vals.citizen_id, vals.ward_id, vals.category_id, vals.status_id,
    vals.officer_id, vals.date_filed, vals.description, vals.priority, vals.affected_count
  );
}

console.log('=== Constraint Tests ===\n');

console.log('1. Foreign Key Constraint (non-existent ward)');
test('Insert with non-existent ward_id should fail', () => {
  expectThrow(() => insertGrievance({ ward_id: 999 }), 'FOREIGN KEY constraint failed');
});

console.log('2. Foreign Key Constraint (non-existent citizen)');
test('Insert with non-existent citizen_id should fail', () => {
  expectThrow(() => insertGrievance({ citizen_id: 999 }), 'FOREIGN KEY constraint failed');
});

console.log('3. CHECK Constraint (priority = 0)');
test('Insert with priority = 0 should fail', () => {
  expectThrow(() => insertGrievance({ priority: 0 }), 'CHECK constraint failed');
});

console.log('4. CHECK Constraint (affected_count = 0)');
test('Insert with affected_count = 0 should fail', () => {
  expectThrow(() => insertGrievance({ affected_count: 0 }), 'CHECK constraint failed');
});

console.log('5. Trigger Constraint (date_filed in future)');
test('Insert with future date_filed should fail', () => {
  expectThrow(() => insertGrievance({ date_filed: '2099-12-31' }), 'future');
});

console.log('6. UNIQUE Constraint (duplicate department)');
test('Insert duplicate department name should fail', () => {
  expectThrow(() => db.prepare('INSERT INTO department (name) VALUES (?)').run('Drainage'), 'UNIQUE constraint failed');
});

console.log('7. UNIQUE Constraint (duplicate ward)');
test('Insert duplicate ward name should fail', () => {
  expectThrow(() => db.prepare('INSERT INTO ward (name) VALUES (?)').run('Ward 1'), 'UNIQUE constraint failed');
});

console.log('8. NOT NULL Constraint (missing description)');
test('Insert with NULL description should fail', () => {
  expectThrow(() => {
    db.prepare('INSERT INTO grievance (citizen_id, ward_id, category_id, status_id, officer_id, date_filed, description, priority, affected_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(1, 1, 1, 1, 1, '2026-07-20', null, 3, 10);
  }, 'NOT NULL constraint failed');
});

console.log('9. CHECK Constraint (empty description)');
test('Insert with empty description should fail', () => {
  expectThrow(() => insertGrievance({ description: '' }), 'CHECK constraint failed');
});

console.log('10. CHECK Constraint (priority = 6)');
test('Insert with priority = 6 should fail', () => {
  expectThrow(() => insertGrievance({ priority: 6 }), 'CHECK constraint failed');
});

console.log('11. UNIQUE Constraint (duplicate category in department)');
test('Insert duplicate category within same department should fail', () => {
  expectThrow(() => db.prepare('INSERT INTO category (name, dept_id) VALUES (?, ?)').run('Blocked Drain', 1), 'UNIQUE constraint failed');
});

console.log('12. Valid Insert (after all constraint failures)');
test('Insert valid grievance should succeed', () => {
  const result = insertGrievance({ description: 'Valid test grievance' });
  if (result.changes !== 1) throw new Error('Expected 1 row inserted, got ' + result.changes);
  db.prepare('DELETE FROM grievance WHERE grievance_id = ?').run(result.lastInsertRowid);
});

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
db.close();
process.exit(failed > 0 ? 1 : 0);
