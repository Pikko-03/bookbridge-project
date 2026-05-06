import notFoundImg from "../assets/404.png";
export default function NotFound({ navigate }) {
  return (
    <div className="empty-state not-found-page">
      <img src={notFoundImg} alt="404 error" className="notfound-image" />

      <h3>Oops! Page not found</h3>
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