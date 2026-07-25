/**
 * Checks the static JSON dataset used by the React interface.
 * Run: node tests/test-data.js
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const file = join(import.meta.dirname, '..', 'public', 'grievances.json');
const grievances = JSON.parse(readFileSync(file, 'utf8'));
const required = ['id', 'citizen', 'ward', 'department', 'category', 'status', 'date', 'assignedOfficer', 'description', 'priority', 'affectedCount'];
const validStatuses = new Set(['Open', 'In Progress', 'Resolved']);

let failed = 0;
function check(condition, message) {
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${message}`);
  if (!condition) failed++;
}

check(Array.isArray(grievances) && grievances.length >= 10, 'dataset has at least 10 grievances');
check(new Set(grievances.map((g) => g.id)).size === grievances.length, 'every grievance ID is unique');

for (const grievance of grievances) {
  check(required.every((field) => grievance[field] !== undefined && grievance[field] !== ''), `grievance ${grievance.id} has all required fields`);
  check(validStatuses.has(grievance.status), `grievance ${grievance.id} has a valid status`);
  check(Number.isInteger(grievance.priority) && grievance.priority >= 1 && grievance.priority <= 5, `grievance ${grievance.id} has priority 1–5`);
  check(Number.isInteger(grievance.affectedCount) && grievance.affectedCount >= 1, `grievance ${grievance.id} has a positive affected count`);
  if (grievance.status === 'Resolved') {
    check(Boolean(grievance.dateResolved), `resolved grievance ${grievance.id} includes a resolution date`);
  }
}

console.log(`\n${failed === 0 ? 'All data checks passed.' : `${failed} data check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
