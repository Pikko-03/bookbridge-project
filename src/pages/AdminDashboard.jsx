import { useEffect, useMemo, useState } from "react";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const ADMIN_EMAIL = "admin010@gmail.com";
const PAGE_SIZE = 10;

export default function AdminDashboard({ user, navigate }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  // Search & filter
  const [userSearch, setUserSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Pagination
  const [userPage, setUserPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  const loadAdminData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);

      // Load users
      const usersSnap = await getDocs(collection(db, "users"));
      const userList = usersSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setUsers(userList);

      // Load reviews via collectionGroup
      const reviewsSnap = await getDocs(collectionGroup(db, "reviews"));
      const reviewList = reviewsSnap.docs
        .map((d) => ({
          id: d.id,
          path: d.ref.path,
          userId: d.ref.parent.parent?.id,
          ...d.data(),
        }))
        .sort((a, b) => new Date(b.updatedAt || b.date || 0) - new Date(a.updatedAt || a.date || 0));
      setReviews(reviewList);
      // Enrich reviews missing reviewer info using users list
const enriched = reviewList.map((r) => {
  if (r.reviewerName && r.reviewerEmail) return r;
  const match = userList.find((u) => u.id === r.userId);
  return {
    ...r,
    reviewerName: r.reviewerName || match?.name || "Anonymous",
    reviewerEmail: r.reviewerEmail || match?.email || "No email",
  };
});
setReviews(enriched);

      // Load shelves via collectionGroup
      const shelvesSnap = await getDocs(collectionGroup(db, "shelves"));
      const shelvesList = shelvesSnap.docs.map((d) => ({
        id: d.id,
        path: d.ref.path,
        userId: d.ref.parent.parent?.id,
        ...d.data(),
      }));
      setShelves(shelvesList);

    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const newUsersToday = users.filter((u) => u.createdAt?.startsWith(today)).length;
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
      : "—";

    return [
      { label: "Total Users", value: users.length, icon: "👥", color: "#6366f1" },
      { label: "Total Shelved", value: shelves.length, icon: "📚", color: "#0ea5e9" },
      { label: "Total Reviews", value: reviews.length, icon: "⭐", color: "#f59e0b" },
      { label: "New Today", value: newUsersToday, icon: "🆕", color: "#10b981" },
      { label: "Avg Rating", value: avgRating, icon: "📊", color: "#8b5cf6" },
    ];
  }, [users, reviews, shelves]);

  // Books from shelves — aggregate
  const bookStats = useMemo(() => {
    const map = {};
    shelves.forEach((s) => {
      const book = s.book;
      if (!book) return;
      const key = book.key || book.title;
      if (!map[key]) {
        map[key] = { title: book.title || "Unknown", author: book.author || "Unknown", count: 0, shelves: {} };
      }
      map[key].count++;
      map[key].shelves[s.shelf] = (map[key].shelves[s.shelf] || 0) + 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [shelves]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(
      (u) =>
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    const q = reviewSearch.toLowerCase();
    return reviews.filter((r) => {
      const matchSearch =
        !q ||
        (r.bookTitle || "").toLowerCase().includes(q) ||
        (r.reviewerName || "").toLowerCase().includes(q) ||
        (r.reviewerEmail || "").toLowerCase().includes(q);
      const matchRating = ratingFilter === "all" || String(r.rating) === ratingFilter;
      return matchSearch && matchRating;
    });
  }, [reviews, reviewSearch, ratingFilter]);

  // Pagination helpers
  const paginate = (arr, page) => arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = (arr) => Math.max(1, Math.ceil(arr.length / PAGE_SIZE));

  const pagedUsers = paginate(filteredUsers, userPage);
  const pagedReviews = paginate(filteredReviews, reviewPage);

  // Export CSV
  const exportCSV = (data, filename) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter((k) => typeof data[0][k] !== "object");
    const rows = [keys.join(","), ...data.map((row) => keys.map((k) => `"${(row[k] || "").toString().replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CRUD
  const saveUser = async () => {
    if (!editingUser?.id) return;
    const updatedUser = {
      ...editingUser,
      readingGoal: Number(editingUser.readingGoal || 12),
      preferredGenres: Array.isArray(editingUser.preferredGenres)
        ? editingUser.preferredGenres
        : String(editingUser.preferredGenres || "").split(",").map((g) => g.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", editingUser.id), updatedUser, { merge: true });
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    setEditingUser(null);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user profile from Firestore?")) return;
    await deleteDoc(doc(db, "users", userId));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const saveReview = async () => {
    if (!editingReview?.path) return;
    const updatedReview = {
      ...editingReview,
      rating: Number(editingReview.rating || 0),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, editingReview.path), updatedReview, { merge: true });
    setReviews((prev) => prev.map((r) => (r.path === editingReview.path ? updatedReview : r)));
    setEditingReview(null);
  };

  const deleteReview = async (reviewPath) => {
    if (!window.confirm("Delete this review?")) return;
    await deleteDoc(doc(db, reviewPath));
    setReviews((prev) => prev.filter((r) => r.path !== reviewPath));
  };

  // Guard screens
  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3>Admin login required</h3>
        <p>Please log in with the admin account.</p>
        <button className="btn btn-primary" onClick={() => navigate("login")}>Log In</button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⛔</div>
        <h3>Access denied</h3>
        <p>This dashboard is only available for the BookBridge admin.</p>
        <button className="btn btn-primary" onClick={() => navigate("home")}>Back Home</button>
      </div>
    );
  }

  return (
    <div className="adm-wrap">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          Book<span>Bridge</span>
          <small>Admin</small>
        </div>

        <nav className="adm-nav">
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "users", icon: "👥", label: "Users" },
            { id: "reviews", icon: "⭐", label: "Reviews" },
            { id: "books", icon: "📚", label: "Books" },
            { id: "charts", icon: "📈", label: "Charts" },
          ].map((item) => (
            <button
              key={item.id}
              className={`adm-nav-btn ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-avatar">{user.email?.charAt(0).toUpperCase()}</div>
          <div>
            <strong>Admin</strong>
            <span>{user.email}</span>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">
        {/* Topbar */}
        <div className="adm-topbar">
          <div>
            <h1 className="adm-page-title">
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "users" && "Users Management"}
              {activeTab === "reviews" && "Reviews Management"}
              {activeTab === "books" && "Books Management"}
              {activeTab === "charts" && "Charts & Analytics"}
            </h1>
            <p className="adm-page-sub">BookBridge · Firebase Firestore</p>
          </div>
          <button className="adm-refresh-btn" onClick={loadAdminData}>↺ Refresh</button>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Loading Firestore data…</p>
          </div>
        ) : (
          <>
            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <>
                <div className="adm-stats">
                  {stats.map((s) => (
                    <div className="adm-stat" key={s.label} style={{ "--stat-color": s.color }}>
                      <div className="adm-stat-icon">{s.icon}</div>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="adm-grid2">
                  <div className="adm-panel">
                    <h2>Recent Users</h2>
                    <div className="adm-list">
                      {users.slice(0, 6).map((u) => (
                        <div className="adm-list-row" key={u.id}>
                          <div className="adm-mini-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</div>
                          <div className="adm-list-info">
                            <strong>{u.name || "Unnamed"}</strong>
                            <span>{u.email}</span>
                          </div>
                          <span className="adm-pill">{(u.preferredGenres || []).length} genres</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="adm-panel">
                    <h2>Recent Reviews</h2>
                    <div className="adm-list">
                      {reviews.length === 0 ? (
                        <p className="adm-empty">No reviews yet.</p>
                      ) : (
                        reviews.slice(0, 6).map((r) => (
                          <div className="adm-list-row" key={r.path}>
                            <div className="adm-list-info">
                              <strong>{r.bookTitle || "Unknown Book"}</strong>
                              <span>{"⭐".repeat(Math.min(r.rating || 0, 5))} by {r.reviewerName || "Anonymous"}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="adm-panel" style={{ marginTop: "1.25rem" }}>
                  <h2>Top Shelved Books</h2>
                  <div className="adm-list" style={{ marginTop: "1rem" }}>
                    {bookStats.slice(0, 5).map((b, i) => (
                      <div className="adm-list-row" key={i}>
                        <span className="adm-rank">#{i + 1}</span>
                        <div className="adm-list-info">
                          <strong>{b.title}</strong>
                          <span>{b.author}</span>
                        </div>
                        <span className="adm-pill">{b.count} saves</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── USERS ── */}
            {activeTab === "users" && (
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h2>Users Management</h2>
                    <p className="adm-sub">{filteredUsers.length} of {users.length} users</p>
                  </div>
                  <div className="adm-toolbar">
                    <input
                      className="adm-search"
                      placeholder="Search name or email…"
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                    />
                    <button
                      className="adm-export-btn"
                      onClick={() => exportCSV(users.map(({ id, name, email, favoriteAuthor, readingGoal, joined }) => ({ id, name, email, favoriteAuthor, readingGoal, joined })), "bookbridge-users.csv")}
                    >
                      ↓ Export CSV
                    </button>
                  </div>
                </div>

                <div className="adm-table">
                  <div className="adm-table-head">
                    <span>User</span>
                    <span>Favorite Author</span>
                    <span>Goal</span>
                    <span>Genres</span>
                    <span>Actions</span>
                  </div>
                  {pagedUsers.map((u) => (
                    <div className="adm-table-row" key={u.id}>
                      <div className="adm-user-cell">
                        <div className="adm-mini-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</div>
                        <div>
                          <strong>{u.name || "Unnamed"}</strong>
                          <span>{u.email}</span>
                        </div>
                      </div>
                      <span>{u.favoriteAuthor || "—"}</span>
                      <span>{u.readingGoal || 12} books</span>
                      <span className="adm-pill">{(u.preferredGenres || []).length} genres</span>
                      <div className="adm-actions">
                        <button className="btn btn-secondary adm-sm-btn" onClick={() => setEditingUser(u)}>Edit</button>
                        <button className="btn btn-danger adm-sm-btn" onClick={() => deleteUser(u.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="adm-pagination">
                  <button disabled={userPage === 1} onClick={() => setUserPage((p) => p - 1)} className="adm-page-btn">← Prev</button>
                  <span>Page {userPage} of {totalPages(filteredUsers)}</span>
                  <button disabled={userPage >= totalPages(filteredUsers)} onClick={() => setUserPage((p) => p + 1)} className="adm-page-btn">Next →</button>
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {activeTab === "reviews" && (
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h2>Reviews Management</h2>
                    <p className="adm-sub">{filteredReviews.length} of {reviews.length} reviews</p>
                  </div>
                  <div className="adm-toolbar">
                    <input
                      className="adm-search"
                      placeholder="Search book or reviewer…"
                      value={reviewSearch}
                      onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(1); }}
                    />
                    <select
                      className="adm-select"
                      value={ratingFilter}
                      onChange={(e) => { setRatingFilter(e.target.value); setReviewPage(1); }}
                    >
                      <option value="all">All Ratings</option>
                      {[5, 4, 3, 2, 1].map((r) => (
                        <option key={r} value={r}>{"⭐".repeat(r)} ({r}/5)</option>
                      ))}
                    </select>
                    <button
                      className="adm-export-btn"
                      onClick={() => exportCSV(reviews.map(({ bookTitle, bookAuthor, reviewerName, reviewerEmail, rating, text, date }) => ({ bookTitle, bookAuthor, reviewerName, reviewerEmail, rating, text, date })), "bookbridge-reviews.csv")}
                    >
                      ↓ Export CSV
                    </button>
                  </div>
                </div>

                <div className="adm-table">
                  <div className="adm-table-head">
                    <span>Book</span>
                    <span>Reviewer</span>
                    <span>Rating</span>
                    <span>Review</span>
                    <span>Actions</span>
                  </div>
                  {pagedReviews.map((r) => (
                    <div className="adm-table-row" key={r.path}>
                      <div>
                        <strong>{r.bookTitle || "Unknown Book"}</strong>
                        <span>{r.bookAuthor || "Unknown Author"}</span>
                      </div>
                      <div>
                        <strong>{r.reviewerName || "Anonymous"}</strong>
                        <span>{r.reviewerEmail || "No email"}</span>
                      </div>
                      <span className="adm-rating">{"⭐".repeat(Math.min(r.rating || 0, 5))} {r.rating}/5</span>
                      <span className="adm-review-text">{r.text || "No text"}</span>
                      <div className="adm-actions">
                        <button className="btn btn-secondary adm-sm-btn" onClick={() => setEditingReview(r)}>Edit</button>
                        <button className="btn btn-danger adm-sm-btn" onClick={() => deleteReview(r.path)}>Delete</button>
                      </div>
                    </div>
                  ))}
                  {filteredReviews.length === 0 && <p className="adm-empty">No reviews match your filters.</p>}
                </div>

                <div className="adm-pagination">
                  <button disabled={reviewPage === 1} onClick={() => setReviewPage((p) => p - 1)} className="adm-page-btn">← Prev</button>
                  <span>Page {reviewPage} of {totalPages(filteredReviews)}</span>
                  <button disabled={reviewPage >= totalPages(filteredReviews)} onClick={() => setReviewPage((p) => p + 1)} className="adm-page-btn">Next →</button>
                </div>
              </div>
            )}

            {/* ── BOOKS ── */}
            {activeTab === "books" && (
              <div className="adm-panel">
                <div className="adm-panel-head">
                  <div>
                    <h2>Books Management</h2>
                    <p className="adm-sub">{bookStats.length} unique books across all shelves</p>
                  </div>
                  <button
                    className="adm-export-btn"
                    onClick={() => exportCSV(bookStats.map(({ title, author, count }) => ({ title, author, saves: count })), "bookbridge-books.csv")}
                  >
                    ↓ Export CSV
                  </button>
                </div>

                <div className="adm-table">
                  <div className="adm-table-head">
                    <span>#</span>
                    <span>Book</span>
                    <span>Want to Read</span>
                    <span>Reading</span>
                    <span>Read</span>
                    <span>Total Saves</span>
                  </div>
                  {bookStats.map((b, i) => (
                    <div className="adm-table-row" key={i}>
                      <span className="adm-rank">#{i + 1}</span>
                      <div>
                        <strong>{b.title}</strong>
                        <span>{b.author}</span>
                      </div>
                      <span>{b.shelves?.want || 0}</span>
                      <span>{b.shelves?.reading || 0}</span>
                      <span>{b.shelves?.read || 0}</span>
                      <span className="adm-pill">{b.count} saves</span>
                    </div>
                  ))}
                  {bookStats.length === 0 && <p className="adm-empty">No shelved books yet.</p>}
                </div>
              </div>
            )}
            {/* ── CHARTS ── */}
            {activeTab === "charts" && (() => {
              const ratingDist = [1,2,3,4,5].map((r) => ({
                rating: `${r} ⭐`,
                count: reviews.filter((rv) => Number(rv.rating) === r).length,
              }));

              const shelfDist = [
                { name: "Want to Read", value: shelves.filter((s) => s.shelf === "want").length, color: "#6366f1" },
                { name: "Reading", value: shelves.filter((s) => s.shelf === "reading").length, color: "#f59e0b" },
                { name: "Read", value: shelves.filter((s) => s.shelf === "read").length, color: "#10b981" },
              ];

              const topBooks = bookStats.slice(0, 8).map((b) => ({
                name: b.title.length > 20 ? b.title.slice(0, 20) + "…" : b.title,
                saves: b.count,
              }));

              const genreMap = {};
              users.forEach((u) => {
                (u.preferredGenres || []).forEach((g) => {
                  genreMap[g] = (genreMap[g] || 0) + 1;
                });
              });
              const topGenres = Object.entries(genreMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([name, count]) => ({ name, count }));

              const COLORS = ["#6366f1","#f59e0b","#10b981","#0ea5e9","#8b5cf6","#ec4899","#14b8a6","#f97316"];

              return (
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div className="adm-grid2">
                    <div className="adm-panel">
                      <h2>Reviews by Rating</h2>
                      <p className="adm-sub" style={{ marginBottom: "1rem" }}>Distribution of star ratings</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ratingDist} barSize={36}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="adm-panel">
                      <h2>Shelf Distribution</h2>
                      <p className="adm-sub" style={{ marginBottom: "1rem" }}>Books across all shelves</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={shelfDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                            {shelfDist.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="adm-panel">
                    <h2>Most Shelved Books</h2>
                    <p className="adm-sub" style={{ marginBottom: "1rem" }}>Top 8 books by total saves</p>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={topBooks} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="saves" fill="#0ea5e9" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="adm-panel">
                    <h2>Top Genres</h2>
                    <p className="adm-sub" style={{ marginBottom: "1rem" }}>Most popular genres across all users</p>
                    {topGenres.length === 0 ? (
                      <p className="adm-empty">No genre data yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={topGenres} barSize={32} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                          <Tooltip />
                          <Bar dataKey="count" radius={[0,6,6,0]}>
                            {topGenres.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>

      {/* ── Edit User Modal ── */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="adm-modal">
            <h2>Edit User</h2>
            <input value={editingUser.name || ""} onChange={(e) => setEditingUser((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
            <input value={editingUser.email || ""} onChange={(e) => setEditingUser((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
            <input value={editingUser.favoriteAuthor || ""} onChange={(e) => setEditingUser((p) => ({ ...p, favoriteAuthor: e.target.value }))} placeholder="Favorite author" />
            <input type="number" value={editingUser.readingGoal || ""} onChange={(e) => setEditingUser((p) => ({ ...p, readingGoal: e.target.value }))} placeholder="Reading goal" />
            <input value={(Array.isArray(editingUser.preferredGenres) ? editingUser.preferredGenres : []).join(", ")} onChange={(e) => setEditingUser((p) => ({ ...p, preferredGenres: e.target.value }))} placeholder="Genres, comma separated" />
            <div className="adm-modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveUser}>Save User</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Review Modal ── */}
      {editingReview && (
        <div className="modal-overlay">
          <div className="adm-modal">
            <h2>Edit Review</h2>
            <input value={editingReview.bookTitle || ""} onChange={(e) => setEditingReview((p) => ({ ...p, bookTitle: e.target.value }))} placeholder="Book title" />
            <input value={editingReview.bookAuthor || ""} onChange={(e) => setEditingReview((p) => ({ ...p, bookAuthor: e.target.value }))} placeholder="Book author" />
            <input type="number" min="1" max="5" value={editingReview.rating || ""} onChange={(e) => setEditingReview((p) => ({ ...p, rating: e.target.value }))} placeholder="Rating (1–5)" />
            <textarea value={editingReview.text || ""} onChange={(e) => setEditingReview((p) => ({ ...p, text: e.target.value }))} placeholder="Review text" />
            <div className="adm-modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditingReview(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveReview}>Save Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}