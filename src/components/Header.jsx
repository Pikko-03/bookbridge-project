import { useState } from "react";

export default function Header({
  page,
  navigate,
  totalBooks,
  user,
  onLogout,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const goToSearch = () => {
    navigate("search");
    setDrawerOpen(false);
  };

  const handleNav = (target) => {
    navigate(target);
    setDrawerOpen(false);
  };

  const getInitial = () => user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo" onClick={() => navigate("home")}>
            Book<span>Bridge</span>
          </div>

          <button
            type="button"
            className="header-search header-search-button"
            onClick={goToSearch}
            aria-label="Go to Browse Books"
          >
            <span>Search books, authors...</span>
          </button>

          <nav className="nav">
            <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => navigate("home")}>Home</button>
            <button className={`nav-btn ${page === "search" ? "active" : ""}`} onClick={() => navigate("search")}>Browse</button>
            <button className={`nav-btn ${page === "mybooks" ? "active" : ""}`} onClick={() => navigate("mybooks")}>
              My Books
              {totalBooks > 0 && <span className="nav-badge">{totalBooks}</span>}
            </button>
            <button className={`nav-btn ${page === "ai" ? "active" : ""}`} onClick={() => navigate("ai")}>Recommendations</button>
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
                <button className="auth-mini-btn login-mini-btn" onClick={() => navigate("login")}>Log In</button>
                <button className="auth-mini-btn signup-mini-btn" onClick={() => navigate("signup")}>Sign Up</button>
              </>
            )}
          </div>

          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`nav-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      <div className={`nav-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="nav-drawer-header">
          <div className="nav-drawer-logo">
            Book<span>Bridge</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>

        <button
          type="button"
          className="nav-drawer-search nav-drawer-search-button"
          onClick={goToSearch}
        >
          Search books, authors...
        </button>

        <div className="nav-drawer-links">
          <button className={`nav-drawer-btn ${page === "home" ? "active" : ""}`} onClick={() => handleNav("home")}>🏠 Home</button>
          <button className={`nav-drawer-btn ${page === "search" ? "active" : ""}`} onClick={() => handleNav("search")}>🔍 Browse Books</button>
          <button className={`nav-drawer-btn ${page === "mybooks" ? "active" : ""}`} onClick={() => handleNav("mybooks")}>
            📚 My Books
            {totalBooks > 0 && <span className="nav-badge">{totalBooks}</span>}
          </button>
          <button className={`nav-drawer-btn ${page === "ai" ? "active" : ""}`} onClick={() => handleNav("ai")}>✨ Recommendations</button>
          <button className={`nav-drawer-btn ${page === "about" ? "active" : ""}`} onClick={() => handleNav("about")}>ℹ️ About</button>
          <button className={`nav-drawer-btn ${page === "help" ? "active" : ""}`} onClick={() => handleNav("help")}>❓ Help Center</button>
        </div>

        <div className="nav-drawer-auth">
          {user ? (
            <>
              <button className="nav-drawer-profile" onClick={() => handleNav("profile")}>
                <span className="header-avatar">{getInitial()}</span>
                <span>{user.name || "My Profile"}</span>
              </button>
              <button
                className="auth-mini-btn logout-mini-btn"
                onClick={() => {
                  setDrawerOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="auth-mini-btn login-mini-btn" onClick={() => handleNav("login")}>Log In</button>
              <button className="auth-mini-btn signup-mini-btn" onClick={() => handleNav("signup")}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </>
  );
}