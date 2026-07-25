/**
 * Integration / API unit test for Express endpoints.
 * Starts the server, sends HTTP requests to all endpoints, checks responses,
 * and shuts down cleanly.
 *
 * Run: node tests/test-api.js
 */
import http from 'node:http';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const PORT = 5099;
const SERVER_PATH = join(import.meta.dirname, '..', 'server', 'index.js');

function fetchJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('=== Express API Integration Tests ===\n');

  // Spawn server on custom test port
  const server = spawn('node', [SERVER_PATH], {
    env: { ...process.env, PORT: PORT.toString() },
    stdio: 'pipe'
  });

  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      console.log(`  PASS: ${label}`);
    } else {
      console.log(`  FAIL: ${label}`);
      failed++;
    }
  }

  // Wait 1.5 seconds for server boot
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // 1. GET /api/grievances
    const grievances = await fetchJson('/api/grievances');
    assert(Array.isArray(grievances) && grievances.length >= 15, 'GET /api/grievances returns array of grievances');
    assert(grievances[0].id !== undefined && grievances[0].citizen !== undefined, 'Grievance object has required properties');

    // 2. GET /api/grievances?department=Drainage
    const drainage = await fetchJson('/api/grievances?department=Drainage');
    assert(drainage.every(g => g.department === 'Drainage'), 'GET /api/grievances?department=Drainage filters correctly');

    // 3. GET /api/grievances?status=Open
    const openGrievances = await fetchJson('/api/grievances?status=Open');
    assert(openGrievances.every(g => g.status === 'Open'), 'GET /api/grievances?status=Open filters correctly');

    // 4. GET /api/statistics
    const stats = await fetchJson('/api/statistics');
    assert(stats.total >= 15, 'GET /api/statistics returns total count');
    assert(stats.open >= 1 && stats.resolved >= 1, 'GET /api/statistics includes open and resolved counts');
    assert(typeof stats.avgResolutionDays === 'number', 'GET /api/statistics includes avgResolutionDays');

    // 5. GET /api/grievances/1002
    const single = await fetchJson('/api/grievances/1002');
    assert(single.id === 1002 && single.citizen === 'Suresh Babu', 'GET /api/grievances/1002 returns correct grievance');
    assert(Array.isArray(single.history) && single.history.length > 0, 'GET /api/grievances/1002 includes history log');

    // 6. GET /api/history/1002
    const history = await fetchJson('/api/history/1002');
    assert(Array.isArray(history) && history.length >= 2, 'GET /api/history/1002 returns status timeline');

  } catch (err) {
    console.error('Test execution error:', err.stack || err.message);
    failed++;
  } finally {
    server.kill();
  }

  console.log(`\n=== API Results: ${failed === 0 ? 'All passed' : `${failed} failed`} ===`);
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
