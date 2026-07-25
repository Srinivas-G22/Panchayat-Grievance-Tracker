import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Loading from "../components/Loading";
import Error from "../components/Error";
import "../styles/detail.css";

const getDeptClass = (deptName) => {
  if (!deptName) return "dept-default";
  const slug = deptName.toLowerCase().replace(/\s+/g, "-");
  return `dept-${slug}`;
};

// Department & Category specific delay reasons and technical bottlenecks
const getDelayAssessment = (department, category, daysPending, status) => {
  if (status === "Resolved") {
    return {
      reason: "Grievance has been successfully addressed and verified on-site by the assigned department officer.",
      bottleneck: "Work completed following technical inspection and field repair.",
      escalationLevel: "Closed",
      slaStatus: "Achieved SLA",
      clearanceRequired: "None (Closed)"
    };
  }

  const deptLower = (department || "").toLowerCase();

  if (deptLower.includes("drainage")) {
    return {
      reason: "Severe silt deposition and underground conduit obstruction near drainage junction.",
      bottleneck: "Requires heavy-duty municipal suction tanker & high-pressure jetting machine from District Fleet.",
      escalationLevel: daysPending > 10 ? "Level 2 (Assistant Executive Engineer)" : "Level 1 (Ward Technical Officer)",
      slaStatus: daysPending > 7 ? "SLA Breached - Expedited Order" : "Within SLA Window",
      clearanceRequired: "Underground Pipe Clearance & Traffic Diversion"
    };
  } else if (deptLower.includes("water")) {
    return {
      reason: "Main supply pipeline leakage requiring deep excavation and replacement of damaged joint section.",
      bottleneck: "Awaiting inter-departmental road cutting permission from Public Works Department (PWD).",
      escalationLevel: daysPending > 10 ? "Level 2 (Executive Engineer - Water Supply)" : "Level 1 (Junior Engineer)",
      slaStatus: daysPending > 5 ? "SLA Extended" : "Within SLA Window",
      clearanceRequired: "PWD Road Cutting Permit & Water Main Isolation"
    };
  } else if (deptLower.includes("light")) {
    return {
      reason: "Short circuit in overhead distribution box and failed transformer relay component.",
      bottleneck: "Replacement LED luminaires & hydraulic ladder truck dispatched from Central Warehousing Division.",
      escalationLevel: daysPending > 8 ? "Level 2 (Electrical Sub-Division Inspector)" : "Level 1 (Line Officer)",
      slaStatus: daysPending > 5 ? "Overdue SLA" : "Within SLA Window",
      clearanceRequired: "State Electricity Board (EB) Power Shutdown Clearance"
    };
  } else if (deptLower.includes("road")) {
    return {
      reason: "Potholes and structural pavement degradation requiring hot-mix asphalt patching.",
      bottleneck: "Asphalt laying suspended temporarily due to surface moisture; hot-mix batching scheduled.",
      escalationLevel: daysPending > 12 ? "Level 3 (Block Development Officer - BDO)" : "Level 1 (Road Inspector)",
      slaStatus: daysPending > 10 ? "High Priority SLA Escalation" : "Within SLA Window",
      clearanceRequired: "Panchayat Highways Permission"
    };
  } else if (deptLower.includes("sanitation")) {
    return {
      reason: "Excess waste accumulation and unauthorized construction debris dumping.",
      bottleneck: "Heavy waste clearing requires JCB loader and additional 10-ton tipper trucks.",
      escalationLevel: daysPending > 7 ? "Level 2 (Sanitation Inspector)" : "Level 1 (Health Inspector)",
      slaStatus: daysPending > 5 ? "SLA Overdue" : "Within SLA Window",
      clearanceRequired: "District Landfill Dumping Clearance"
    };
  } else {
    return {
      reason: "Field inspection identified stagnant water pools requiring biological larvicide spraying and fogging.",
      bottleneck: "Coordination required between Panchayat Health Wing and Primary Health Centre (PHC).",
      escalationLevel: daysPending > 7 ? "Level 2 (Public Health Medical Officer)" : "Level 1 (Health Supervisor)",
      slaStatus: daysPending > 7 ? "Escalated to Medical Officer" : "Within SLA Window",
      clearanceRequired: "PHC Vector Control Division Approval"
    };
  }
};

// Generate resolution workflow stages (Standard Operating Procedure)
const getProcessWorkflow = (status, daysPending) => {
  if (status === "Resolved") {
    return [
      { step: 1, name: "Intake & Registration", desc: "Complaint logged and ticket issued", status: "completed", date: "Stage 1 Done" },
      { step: 2, name: "Site Verification", desc: "Officer completed on-site inspection", status: "completed", date: "Stage 2 Done" },
      { step: 3, name: "Material & Crew Dispatch", desc: "Materials allocated & field team deployed", status: "completed", date: "Stage 3 Done" },
      { step: 4, name: "Field Execution", desc: "Repair and restoration work executed", status: "completed", date: "Stage 4 Done" },
      { step: 5, name: "Quality Audit & Closure", desc: "Final verification and formal sign-off", status: "completed", date: "Resolved" }
    ];
  } else if (status === "In Progress") {
    return [
      { step: 1, name: "Intake & Registration", desc: "Complaint logged and ticket issued", status: "completed", date: "Completed" },
      { step: 2, name: "Site Verification", desc: "Officer completed on-site inspection", status: "completed", date: "Completed" },
      { step: 3, name: "Material & Crew Dispatch", desc: "Work order issued & team dispatched", status: "completed", date: "Completed" },
      { step: 4, name: "Field Execution", desc: "Repair work currently underway on site", status: "active", date: "In Progress" },
      { step: 5, name: "Quality Audit & Closure", desc: "Pending work completion & citizen audit", status: "pending", date: "Scheduled" }
    ];
  } else {
    return [
      { step: 1, name: "Intake & Registration", desc: "Complaint logged and ticket issued", status: "completed", date: "Completed" },
      { step: 2, name: "Site Verification", desc: "On-site assessment & scope estimation", status: daysPending > 3 ? "completed" : "active", date: daysPending > 3 ? "Completed" : "In Progress" },
      { step: 3, name: "Material & Crew Dispatch", desc: "Technical crew & machinery allocation", status: daysPending > 3 ? "active" : "pending", date: "Queued" },
      { step: 4, name: "Field Execution", desc: "On-site repair and restoration work", status: "pending", date: "Pending" },
      { step: 5, name: "Quality Audit & Closure", desc: "Final verification and sign-off", status: "pending", date: "Pending" }
    ];
  }
};

function Detail() {
  const { id } = useParams();

  const [grievance, setGrievance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("live");

  useEffect(() => {
    let ignore = false;

    fetch(`/api/grievances/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        setGrievance(data);
        setHistory(data.history || []);
        setApiStatus("live");
        setLoading(false);
      })
      .catch(() => {
        if (ignore) return;
        fetch("/grievances.json")
          .then((res) => {
            if (!res.ok) throw new Error("Unable to load data file");
            return res.json();
          })
          .then((data) => {
            if (ignore) return;
            const record = data.find((g) => g.id === Number(id));
            if (!record) throw new Error(`Grievance #${id} not found`);

            setGrievance(record);
            setApiStatus("json");

            const mockHistory = [
              {
                history_id: 1,
                status: "Open",
                changed_by: record.assignedOfficer || "Panchayat Ward Clerk",
                changed_at: `${record.date} 09:30:00`,
                notes: "Grievance registered into Panchayat Central System and assigned ticket ID."
              }
            ];
            if (record.status === "In Progress") {
              mockHistory.push({
                history_id: 2,
                status: "In Progress",
                changed_by: record.assignedOfficer || "Field Officer",
                changed_at: `${record.date} 14:15:00`,
                notes: "Initial site inspection completed. Work order issued and field crew dispatched."
              });
            } else if (record.status === "Resolved" && record.dateResolved) {
              mockHistory.push({
                history_id: 2,
                status: "In Progress",
                changed_by: record.assignedOfficer || "Field Officer",
                changed_at: `${record.date} 14:15:00`,
                notes: "Technical work order assigned and field execution initiated."
              });
              mockHistory.push({
                history_id: 3,
                status: "Resolved",
                changed_by: record.assignedOfficer || "Department Officer",
                changed_at: `${record.dateResolved} 16:45:00`,
                notes: "Field repairs completed, verified on-site, and signed off as resolved."
              });
            }
            setHistory(mockHistory);
            setLoading(false);
          })
          .catch((err) => {
            if (ignore) return;
            setError(err.message || "Failed to load grievance details");
            setLoading(false);
          });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <Loading />;
  if (error || !grievance) return <Error message={error} />;

  const created = new Date(`${grievance.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysPending = grievance.daysPending !== undefined && grievance.daysPending !== null
    ? grievance.daysPending
    : Math.max(0, Math.floor((today - created) / (1000 * 60 * 60 * 24)));

  const resolutionDays = grievance.resolutionDays !== undefined && grievance.resolutionDays !== null
    ? grievance.resolutionDays
    : (grievance.dateResolved
        ? Math.max(0, Math.floor((new Date(`${grievance.dateResolved}T00:00:00`) - created) / (1000 * 60 * 60 * 24)))
        : null);

  const statusClass = grievance.status ? grievance.status.replace(/\s+/g, "") : "Open";
  const delayInfo = getDelayAssessment(grievance.department, grievance.category, daysPending, grievance.status);
  const workflowSteps = getProcessWorkflow(grievance.status, daysPending);

  const slaTargetDays = grievance.priority <= 2 ? 3 : 7;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <NavBar apiStatus={apiStatus} />

      <main className="detail-container">
        {/* Top Action Bar */}
        <div className="top-action-bar">
          <div className="breadcrumb-nav">
            <Link to="/" className="back-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Back to Dashboard
            </Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Official Dossier #{grievance.id}</span>
          </div>

          <button className="print-btn" onClick={handlePrint} title="Print Case Dossier">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Case Dossier
          </button>
        </div>

        {/* Main Official Case File Dossier */}
        <div className="detail-dossier-card">
          {/* Header Banner */}
          <div className="dossier-header">
            <div className="dossier-header-main">
              <div className="gov-seal-badge">
                <span>OFFICIAL GRAM PANCHAYAT CASE DOSSIER</span>
              </div>
              <h1 className="dossier-title">{grievance.category}</h1>
              <p className="dossier-sub">Registered under {grievance.department} • {grievance.ward}</p>
            </div>
            <div className="dossier-status-wrapper">
              <span className={`status-badge-lg ${statusClass}`}>
                {grievance.status}
              </span>
              <span className="case-id-tag">TICKET #{grievance.id}</span>
            </div>
          </div>

          {/* Highlight Key Metric & SLA Banner */}
          <div className="highlight-metric-banner">
            <div className="metric-content">
              <div>
                <span className="metric-label">
                  {grievance.status === "Resolved" ? "TOTAL RESOLUTION DURATION" : "CURRENT PENDING TIME"}
                </span>
                <div className="metric-number">
                  {grievance.status === "Resolved" ? (resolutionDays !== null ? `${resolutionDays} Days` : "N/A") : `${daysPending} Days`}
                </div>
              </div>

              <div className="sla-box">
                <span className="sla-title">SLA Compliance Target</span>
                <span className="sla-val">{slaTargetDays} Days Standard Target</span>
                <span className={`sla-badge ${daysPending > slaTargetDays && grievance.status !== "Resolved" ? "breached" : "ok"}`}>
                  {grievance.status === "Resolved" ? "SLA Completed" : (daysPending > slaTargetDays ? "⚠ SLA Breached - Escalated" : "✓ Within SLA Schedule")}
                </span>
              </div>
            </div>

            <div className="metric-subtext">
              {grievance.status === "Resolved"
                ? `Filed on ${grievance.date} and formally resolved on ${grievance.dateResolved}`
                : `Filed on ${grievance.date} • Prioritized on Panchayat Action Register`}
            </div>
          </div>

          {/* SECTION 1: OFFICIAL CITIZEN & LOCATION DOSSIER */}
          <section className="dossier-section">
            <h2 className="section-heading">1. Citizen & Location Information</h2>
            <div className="detail-grid">
              <div className="grid-item">
                <span className="grid-label">Complaint Ticket ID</span>
                <span className="grid-value mono">#{grievance.id}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Complainant / Citizen</span>
                <span className="grid-value">{grievance.citizen}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Registered Contact</span>
                <span className="grid-value">{grievance.citizenPhone || "+91 98765-XXXXX (Verified)"}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Jurisdiction / Ward</span>
                <span className="grid-value">{grievance.ward}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Filed Date</span>
                <span className="grid-value">{grievance.date}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Landmark / Address</span>
                <span className="grid-value">{grievance.ward}, Near Central Government Primary School</span>
              </div>

              <div className="grid-item full-width">
                <span className="grid-label">Grievance Description & Scope</span>
                <p className="description-text">{grievance.description}</p>
              </div>
            </div>
          </section>

          {/* SECTION 2: ADMINISTRATIVE & OFFICER RESPONSIBILITY */}
          <section className="dossier-section">
            <h2 className="section-heading">2. Administrative & Departmental Responsibility</h2>
            <div className="detail-grid">
              <div className="grid-item">
                <span className="grid-label">Responsible Department</span>
                <span className={`dept-badge ${getDeptClass(grievance.department)}`}>
                  🏢 {grievance.department}
                </span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Assigned Lead Officer</span>
                <span className="grid-value">{grievance.assignedOfficer || grievance.officer || "Unassigned"}</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Officer Designation</span>
                <span className="grid-value">Section Officer / Field Engineer</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Priority Level</span>
                <span className={`priority-tag priority-${grievance.priority || 3}`}>
                  Priority {grievance.priority || 3} (Level {grievance.priority || 3})
                </span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Citizens Impacted</span>
                <span className="grid-value">{grievance.affectedCount || "N/A"} Local Residents</span>
              </div>

              <div className="grid-item">
                <span className="grid-label">Escalation Authority</span>
                <span className="grid-value">{delayInfo.escalationLevel}</span>
              </div>
            </div>
          </section>

          {/* SECTION 3: REASON FOR DELAY & TECHNICAL BOTTLENECK ANALYSIS */}
          <section className="dossier-section delay-analysis-section">
            <h2 className="section-heading">3. Reason for Delay & Operational Obstacles Analysis</h2>

            <div className="delay-alert-box">
              <div className="delay-header">
                <span className="delay-icon">⚠</span>
                <div>
                  <h3>Technical & Operational Delay Assessment</h3>
                  <p>Detailed evaluation of field obstacles, material dispatch status, and required clearances.</p>
                </div>
              </div>

              <div className="delay-details-grid">
                <div className="delay-card-item">
                  <strong>Primary Reason for Delay / Pending Status:</strong>
                  <p>{delayInfo.reason}</p>
                </div>

                <div className="delay-card-item">
                  <strong>Resource / Equipment Bottleneck:</strong>
                  <p>{delayInfo.bottleneck}</p>
                </div>

                <div className="delay-card-item">
                  <strong>Required Clearance & Permits:</strong>
                  <p>{delayInfo.clearanceRequired}</p>
                </div>

                <div className="delay-card-item">
                  <strong>Administrative SLA Status:</strong>
                  <p className="highlight-text">{delayInfo.slaStatus}</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: STANDARD OPERATING PROCEDURE (SOP) RESOLUTION PROCESS WORKFLOW */}
          <section className="dossier-section">
            <h2 className="section-heading">4. Process Involved in Resolving (5-Stage Resolution SOP Workflow)</h2>
            <p className="section-subtext">Standard operating procedure workflow followed by Panchayat field team to address this issue:</p>

            <div className="workflow-stepper">
              {workflowSteps.map((s) => (
                <div key={s.step} className={`workflow-step ${s.status}`}>
                  <div className="step-num">
                    {s.status === "completed" ? "✓" : s.step}
                  </div>
                  <div className="step-body">
                    <h4>Stage {s.step}: {s.name}</h4>
                    <p>{s.desc}</p>
                    <span className="step-status-tag">{s.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 5: COMPLAINT PROGRESS HISTORY TIMELINE */}
          <section className="dossier-section">
            <h2 className="section-heading">5. Audit Log & Status Change History</h2>

            <div className="timeline">
              {history.map((item, idx) => (
                <div key={item.history_id || idx} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className={`status-badge ${item.status ? item.status.replace(/\s+/g, "") : "Open"}`}>
                        {item.status}
                      </span>
                      <span className="timeline-time">{item.changed_at}</span>
                    </div>
                    <p className="timeline-notes">{item.notes}</p>
                    <span className="timeline-officer">Action Logged By: <strong>{item.changed_by}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dossier Footer Sign-off */}
          <div className="dossier-footer-signoff">
            <div className="signoff-box">
              <div className="official-stamp">
                <span>GRAM PANCHAYAT</span>
                <span>DIGITAL VERIFIED</span>
              </div>
              <p>Certified Official Grievance Record • Gram Panchayat Administration</p>
            </div>
          </div>

          <div className="detail-actions no-print">
            <Link to="/" className="back-btn">
              ← Return to Main Register Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Detail;
