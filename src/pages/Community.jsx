export default function Community({ navigate }) {
  return (
    <div className="simple-page">
      <section className="simple-hero">
        <span>Community</span>
        <h1>Community is coming soon.</h1>
        <p>
          We’re preparing reader discussions, shared shelves, book clubs, and community recommendations.
        </p>

        <div className="simple-actions">
          <button className="btn btn-primary" onClick={() => navigate("home")}>
            Back Home
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("search")}>
            Browse Books
          </button>
        </div>
      </section>
    </div>
  );
}