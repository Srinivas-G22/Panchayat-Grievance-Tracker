# Database Design — Panchayat Grievance Tracker

## Entities, Primary Keys, and Foreign Keys

### 1. `ward`
| Column | Type | Constraints |
|---|---|---|
| ward_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE, CHECK(name != '') |

**Purpose**: Tracks the administrative wards of the panchayat. Each grievance is filed against a ward.

### 2. `department`
| Column | Type | Constraints |
|---|---|---|
| dept_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE, CHECK(name != '') |

**Purpose**: The government department responsible for resolving grievances (e.g., Drainage, Water Supply, Street Light).

### 3. `category`
| Column | Type | Constraints |
|---|---|---|
| category_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, CHECK(name != '') |
| dept_id | INTEGER | NOT NULL, FK → department(dept_id), UNIQUE(name, dept_id) |

**Purpose**: Specific complaint categories that belong to a department (e.g., "Blocked Drain" belongs to "Drainage"). The UNIQUE(name, dept_id) constraint prevents the same category name from being duplicated within a department.

### 4. `status`
| Column | Type | Constraints |
|---|---|---|
| status_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, UNIQUE, CHECK(name != '') |

**Purpose**: The lifecycle status of a grievance. Values: Open, In Progress, Resolved.

### 5. `citizen`
| Column | Type | Constraints |
|---|---|---|
| citizen_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, CHECK(name != '') |
| phone | TEXT | |
| address | TEXT | |

**Purpose**: The person who filed the grievance. Keeping citizens in their own table allows answering "how many grievances has this person filed?" and prevents name typos from creating duplicate citizens.

### 6. `officer`
| Column | Type | Constraints |
|---|---|---|
| officer_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL, CHECK(name != '') |
| dept_id | INTEGER | NOT NULL, FK → department(dept_id) |

**Purpose**: The government officer assigned to handle grievances. Each officer belongs to a department.

### 7. `grievance`
| Column | Type | Constraints |
|---|---|---|
| grievance_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| citizen_id | INTEGER | NOT NULL, FK → citizen(citizen_id) |
| ward_id | INTEGER | NOT NULL, FK → ward(ward_id) |
| category_id | INTEGER | NOT NULL, FK → category(category_id) |
| status_id | INTEGER | NOT NULL, FK → status(status_id) |
| officer_id | INTEGER | NOT NULL, FK → officer(officer_id) |
| date_filed | DATE | NOT NULL; triggers reject a future date |
| description | TEXT | NOT NULL, CHECK(description != '') |
| priority | INTEGER | NOT NULL, CHECK(priority >= 1 AND priority <= 5) |
| affected_count | INTEGER | NOT NULL, CHECK(affected_count >= 1) |
| date_resolved | DATE | CHECK(date_resolved IS NULL OR date_resolved >= date_filed) |

**Purpose**: The core grievance record. Links to all other entities via foreign keys. The `date_resolved` column is nullable (NULL means still open). The CHECK on `date_resolved >= date_filed` prevents a resolution date before the filing date.

### 8. `grievance_history`
| Column | Type | Constraints |
|---|---|---|
| history_id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| grievance_id | INTEGER | NOT NULL, FK → grievance(grievance_id) |
| status_id | INTEGER | NOT NULL, FK → status(status_id) |
| changed_by | INTEGER | NOT NULL, FK → officer(officer_id) |
| changed_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| notes | TEXT | |

**Purpose**: Tracks every status change for a grievance. Each row records which grievance changed, what the new status is, who changed it, and when. This is the history table — it never overwrites, it only appends.

---

## ER Diagram

```
┌──────────────┐       ┌──────────────┐
│    ward      │       │  department  │
├──────────────┤       ├──────────────┤
│ ward_id  PK  │       │ dept_id   PK │
│ name         │       │ name         │
└──────┬───────┘       └──────┬───────┘
       │                      │
       │                      │
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  grievance   │       │   category   │       │   officer    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ grievance_id PK│     │ category_id PK│     │ officer_id  PK │
│ citizen_id  FK│─────▶│ name         │     │ name         │
│ ward_id     FK│─────▶│ dept_id     FK│────▶│ dept_id     FK │
│ category_id  FK│─────▶│              │     │              │
│ status_id    FK│     └──────────────┘     └──────┬───────┘
│ officer_id   FK│───────────────────────────────▶│
│ date_filed   │                                   │
│ description  │                                   │
│ priority     │                                   │
│ affected_cnt │                                   │
│ date_resolved│                                   │
└──────┬───────┘                                   │
       │                                           │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│ grievance_   │                                   │
│ history      │                                   │
├──────────────┤                                   │
│ history_id  PK│                                   │
│ grievance_id FK│─────▶ grievance(grievance_id)     │
│ status_id   FK│─────▶ status(status_id)           │
│ changed_by  FK│─────▶ officer(officer_id) ◀───────┘
│ changed_at   │                                   │
│ notes        │                                   │
└──────────────┘                                   │
                                                   │
┌──────────────┐                                   │
│   citizen    │                                   │
├──────────────┤                                   │
│ citizen_id  PK│                                   │
│ name         │                                   │
│ phone        │                                   │
│ address      │                                   │
└──────────────┘                                   │
                                                   │
┌──────────────┐                                   │
│   status     │                                   │
├──────────────┤                                   │
│ status_id   PK│                                   │
│ name         │                                   │
└──────────────┘                                   │
```

### Relationship Summary

| From | To | Cardinality | Meaning |
|---|---|---|---|
| ward | grievance | 1 → M | A ward has many grievances |
| department | category | 1 → M | A department has many categories |
| department | officer | 1 → M | A department has many officers |
| category | grievance | 1 → M | A category has many grievances |
| status | grievance | 1 → M | A status applies to many grievances |
| status | grievance_history | 1 → M | A status appears in many history rows |
| citizen | grievance | 1 → M | A citizen files many grievances |
| officer | grievance | 1 → M | An officer handles many grievances |
| officer | grievance_history | 1 → M | An officer makes many status changes |
| grievance | grievance_history | 1 → M | A grievance has many history entries |

---

## Justification for Main Design Decision

The single most important design decision is the **separate `grievance_history` table** that appends a new row for every status change instead of overwriting a `status` column on the `grievance` table. A column that is overwritten can only answer "what is true now," while a history table can answer "how long did it take" and "did it happen more than once." That single decision determines which questions the records can ever answer — without it, the system can never produce resolution-time reports or detect grievances that bounced between statuses.
