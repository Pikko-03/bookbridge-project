export default function NotFound({ navigate }) {
  return (
    <div className="empty-state not-found-page">
      <div className="empty-icon">🧭</div>
      <h3>Page not found</h3>
      <p>
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <div className="empty-actions">
        <button className="btn btn-primary" onClick={() => navigate("home")}>
          Back Home
        </button>

        <button className="btn btn-secondary" onClick={() => navigate("search")}>
          Browse Books
        </button>
      </div>
    </div>
  );
}