import { useEffect, useMemo, useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import Statistics from "../components/Statistics";
import GrievanceCard from "../components/GrievanceCard";
import Loading from "../components/Loading";
import Empty from "../components/Empty";
import Error from "../components/Error";

import "../styles/dashboard.css";

function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState("live");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [ward, setWard] = useState("All Wards");
  const [sort, setSort] = useState("oldest");

  const loadData = useCallback(() => {
    let ignore = false;

    fetch("/api/grievances")
      .then((res) => {
        if (!res.ok) throw new Error(`API response HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (ignore) return;
        setGrievances(data);
        setApiStatus("live");

        return fetch("/api/statistics")
          .then((sRes) => sRes.ok ? sRes.json() : null)
          .then((sData) => {
            if (ignore) return;
            if (sData) setStats(sData);
            setLoading(false);
          });
      })
      .catch(() => {
        if (ignore) return;
        fetch("/grievances.json")
          .then((fRes) => {
            if (!fRes.ok) throw new Error("Unable to fetch grievance data file");
            return fRes.json();
          })
          .then((jsonData) => {
            if (ignore) return;
            setGrievances(jsonData);
            setApiStatus("json");
            setStats(null);
            setLoading(false);
          })
          .catch((err) => {
            if (ignore) return;
            setError(err.message || "Failed to load grievance data");
            setLoading(false);
          });
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return loadData();
  }, [loadData]);

  const resetFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
    setWard("All Wards");
    setSort("oldest");
  };

  const filteredData = useMemo(() => {
    let result = [...grievances];

    // Live Search across ID, Citizen, Ward, Dept, Category, Officer
    if (search.trim() !== "") {
      const q = search.toLowerCase().trim();
      result = result.filter((g) => {
        const idStr = String(g.id || "");
        const citizenStr = (g.citizen || "").toLowerCase();
        const wardStr = (g.ward || "").toLowerCase();
        const deptStr = (g.department || "").toLowerCase();
        const catStr = (g.category || "").toLowerCase();
        const officerStr = (g.assignedOfficer || g.officer || "").toLowerCase();
        return (
          idStr.includes(q) ||
          citizenStr.includes(q) ||
          wardStr.includes(q) ||
          deptStr.includes(q) ||
          catStr.includes(q) ||
          officerStr.includes(q)
        );
      });
    }

    // Department Filter
    if (department !== "All Departments" && department !== "All") {
      result = result.filter((g) => g.department === department);
    }

    // Status Filter
    if (status !== "All Status" && status !== "All") {
      result = result.filter((g) => g.status === status);
    }

    // Ward Filter
    if (ward !== "All Wards" && ward !== "All") {
      result = result.filter((g) => g.ward === ward);
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(`${a.date}T00:00:00`);
      const dateB = new Date(`${b.date}T00:00:00`);

      if (sort === "newest") {
        return dateB - dateA;
      } else if (sort === "longest_pending") {
        // Priority to unresolved cases with oldest date
        if (a.status !== "Resolved" && b.status === "Resolved") return -1;
        if (a.status === "Resolved" && b.status !== "Resolved") return 1;
        return dateA - dateB;
      } else if (sort === "recently_updated") {
        const resA = a.dateResolved ? new Date(`${a.dateResolved}T00:00:00`) : dateA;
        const resB = b.dateResolved ? new Date(`${b.dateResolved}T00:00:00`) : dateB;
        return resB - resA;
      } else {
        // Default: Unresolved cases first ordered by highest pending days (oldest date filed), resolved cases at the very end
        const isAResolved = a.status === "Resolved";
        const isBResolved = b.status === "Resolved";
        if (!isAResolved && isBResolved) return -1;
        if (isAResolved && !isBResolved) return 1;
        return dateA - dateB;
      }
    });

    return result;
  }, [search, department, status, ward, sort, grievances]);

  return (
    <>
      <NavBar apiStatus={apiStatus} />

      <main className="dashboard-content">
        <Statistics grievances={grievances} stats={stats} />

        <div className="controls-card">
          <SearchBar search={search} setSearch={setSearch} />

          <FilterBar
            department={department}
            setDepartment={setDepartment}
            status={status}
            setStatus={setStatus}
            ward={ward}
            setWard={setWard}
            sort={sort}
            setSort={setSort}
          />
        </div>

        <div className="results-summary-row">
          <div className="record-count">
            Showing <strong>{filteredData.length}</strong> of <strong>{grievances.length}</strong> registered complaints
          </div>
          {(search || department !== "All Departments" || status !== "All Status" || ward !== "All Wards" || sort !== "oldest") && (
            <button className="reset-inline-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {loading && <Loading />}

        {!loading && error && <Error message={error} onRetry={loadData} />}

        {!loading && !error && filteredData.length === 0 && (
          <Empty onReset={resetFilters} />
        )}

        {!loading && !error && filteredData.length > 0 && (
          <div className="grievance-grid">
            {filteredData.map((item) => (
              <GrievanceCard key={item.id} grievance={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Dashboard;
