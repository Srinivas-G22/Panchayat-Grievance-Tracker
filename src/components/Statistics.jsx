import "../styles/statistics.css";

function Statistics({ grievances = [], stats = null }) {
  // If stats object from API is provided, use it; otherwise compute from grievances list
  const total = stats ? stats.total : grievances.length;
  const openCount = stats ? stats.open : grievances.filter(g => g.status === "Open").length;
  const progressCount = stats ? stats.inProgress : grievances.filter(g => g.status === "In Progress").length;
  const resolvedCount = stats ? stats.resolved : grievances.filter(g => g.status === "Resolved").length;

  let avgResolutionTime = 0;
  if (stats && stats.avgResolutionDays !== undefined) {
    avgResolutionTime = stats.avgResolutionDays;
  } else {
    const resolvedItems = grievances.filter(g => g.status === "Resolved" && g.dateResolved);
    if (resolvedItems.length > 0) {
      const sumDays = resolvedItems.reduce((acc, g) => {
        const start = new Date(`${g.date}T00:00:00`);
        const end = new Date(`${g.dateResolved}T00:00:00`);
        const diff = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
        return acc + diff;
      }, 0);
      avgResolutionTime = (sumDays / resolvedItems.length).toFixed(1);
    }
  }

  let longestPending = 0;
  if (stats && stats.longestPendingDays !== undefined) {
    longestPending = stats.longestPendingDays;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unresolvedItems = grievances.filter(g => g.status !== "Resolved" && g.date);
    if (unresolvedItems.length > 0) {
      longestPending = Math.max(...unresolvedItems.map(g => {
        const filed = new Date(`${g.date}T00:00:00`);
        return Math.max(0, Math.floor((today - filed) / (1000 * 60 * 60 * 24)));
      }));
    }
  }

  return (
    <div className="stats-container">
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <h3>{total}</h3>
          <p>Total Grievances</p>
        </div>
      </div>

      <div className="stat-card open">
        <div className="stat-icon">🔴</div>
        <div className="stat-info">
          <h3>{openCount}</h3>
          <p>Open Cases</p>
        </div>
      </div>

      <div className="stat-card progress">
        <div className="stat-icon">🟡</div>
        <div className="stat-info">
          <h3>{progressCount}</h3>
          <p>In Progress</p>
        </div>
      </div>

      <div className="stat-card resolved">
        <div className="stat-icon">🟢</div>
        <div className="stat-info">
          <h3>{resolvedCount}</h3>
          <p>Resolved Cases</p>
        </div>
      </div>

      <div className="stat-card avg-time">
        <div className="stat-icon">⚡</div>
        <div className="stat-info">
          <h3>{avgResolutionTime} <span className="unit">days</span></h3>
          <p>Avg Resolution Time</p>
        </div>
      </div>

      <div className="stat-card longest">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>{longestPending} <span className="unit">days</span></h3>
          <p>Longest Pending Case</p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;