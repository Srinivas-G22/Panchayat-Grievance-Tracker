-- =====================================================================
-- Panchayat Grievance Tracker — Seed Data
-- =====================================================================
-- Inserts realistic data across all 8 tables. The 17 grievances
-- correspond to the original JSON records (15) plus 2 additional
-- records, now normalized and enriched with priority, affected_count,
-- resolution dates, and history entries that demonstrate the
-- append-only history table.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Wards (Ward 1 through Ward 6)
-- ---------------------------------------------------------------------
INSERT INTO ward (ward_id, name) VALUES
    (1, 'Ward 1'),
    (2, 'Ward 2'),
    (3, 'Ward 3'),
    (4, 'Ward 4'),
    (5, 'Ward 5'),
    (6, 'Ward 6');

-- ---------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------
INSERT INTO department (dept_id, name) VALUES
    (1, 'Drainage'),
    (2, 'Street Light'),
    (3, 'Water Supply'),
    (4, 'Road Maintenance'),
    (5, 'Sanitation'),
    (6, 'Public Health');

-- ---------------------------------------------------------------------
-- Categories (each belongs to a department)
-- ---------------------------------------------------------------------
INSERT INTO category (category_id, name, dept_id) VALUES
    (1,  'Blocked Drain',        1),  -- Drainage
    (2,  'Sewage Overflow',      1),  -- Drainage
    (3,  'Street Light Failure', 2),  -- Street Light
    (4,  'Broken Pole',          2),  -- Street Light
    (5,  'Water Leakage',        3),  -- Water Supply
    (6,  'No Water Supply',      3),  -- Water Supply
    (7,  'Road Damage',          4),  -- Road Maintenance
    (8,  'Broken Footpath',      4),  -- Road Maintenance
    (9,  'Garbage Overflow',     5),  -- Sanitation
    (10, 'Illegal Dumping',      5),  -- Sanitation
    (11, 'Mosquito Breeding',    6),  -- Public Health
    (12, 'Stray Dogs',           6);  -- Public Health

-- ---------------------------------------------------------------------
-- Statuses
-- ---------------------------------------------------------------------
INSERT INTO status (status_id, name) VALUES
    (1, 'Open'),
    (2, 'In Progress'),
    (3, 'Resolved');

-- ---------------------------------------------------------------------
-- Citizens
-- ---------------------------------------------------------------------
INSERT INTO citizen (citizen_id, name, phone, address) VALUES
    (1,  'Ramesh Kumar',  '9876543210', '12, Main Road, Ward 1'),
    (2,  'Suresh Babu',   '9876543211', '45, Market Street, Ward 2'),
    (3,  'Lakshmi Devi',  '9876543212', '78, Temple Road, Ward 3'),
    (4,  'Anitha',        '9876543213', '33, School Lane, Ward 4'),
    (5,  'Venkatesh',     '9876543214', '88, Bus Stand, Ward 5'),
    (6,  'Priya',         '9876543215', '55, Park View, Ward 6'),
    (7,  'Arun',          '9876543216', '22, Residential Area, Ward 1'),
    (8,  'Deepa',         '9876543217', '66, Main Road, Ward 2'),
    (9,  'Rahul',         '9876543218', '99, Near Hospital, Ward 3'),
    (10, 'Meena',         '9876543219', '11, School Road, Ward 4'),
    (11, 'Naveen',        '9876543220', '44, Market Area, Ward 5'),
    (12, 'Swathi',        '9876543221', '77, Lake View, Ward 6'),
    (13, 'Kiran',         '9876543222', '33, Plastic Road, Ward 2'),
    (14, 'Bhavani',       '9876543223', '66, Street 3, Ward 3'),
    (15, 'Dinesh',        '9876543224', '99, Temple Lane, Ward 1'),
    (16, 'Meera',         '9876543225', '15, Ward 4'),
    (17, 'Sathish',       '9876543226', '28, Ward 2');

-- ---------------------------------------------------------------------
-- Officers (each belongs to a department)
-- ---------------------------------------------------------------------
INSERT INTO officer (officer_id, name, dept_id) VALUES
    (1, 'Prakash',  1),  -- Drainage
    (2, 'Manoj',    2),  -- Street Light
    (3, 'Ravi',     3),  -- Water Supply
    (4, 'Karthik',  4),  -- Road Maintenance
    (5, 'Ramesh',   5),  -- Sanitation
    (6, 'Harish',   6),  -- Public Health
    (7, 'Sneha',    1);  -- Drainage (additional officer)

-- ---------------------------------------------------------------------
-- Grievances (17 records: 15 from original JSON + 2 extra)
-- ---------------------------------------------------------------------
INSERT INTO grievance (grievance_id, citizen_id, ward_id, category_id, status_id, officer_id, date_filed, description, priority, affected_count, date_resolved) VALUES
    (1001, 1,  1, 1,  1, 1, '2026-07-01', 'Drain blocked near Government School causing water stagnation.', 2, 50, NULL),
    (1002, 2,  2, 3,  3, 2, '2026-07-03', 'Street lights not working on Main Road.', 3, 30, '2026-07-05'),
    (1003, 3,  3, 5,  2, 3, '2026-07-05', 'Pipeline leakage near bus stop.', 1, 20, NULL),
    (1004, 4,  4, 7,  1, 4, '2026-07-06', 'Large potholes causing accidents.', 1, 100, NULL),
    (1005, 5,  5, 9,  3, 5, '2026-07-08', 'Garbage bin overflowing near market.', 3, 40, '2026-07-10'),
    (1006, 6,  6, 11, 1, 6, '2026-07-09', 'Mosquitoes increasing due to stagnant water.', 2, 60, NULL),
    (1007, 7,  1, 2,  2, 1, '2026-07-10', 'Sewage overflowing into residential area.', 1, 80, NULL),
    (1008, 8,  2, 4,  1, 2, '2026-07-11', 'Electric pole leaning dangerously.', 2, 25, NULL),
    (1009, 9,  3, 6,  3, 3, '2026-07-12', 'No drinking water supplied for two days.', 1, 200, '2026-07-14'),
    (1010, 10, 4, 8,  2, 4, '2026-07-13', 'Footpath damaged near primary school.', 3, 15, NULL),
    (1011, 11, 5, 10, 1, 5, '2026-07-14', 'Construction waste dumped on roadside.', 4, 35, NULL),
    (1012, 12, 6, 12, 3, 6, '2026-07-15', 'Stray dogs creating safety issues.', 3, 45, '2026-07-17'),
    (1013, 13, 2, 1,  2, 1, '2026-07-16', 'Drain blocked due to plastic waste.', 2, 55, NULL),
    (1014, 14, 3, 3,  1, 2, '2026-07-17', 'Entire street dark during night.', 3, 20, NULL),
    (1015, 15, 1, 5,  3, 3, '2026-07-18', 'Water pipe leaking near temple.', 2, 30, '2026-07-20'),
    (1016, 16, 4, 7,  1, 4, '2026-07-19', 'New pothole reported after rain.', 2, 40, NULL),
    (1017, 17, 2, 3,  2, 2, '2026-07-20', 'Street light flickering on College Road.', 3, 18, NULL);

-- ---------------------------------------------------------------------
-- Grievance History (append-only log of status changes)
-- ---------------------------------------------------------------------
-- Each grievance gets an initial "filed" entry, and resolved ones get
-- additional entries showing the progression of statuses.
INSERT INTO grievance_history (grievance_id, status_id, changed_by, notes) VALUES
    -- 1001: Open (initial)
    (1001, 1, 1, 'Initial filing'),
    -- 1002: Open -> In Progress -> Resolved
    (1002, 1, 2, 'Initial filing'),
    (1002, 2, 2, 'Inspection completed, work started'),
    (1002, 3, 2, 'Lights replaced and tested'),
    -- 1003: Open -> In Progress
    (1003, 1, 3, 'Initial filing'),
    (1003, 2, 3, 'Crew dispatched to site'),
    -- 1004: Open (initial)
    (1004, 1, 4, 'Initial filing'),
    -- 1005: Open -> In Progress -> Resolved
    (1005, 1, 5, 'Initial filing'),
    (1005, 2, 5, 'Bin emptied and area cleaned'),
    (1005, 3, 5, 'Resolved - follow-up scheduled'),
    -- 1006: Open (initial)
    (1006, 1, 6, 'Initial filing'),
    -- 1007: Open -> In Progress
    (1007, 1, 1, 'Initial filing'),
    (1007, 2, 1, 'Sewage tanker deployed'),
    -- 1008: Open (initial)
    (1008, 1, 2, 'Initial filing'),
    -- 1009: Open -> In Progress -> Resolved
    (1009, 1, 3, 'Initial filing'),
    (1009, 2, 3, 'Pipe repair crew on site'),
    (1009, 3, 3, 'Supply restored, pipe replaced'),
    -- 1010: Open -> In Progress
    (1010, 1, 4, 'Initial filing'),
    (1010, 2, 4, 'Concrete ordered for repair'),
    -- 1011: Open (initial)
    (1011, 1, 5, 'Initial filing'),
    -- 1012: Open -> In Progress -> Resolved
    (1012, 1, 6, 'Initial filing'),
    (1012, 2, 6, 'Animal control contacted'),
    (1012, 3, 6, 'Area sanitized, dogs relocated'),
    -- 1013: Open -> In Progress
    (1013, 1, 1, 'Initial filing'),
    (1013, 2, 1, 'Drain desilted'),
    -- 1014: Open (initial)
    (1014, 1, 2, 'Initial filing'),
    -- 1015: Open -> In Progress -> Resolved
    (1015, 1, 3, 'Initial filing'),
    (1015, 2, 3, 'Leak identified and isolated'),
    (1015, 3, 3, 'Pipe replaced, supply tested'),
    -- 1016: Open (initial)
    (1016, 1, 4, 'Initial filing'),
    -- 1017: Open -> In Progress
    (1017, 1, 2, 'Initial filing'),
    (1017, 2, 2, 'Bulb and holder replaced');

INSERT INTO citizen(name, phone, address)
VALUES
('Suresh Kumar','9876543210','Ward 2');