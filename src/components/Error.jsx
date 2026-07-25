function Error({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2>Unable to load grievance data</h2>
      <p>{message || "Failed to establish database connection. Please verify that the Express server or local database service is active."}</p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          🔄 Retry Connection
        </button>
      )}
    </div>
  );
}

export default Error;