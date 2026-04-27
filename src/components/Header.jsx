import { useState } from "react";

export default function Header({ page, navigate, totalBooks, user, onLogout }) {
  const [q, setQ] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    if (q.trim()) {
      navigate("search");
    }
  };

  const getInitial = () => {
    return user?.name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo" onClick={() => navigate("home")}>
          Book<span>Bridge</span>
        </div>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search books, authors..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        <nav className="nav">
          <button
            className={`nav-btn ${page === "home" ? "active" : ""}`}
            onClick={() => navigate("home")}
          >
            Home
          </button>

          <button
            className={`nav-btn ${page === "search" ? "active" : ""}`}
            onClick={() => navigate("search")}
          >
            Browse
          </button>

          <button
            className={`nav-btn ${page === "mybooks" ? "active" : ""}`}
            onClick={() => navigate("mybooks")}
          >
            My Books
            {totalBooks > 0 && <span className="nav-badge">{totalBooks}</span>}
          </button>

          <button
            className={`nav-btn ${page === "ai" ? "active" : ""}`}
            onClick={() => navigate("ai")}
          >
            Recommendations
          </button>
        </nav>

        <div className="header-auth">
          {user ? (
            <>
              <button
                className={`header-profile-pill ${page === "profile" ? "active" : ""}`}
                onClick={() => navigate("profile")}
                title="Profile"
              >
                <span className="header-avatar">{getInitial()}</span>
              </button>

              <button className="auth-mini-btn logout-mini-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="auth-mini-btn login-mini-btn"
                onClick={() => navigate("login")}
              >
                Log In
              </button>

              <button
                className="auth-mini-btn signup-mini-btn"
                onClick={() => navigate("signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}