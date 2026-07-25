# Panchayat Grievance Register and Resolution Tracker

A state-of-the-art **Panchayat Grievance Register & Priority Resolution Tracker** designed for ward clerks and panchayat officials to record, search, filter, and track public grievances until resolution, giving immediate priority to the oldest pending complaints.

---

## 📌 Project Overview & Problem Statement

In rural local governance (Gram Panchayats), public grievances regarding drainage, water supply, street lighting, road maintenance, and sanitation are frequently registered manually in paper ledgers. This creates several operational challenges:

1. **Hidden Backlog**: Oldest complaints are buried under newer entries and risk being forgotten.
2. **Lack of Transparency**: Citizens cannot track progress or see assigned department officers.
3. **No Metric Tracking**: Officials lack insights into average resolution times or department bottlenecks.

This digital portal resolves these challenges by recording every complaint with normalized relational integrity, providing **instant live search**, multi-criteria filtering, **oldest-first queue prioritization**, and a **transparent status history log**.

---

## ✨ Key Features

- **Government Portal UI**: Clean, responsive layout with official branding, dark blue palette, department badges, and status indicators.
- **6 Summary Statistics Cards**: Total Grievances, Open Cases, In Progress, Resolved, **Average Resolution Time (Days)**, and **Longest Pending Case (Days)**.
- **Live Instant Search**: Filter instantly by Complaint ID, Citizen Name, Ward, Department, Category, or Assigned Officer.
- **Multi-Criteria Filtering & Sorting**:
  - Filter by **Department** (Drainage, Water Supply, Street Light, Road Maintenance, Sanitation, Public Health).
  - Filter by **Status** (Open, In Progress, Resolved).
  - Filter by **Ward** (Ward 1 to Ward 6).
  - Sort by **Oldest First** (Default priority queue), Newest First, Longest Pending, or Recently Updated.
- **Detailed Grievance View & Timeline**: Comprehensive detail page featuring citizen info, department badges, priority tags, affected counts, and a complete **Complaint Progress History Log**.
- **Dual-Mode Backend Resilience**: Connects seamlessly to live **Express SQLite REST API** with automatic fallback to static JSON data when offline.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router v7, Vite 8, Plain CSS (CSS Variables, Flexbox, CSS Grid).
- **Backend API**: Express.js, Node.js (with built-in `node:sqlite` DatabaseSync module), CORS.
- **Database**: SQLite 3 (Normalized 8-table relational schema with PK, FK, NOT NULL, CHECK, UNIQUE, triggers, and indexes).
- **Testing**: Node.js constraint test harness, data schema validator, and API integration tester.

---

## 📁 Folder Structure

```
c:/Projects/Panchayat-Grievance-Tracker/
├── database/
│   ├── schema.sql           # 8-Table SQLite normalized schema & triggers
│   ├── seed.sql             # Realistic Panchayat seed data & history entries
│   ├── queries.sql          # 10 Administrative analytical SQL queries
│   ├── init.js              # Database build & initialization script
│   ├── grievances.db        # Generated SQLite database file
│   └── er-diagram.md        # Relational ER diagram & design documentation
├── server/
│   └── index.js             # Express REST API server (/api endpoints)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── NavBar.jsx       # Header & live API status indicator
│   │   ├── Statistics.jsx   # 6 summary metric cards
│   │   ├── SearchBar.jsx    # Live search input with clear button
│   │   ├── FilterBar.jsx    # Department, Status, Ward & Sort dropdowns
│   │   ├── GrievanceCard.jsx# Complaint summary card with badges & timer
│   │   ├── Loading.jsx      # Animated dual-ring spinner
│   │   ├── Empty.jsx        # Empty search state illustration & reset button
│   │   └── Error.jsx        # Diagnostic error state & retry button
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main register dashboard view
│   │   └── Detail.jsx       # Complaint detail view & history timeline
│   ├── styles/              # Component-scoped plain CSS stylesheets
│   ├── App.jsx              # Main React Router configuration
│   ├── main.jsx             # Entry point
│   └── index.css            # Global CSS design tokens & reset
├── public/
│   └── grievances.json      # Offline static data fallback
├── tests/
│   ├── test-constraints.js  # SQLite constraint & trigger validation suite
│   ├── test-data.js         # JSON dataset integrity checks
│   └── test-api.js          # Express API endpoint integration suite
├── docs/
│   ├── PRESENTATION_OUTLINE.md # Presentation outline
│   └── screenshots/         # UI screenshots
├── presentation.html        # Interactive 7-slide presentation deck
├── vite.config.js           # Vite config with /api proxy target
├── package.json             # NPM dependencies and run scripts
└── README.md                # Project documentation
```

---

## 🚀 Installation & Running Instructions

### Prerequisites
- Node.js 22.0 or later

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Run Tests
```bash
npm run db:init
npm run test:constraints
npm run test:data
npm run test:api
```

### 3. Start Backend Server & Frontend Application

Option A: Run both Express Server and Vite Client
```bash
# Terminal 1: Start Express API (Port 5000)
npm run server

# Terminal 2: Start Vite Dev Server (Port 5173)
npm run dev
```

Option B: Run Frontend Standalone (Uses Offline JSON Fallback)
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📊 Database Architecture & SQL Deliverables

The database is normalized across **8 relational tables**:
1. `ward` — Administrative wards.
2. `department` — Responsible departments.
3. `category` — Issue categories scoped to departments.
4. `status` — Valid states (Open, In Progress, Resolved).
5. `citizen` — Citizen contact registry.
6. `officer` — Panchayat officers assigned to departments.
7. `grievance` — Core grievance records with constraints (`date_resolved >= date_filed`, `priority` 1-5, `affected_count` >= 1, triggers for future date prevention).
8. `grievance_history` — Append-only audit log tracking every status update.

### Analytical SQL Queries (`database/queries.sql`)
1. Open complaints ordered by filed date.
2. Resolved complaints with resolution duration.
3. Pending complaints > 15 days (Critical Queue).
4. Department breakdown & average resolution times.
5. Ward geographic summary & total citizens affected.
6. Officer active workload & task completion.
7. Overall portal resolution time statistics.
8. Oldest unresolved complaints priority dispatch.
9. Complaint history timeline query.
10. Monthly grievance breakdown.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/grievances` | List grievances (supports `search`, `department`, `status`, `ward`, `sort`) |
| `GET` | `/api/grievances/:id` | Get single grievance details with history timeline |
| `GET` | `/api/statistics` | Get aggregate counts, average resolution days, & max pending days |
| `GET` | `/api/history/:id` | Get history audit log for a specific grievance |

---

## 📐 Derived Metric Formulas

- $$\text{Days Pending} = \text{Current Date} - \text{Date Filed} \quad (\text{For Open / In Progress cases})$$
- $$\text{Resolution Days} = \text{Date Resolved} - \text{Date Filed} \quad (\text{For Resolved cases})$$
- $$\text{Average Resolution Time} = \frac{\sum \text{Resolution Days}}{\text{Count of Resolved Cases}}$$

---

## 🔮 Future Improvements

1. **Clerk Entry & Status Update Form**: Web UI for clerks to log new complaints and update status with notes.
2. **SMS / WhatsApp Alerts**: Automatic notification to citizens when status changes to "In Progress" or "Resolved".
3. **GIS Heatmap**: Visual map of wards highlighting high-density grievance zones.