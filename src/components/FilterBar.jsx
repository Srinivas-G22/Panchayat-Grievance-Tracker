function FilterBar({
  department,
  setDepartment,
  status,
  setStatus,
  ward = "All Wards",
  setWard,
  sort = "oldest",
  setSort
}) {
  return (
    <div className="filter-bar-wrapper">
      <div className="filter-group">
        <label htmlFor="dept-filter">Department:</label>
        <select
          id="dept-filter"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        >
          <option>All Departments</option>
          <option>Drainage</option>
          <option>Water Supply</option>
          <option>Street Light</option>
          <option>Road Maintenance</option>
          <option>Sanitation</option>
          <option>Public Health</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status:</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Status</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>
      </div>

      {setWard && (
        <div className="filter-group">
          <label htmlFor="ward-filter">Ward:</label>
          <select
            id="ward-filter"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          >
            <option>All Wards</option>
            <option>Ward 1</option>
            <option>Ward 2</option>
            <option>Ward 3</option>
            <option>Ward 4</option>
            <option>Ward 5</option>
            <option>Ward 6</option>
          </select>
        </div>
      )}

      {setSort && (
        <div className="filter-group">
          <label htmlFor="sort-select">Sort By:</label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="oldest">Oldest First (Priority Queue)</option>
            <option value="newest">Newest First</option>
            <option value="longest_pending">Longest Pending Days</option>
            <option value="recently_updated">Recently Updated</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default FilterBar;