function Empty({ onReset }) {
  return (
    <div className="empty-container">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </div>
      <h2>No grievances match your search.</h2>
      <p>Try adjusting your search criteria, clearing search keywords, or selecting another department/ward filter.</p>
      {onReset && (
        <button type="button" className="reset-btn" onClick={onReset}>
          Reset All Filters
        </button>
      )}
    </div>
  );
}

export default Empty;