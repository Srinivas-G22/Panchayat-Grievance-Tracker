function SearchBar({ search, setSearch }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-input-group">
        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search by ID, Citizen, Ward, Dept, Category, Officer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search grievances"
        />
        {search && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearch("")}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;