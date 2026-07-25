import { Link, useNavigate } from "react-router-dom";
import "../styles/card.css";

// Helper for Department visual styling badge
const getDeptClass = (deptName) => {
  if (!deptName) return "dept-default";
  const slug = deptName.toLowerCase().replace(/\s+/g, "-");
  return `dept-${slug}`;
};

function GrievanceCard({ grievance }) {
  const navigate = useNavigate();

  const filedDate = new Date(`${grievance.date}T00:00:00`).toLocaleDateString(
    "en-IN",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysPending = grievance.status === "Resolved"
    ? null
    : (grievance.daysPending !== undefined && grievance.daysPending !== null
        ? grievance.daysPending
        : Math.max(0, Math.floor((today - new Date(`${grievance.date}T00:00:00`)) / (1000 * 60 * 60 * 24))));

  const resolutionDays = grievance.status === "Resolved"
    ? (grievance.resolutionDays !== undefined && grievance.resolutionDays !== null
        ? grievance.resolutionDays
        : (grievance.dateResolved
            ? Math.max(0, Math.floor((new Date(`${grievance.dateResolved}T00:00:00`) - new Date(`${grievance.date}T00:00:00`)) / (1000 * 60 * 60 * 24)))
            : null))
    : null;

  const statusClass = grievance.status ? grievance.status.replace(/\s+/g, "") : "Open";

  const handleCardClick = (e) => {
    // Avoid double navigation if user clicked directly on link or button
    if (e.target.closest("a") || e.target.closest("button")) {
      return;
    }
    navigate(`/detail/${grievance.id}`);
  };

  return (
    <div
      className={`grievance-card ${statusClass}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/detail/${grievance.id}`);
        }
      }}
      title="Click card to open full-page official case file dossier"
    >
      <div className="card-header">
        <div className="card-id-row">
          <span className="complaint-id">#{grievance.id}</span>
          {grievance.priority && (
            <span className={`priority-badge priority-${grievance.priority}`}>
              P{grievance.priority}
            </span>
          )}
        </div>
        <span className={`status-badge ${statusClass}`}>
          {grievance.status}
        </span>
      </div>

      <div className="card-body">
        <h3 className="category-title">{grievance.category}</h3>

        <div className="dept-tag-wrapper">
          <span className={`dept-badge ${getDeptClass(grievance.department)}`}>
            🏢 {grievance.department}
          </span>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">Citizen:</span>
            <span className="meta-value">{grievance.citizen}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Ward:</span>
            <span className="meta-value">{grievance.ward}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Officer:</span>
            <span className="meta-value">{grievance.assignedOfficer || grievance.officer || "Unassigned"}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Filed Date:</span>
            <span className="meta-value">{filedDate}</span>
          </div>
        </div>

        <div className="pending-timer-row">
          {grievance.status === "Resolved" ? (
            <span className="timer-tag resolved">
              ✓ Resolved in <strong>{resolutionDays !== null ? `${resolutionDays} days` : "N/A"}</strong>
            </span>
          ) : (
            <span className={`timer-tag ${daysPending > 15 ? 'critical' : 'normal'}`}>
              ⏳ Pending for <strong>{daysPending} days</strong>
            </span>
          )}
        </div>
      </div>

      <div className="card-footer">
        <span className="click-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
          </svg>
          Click card for full details & process
        </span>
        <Link to={`/detail/${grievance.id}`} className="view-btn" onClick={(e) => e.stopPropagation()}>
          Full Dossier
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default GrievanceCard;
