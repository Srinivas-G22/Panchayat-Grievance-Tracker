import { Link } from "react-router-dom";
import "../styles/navbar.css";

function NavBar({ apiStatus = "live" }) {
  return (
    <header className="navbar-container">
      <div className="top-gov-bar">
        <div className="gov-title">
          <span>भारत सरकार | Government of India</span>
          <span className="separator">•</span>
          <span>पंचायती राज मंत्रालय | Ministry of Panchayati Raj</span>
        </div>
        <div className="mode-badge">
          <span className={`status-dot ${apiStatus}`}></span>
          <span>{apiStatus === "live" ? "Live Database API" : "Offline Data Mode"}</span>
        </div>
      </div>

      <nav className="main-navbar">
        <Link to="/" className="brand-section">
          <div className="emblem-container">
            <svg viewBox="0 0 100 100" className="emblem-svg" aria-label="National Emblem">
              <circle cx="50" cy="50" r="45" fill="#0f2942" stroke="#d97706" strokeWidth="4"/>
              <path d="M50 15 L58 35 L80 35 L62 48 L68 70 L50 56 L32 70 L38 48 L20 35 L42 35 Z" fill="#f59e0b"/>
              <circle cx="50" cy="50" r="14" fill="#0056b3"/>
            </svg>
          </div>
          <div className="brand-titles">
            <h1>Panchayat Grievance Register</h1>
            <p>Citizen Service Portal & Priority Resolution Tracker</p>
          </div>
        </Link>

        <div className="nav-actions">
          <Link to="/" className="nav-link active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;