import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__logo">◆</span> Adaptive<strong>Learn</strong>
      </Link>

      {user && (
        <nav className="navbar__links">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
        </nav>
      )}

      <div className="navbar__right">
        {user ? (
          <>
            <span className="navbar__user">{user.name}</span>
            <button className="btn btn--ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <Link to="/login" className="btn btn--ghost">Log in</Link>
        )}
      </div>
    </header>
  );
}
