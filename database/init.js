#!/usr/bin/env node
/**
 * Database initialization script.
 * Reads schema.sql and seed.sql, creates the SQLite database file,
 * and populates it with seed data.
 *
 * Usage:  node database/init.js
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DB_PATH = join(import.meta.dirname, 'grievances.db');
const SCHEMA_PATH = join(import.meta.dirname, 'schema.sql');
const SEED_PATH = join(import.meta.dirname, 'seed.sql');

// Remove existing database so we start fresh
if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
  console.log('Removed existing database.');
}

// Read SQL files
const schemaSql = readFileSync(SCHEMA_PATH, 'utf8');
const seedSql = readFileSync(SEED_PATH, 'utf8');

// Create and initialize the database
const db = new DatabaseSync(DB_PATH);

try {
  // Enable foreign key enforcement
  db.exec('PRAGMA foreign_keys = ON;');

  // Run schema (CREATE TABLE statements)
  db.exec(schemaSql);
  console.log('Schema created successfully.');

  // Run seed data (INSERT statements)
  db.exec(seedSql);
  console.log('Seed data inserted successfully.');

  // Verify
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all();
  console.log('\nTables created:');
  tables.forEach(t => console.log('  - ' + t.name));

  const grievanceCount = db.prepare('SELECT COUNT(*) as cnt FROM grievance').get();
  const historyCount = db.prepare('SELECT COUNT(*) as cnt FROM grievance_history').get();
  console.log(`\nGrievances: ${grievanceCount.cnt}`);
  console.log(`History entries: ${historyCount.cnt}`);

  console.log('\nDatabase initialized at: ' + DB_PATH);
} catch (err) {
  console.error('Error initializing database:', err.message);
  process.exit(1);
} finally {
  db.close();
}
