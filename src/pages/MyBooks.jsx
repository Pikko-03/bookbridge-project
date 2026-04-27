import { useMemo, useState } from "react";
import BookCover from "../components/BookCover";

const SHELVES = ["all", "reading", "want", "read"];

const LABELS = {
  all: "All Books",
  reading: "Currently Reading",
  want: "Want to Read",
  read: "Finished",
};

export default function MyBooks({ shelves, navigate, removeFromShelf, user }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");

  const allBooks = useMemo(() => {
    return Object.entries(shelves).flatMap(([shelf, books]) =>
      books.map((book) => ({ ...book, shelf }))
    );
  }, [shelves]);

  const readingGoal = Number(user?.readingGoal || 12);
  const completed = shelves.read.length;
  const progress = Math.min(100, (completed / readingGoal) * 100);

  const getBooksForTab = () => {
    if (activeTab === "all") return allBooks;
    return shelves[activeTab].map((book) => ({ ...book, shelf: activeTab }));
  };

  const books = getBooksForTab()
    .filter((book) =>
      `${book.title} ${book.author || book.author_name?.[0] || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "author") {
        return (a.author || "").localeCompare(b.author || "");
      }
      return a.title.localeCompare(b.title);
    });

  if (!user) {
    return (
      <div className="empty-state">
        <h3>Please log in</h3>
        <p>Track your personal library and reading progress.</p>
        <button className="btn btn-primary" onClick={() => navigate("login")}>
          Log In
        </button>
      </div>
    );
  }

  if (allBooks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📚</div>
        <h3>Your library is empty</h3>
        <p>Start adding books to build your personal bookshelf.</p>
        <button className="btn btn-primary" onClick={() => navigate("search")}>
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="library-v2">
      <section className="library-v2-hero">
        <div>
          <span className="library-kicker">Personal Bookshelf</span>
          <h1>My Library</h1>
          <p>Track what you are reading, what you want to read, and everything you have finished.</p>
        </div>

        <div className="library-challenge-card">
  <div className="challenge-card-top">
    <span>Reading Challenge</span>
    <strong>{new Date().getFullYear()}</strong>
  </div>

  <div className="challenge-big-number">
    <strong>{completed}</strong>
    <span>/{readingGoal}</span>
  </div>

  <div className="progress-bar">
    <div
      className="progress-fill"
      style={{ width: `${progress}%` }}
    />
  </div>

  <p>
    {Math.max(readingGoal - completed, 0)} books left to reach your goal
  </p>
</div>
      </section>

      <section className="library-v2-stats">
        <div>
          <strong>{allBooks.length}</strong>
          <span>Total Books</span>
        </div>
        <div>
          <strong>{shelves.reading.length}</strong>
          <span>Reading</span>
        </div>
        <div>
          <strong>{shelves.want.length}</strong>
          <span>Want to Read</span>
        </div>
        <div>
          <strong>{shelves.read.length}</strong>
          <span>Finished</span>
        </div>
      </section>

      {shelves.reading.length > 0 && (
        <section className="library-section">
          <div className="library-section-head">
            <h2>Continue Reading</h2>
            <p>Books you are currently reading.</p>
          </div>

          <div className="library-continue-row">
            {shelves.reading.slice(0, 4).map((book) => (
              <div
                key={book.key}
                className="library-continue-card"
                onClick={() => navigate("book", book)}
              >
                <BookCover book={book} />
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.author || book.author_name?.[0]}</p>
                  <span>Currently reading</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="library-section">
        <div className="library-toolbar">
          <div className="library-tabs">
            {SHELVES.map((shelf) => {
              const count = shelf === "all" ? allBooks.length : shelves[shelf].length;

              return (
                <button
                  key={shelf}
                  className={`library-tab ${activeTab === shelf ? "active" : ""}`}
                  onClick={() => setActiveTab(shelf)}
                >
                  {LABELS[shelf]} <span>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="library-controls">
            <input
              placeholder="Search your library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="title">Sort by title</option>
              <option value="author">Sort by author</option>
            </select>
          </div>
        </div>

        {books.length > 0 ? (
          <div className="library-book-grid">
            {books.map((book) => (
              <div
                key={`${book.shelf}-${book.key}`}
                className="library-book-card"
                onClick={() => navigate("book", book)}
              >
                <BookCover book={book} />

                <div className="library-book-info">
                  <span className="library-shelf-pill">{LABELS[book.shelf]}</span>
                  <h3>{book.title}</h3>
                  <p>{book.author || book.author_name?.[0] || "Unknown Author"}</p>
                </div>

                <button
                  className="library-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromShelf(book);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No books found</h3>
            <p>Try another keyword or shelf.</p>
          </div>
        )}
      </section>
    </div>
  );
}