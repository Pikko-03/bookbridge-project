import { useState } from "react";

export default function Header({
  page,
  navigate,
  totalBooks,
  user,
  onLogout,
}) {
  const [q, setQ] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate("search");
      setDrawerOpen(false);
    }
  };

  const handleNav = (target) => {
    navigate(target);
    setDrawerOpen(false);
  };

  const getInitial = () =>
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="header">
        <div className="header-inner">

          {/* ── Logo ── */}
          <div className="logo" onClick={() => navigate("home")}>
            Book<span>Bridge</span>
          </div>

          {/* ── Desktop: search bar ── */}
          <form className="header-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search books, authors..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>

          {/* ── Desktop: nav links ── */}
          <nav className="nav">
            <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => navigate("home")}>Home</button>
            <button className={`nav-btn ${page === "search" ? "active" : ""}`} onClick={() => navigate("search")}>Browse</button>
            <button className={`nav-btn ${page === "mybooks" ? "active" : ""}`} onClick={() => navigate("mybooks")}>
              My Books
              {totalBooks > 0 && <span className="nav-badge">{totalBooks}</span>}
            </button>
            <button className={`nav-btn ${page === "ai" ? "active" : ""}`} onClick={() => navigate("ai")}>Recommendations</button>
          </nav>

          {/* ── Desktop: auth buttons ── */}
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

          {/* ── Mobile: hamburger button ── */}
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

      {/* ── Mobile drawer overlay ── */}
      <div
        className={`nav-drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Mobile drawer panel ── */}
      <div className={`nav-drawer ${drawerOpen ? "open" : ""}`}>

        {/* Drawer header */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-logo">
            Book<span>Bridge</span>
          </div>
          <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </div>

        {/* Drawer search */}
        <form className="nav-drawer-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search books, authors..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>

        {/* Drawer nav links */}
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

        {/* Drawer auth */}
        <div className="nav-drawer-auth">
          {user ? (
            <>
              <button className="nav-drawer-profile" onClick={() => handleNav("profile")}>
                <span className="header-avatar">{getInitial()}</span>
                <span>{user.name || "My Profile"}</span>
              </button>
              <button className="auth-mini-btn logout-mini-btn" onClick={() => { onLogout(); setDrawerOpen(false); }}>
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