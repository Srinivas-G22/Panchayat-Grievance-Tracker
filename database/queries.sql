-- =====================================================================
-- Panchayat Grievance Register and Resolution Tracker — SQL Queries
-- =====================================================================
-- Analytical and operational queries for administrative reporting
-- =====================================================================

-- 1. Open Complaints
SELECT 
    g.grievance_id,
    c.name AS citizen_name,
    w.name AS ward_name,
    d.name AS department_name,
    cat.name AS category_name,
    s.name AS status_name,
    o.name AS assigned_officer,
    g.date_filed,
    CAST(julianday('now') - julianday(g.date_filed) AS INTEGER) AS days_pending
FROM grievance g
JOIN citizen c ON g.citizen_id = c.citizen_id
JOIN ward w ON g.ward_id = w.ward_id
JOIN category cat ON g.category_id = cat.category_id
JOIN department d ON cat.dept_id = d.dept_id
JOIN status s ON g.status_id = s.status_id
JOIN officer o ON g.officer_id = o.officer_id
WHERE s.name = 'Open'
ORDER BY g.date_filed ASC;

-- 2. Resolved Complaints
SELECT 
    g.grievance_id,
    c.name AS citizen_name,
    w.name AS ward_name,
    d.name AS department_name,
    cat.name AS category_name,
    g.date_filed,
    g.date_resolved,
    CAST(julianday(g.date_resolved) - julianday(g.date_filed) AS INTEGER) AS resolution_days
FROM grievance g
JOIN citizen c ON g.citizen_id = c.citizen_id
JOIN ward w ON g.ward_id = w.ward_id
JOIN category cat ON g.category_id = cat.category_id
JOIN department d ON cat.dept_id = d.dept_id
JOIN status s ON g.status_id = s.status_id
WHERE s.name = 'Resolved'
ORDER BY g.date_resolved DESC;

-- 3. Pending > 15 Days (Urgent Action Required)
SELECT 
    g.grievance_id,
    c.name AS citizen_name,
    w.name AS ward_name,
    d.name AS department_name,
    s.name AS status_name,
    o.name AS assigned_officer,
    g.date_filed,
    CAST(julianday('now') - julianday(g.date_filed) AS INTEGER) AS days_pending
FROM grievance g
JOIN citizen c ON g.citizen_id = c.citizen_id
JOIN ward w ON g.ward_id = w.ward_id
JOIN category cat ON g.category_id = cat.category_id
JOIN department d ON cat.dept_id = d.dept_id
JOIN status s ON g.status_id = s.status_id
JOIN officer o ON g.officer_id = o.officer_id
WHERE s.name != 'Resolved'
  AND CAST(julianday('now') - julianday(g.date_filed) AS INTEGER) > 15
ORDER BY days_pending DESC;

-- 4. Department Summary (Counts & Metrics by Department)
SELECT 
    d.name AS department,
    COUNT(g.grievance_id) AS total_grievances,
    SUM(CASE WHEN s.name = 'Open' THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN s.name = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count,
    ROUND(AVG(CASE WHEN g.date_resolved IS NOT NULL 
        THEN CAST(julianday(g.date_resolved) - julianday(g.date_filed) AS REAL) 
        END), 1) AS avg_resolution_days
FROM department d
LEFT JOIN category cat ON d.dept_id = cat.dept_id
LEFT JOIN grievance g ON cat.category_id = g.category_id
LEFT JOIN status s ON g.status_id = s.status_id
GROUP BY d.dept_id, d.name
ORDER BY total_grievances DESC;

-- 5. Ward Summary (Geographic Breakdown)
SELECT 
    w.name AS ward_name,
    COUNT(g.grievance_id) AS total_grievances,
    SUM(CASE WHEN s.name != 'Resolved' THEN 1 ELSE 0 END) AS pending_count,
    SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count,
    SUM(g.affected_count) AS total_citizens_affected
FROM ward w
LEFT JOIN grievance g ON w.ward_id = g.ward_id
LEFT JOIN status s ON g.status_id = s.status_id
GROUP BY w.ward_id, w.name
ORDER BY w.ward_id ASC;

-- 6. Officer Workload Breakdown
SELECT 
    o.name AS officer_name,
    d.name AS department_name,
    COUNT(g.grievance_id) AS assigned_total,
    SUM(CASE WHEN s.name != 'Resolved' THEN 1 ELSE 0 END) AS active_workload,
    SUM(CASE WHEN s.name = 'Resolved' THEN 1 ELSE 0 END) AS completed_tasks
FROM officer o
JOIN department d ON o.dept_id = d.dept_id
LEFT JOIN grievance g ON o.officer_id = g.officer_id
LEFT JOIN status s ON g.status_id = s.status_id
GROUP BY o.officer_id, o.name, d.name
ORDER BY active_workload DESC;

-- 7. Average Resolution Time (Overall Portal Performance)
SELECT 
    COUNT(*) AS total_resolved,
    ROUND(AVG(julianday(date_resolved) - julianday(date_filed)), 2) AS avg_resolution_days,
    MIN(julianday(date_resolved) - julianday(date_filed)) AS min_days,
    MAX(julianday(date_resolved) - julianday(date_filed)) AS max_days
FROM grievance
WHERE date_resolved IS NOT NULL;

-- 8. Oldest Unresolved Complaints (Priority Dispatch Queue)
SELECT 
    g.grievance_id,
    cat.name AS category,
    d.name AS department,
    w.name AS ward,
    o.name AS officer,
    g.date_filed,
    CAST(julianday('now') - julianday(g.date_filed) AS INTEGER) AS days_waiting
FROM grievance g
JOIN category cat ON g.category_id = cat.category_id
JOIN department d ON cat.dept_id = d.dept_id
JOIN ward w ON g.ward_id = w.ward_id
JOIN officer o ON g.officer_id = o.officer_id
JOIN status s ON g.status_id = s.status_id
WHERE s.name != 'Resolved'
ORDER BY g.date_filed ASC;

-- 9. Complaint History Timeline for a Specific Grievance (e.g. ID 1002)
SELECT 
    gh.history_id,
    gh.grievance_id,
    s.name AS new_status,
    o.name AS changed_by_officer,
    gh.changed_at,
    gh.notes
FROM grievance_history gh
JOIN status s ON gh.status_id = s.status_id
JOIN officer o ON gh.changed_by = o.officer_id
WHERE gh.grievance_id = 1002
ORDER BY gh.changed_at ASC;

-- 10. Monthly Grievance Breakdown
SELECT 
    strftime('%Y-%m', date_filed) AS month,
    COUNT(*) AS total_filed,
    SUM(CASE WHEN date_resolved IS NOT NULL THEN 1 ELSE 0 END) AS resolved_in_period
FROM grievance
GROUP BY strftime('%Y-%m', date_filed)
ORDER BY month ASC;
