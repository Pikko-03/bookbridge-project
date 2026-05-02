import { useState, useEffect } from "react";
import BookCover from "../components/BookCover";
import ShelfSelector from "../components/ShelfSelector";

const CATEGORIES = [
  "All",
  "Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Biography",
  "History",
  "Self-Help",
];

export default function Home({
  navigate,
  shelves,
  user,
  recentlyViewed = [],
  addToShelf,
  removeFromShelf,
  getShelf,
}) {
  const [browseCategory, setBrowseCategory] = useState("All");
  const [browseBooks, setBrowseBooks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [tasteBooks, setTasteBooks] = useState([]);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingTaste, setLoadingTaste] = useState(false);

  const totalRead = shelves.read.length;
  const totalReading = shelves.reading.length;
  const totalWant = shelves.want.length;
  const readingGoal = Number(user?.readingGoal || 12);
  const challengePercent = Math.min(100, (totalRead / readingGoal) * 100);

  const normalizeBook = (book) => ({
    ...book,
    title: book.title || "Untitled Book",
    author: book.author || book.author_name?.[0] || "Unknown Author",
    author_name: book.author_name || [book.author || "Unknown Author"],
    subject: book.subject || [],
  });

  const BookCard = ({ book }) => {
    const normalizedBook = normalizeBook(book);

    return (
      <div className="minimal-book-card">
        <div onClick={() => navigate("book", normalizedBook)}>
          <BookCover book={normalizedBook} />
          <h3>{normalizedBook.title}</h3>
          <p>{normalizedBook.author}</p>
        </div>

        <ShelfSelector
          book={normalizedBook}
          getShelf={getShelf}
          addToShelf={addToShelf}
          removeFromShelf={removeFromShelf}
          compact
        />
      </div>
    );
  };

  const SkeletonGrid = ({ count = 8 }) => (
    <div className="minimal-book-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-book-card">
          <div className="skeleton skeleton-cover" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-btn" />
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    const query =
      browseCategory === "All" ? "popular books" : `${browseCategory} books`;

    setLoadingBrowse(true);

    fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        query
      )}&limit=8&fields=key,title,author_name,cover_i,first_publish_year,subject`
    )
      .then((r) => r.json())
      .then((d) => setBrowseBooks((d.docs || []).map(normalizeBook).slice(0, 8)))
      .catch(() => setBrowseBooks([]))
      .finally(() => setLoadingBrowse(false));
  }, [browseCategory]);

  useEffect(() => {
    setLoadingTrending(true);

    fetch(
      "https://openlibrary.org/search.json?q=trending bestseller books&limit=8&fields=key,title,author_name,cover_i,first_publish_year,subject"
    )
      .then((r) => r.json())
      .then((d) => setTrending((d.docs || []).map(normalizeBook).slice(0, 8)))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    const preferred = user?.preferredGenres || [];

    if (!preferred.length) {
      setTasteBooks([]);
      return;
    }

    setLoadingTaste(true);

    fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(
        preferred.slice(0, 3).join(" ") + " books"
      )}&limit=8&fields=key,title,author_name,cover_i,first_publish_year,subject`
    )
      .then((r) => r.json())
      .then((d) => setTasteBooks((d.docs || []).map(normalizeBook).slice(0, 8)))
      .catch(() => setTasteBooks([]))
      .finally(() => setLoadingTaste(false));
  }, [user]);

  return (
    <div className="home-v2">
      <section className="home-v2-hero">
        <div className="home-v2-hero-copy">
          <span className="home-v2-kicker">Personal Reading Companion</span>

          <h1>Discover, track, and build your reading life.</h1>

          <p>
            BookBridge helps you find better books, organize your shelves, and
            keep your reading progress in one calm space.
          </p>

          <div className="home-v2-actions">
            <button className="btn btn-amber" onClick={() => navigate("search")}>
              Browse Books
            </button>

            <button className="btn btn-outline" onClick={() => navigate("ai")}>
              Get Recommendations
            </button>
          </div>
        </div>

        <div className="home-v2-challenge-card">
          <div className="challenge-card-top">
            <span>Reading Challenge</span>
            <strong>{new Date().getFullYear()}</strong>
          </div>

          <div className="challenge-big-number">
            <strong>{totalRead}</strong>
            <span>/ {readingGoal}</span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${challengePercent}%` }}
            />
          </div>

          <p>
            {readingGoal - totalRead > 0
              ? `${readingGoal - totalRead} books left to reach your goal`
              : "Goal completed. Great job!"}
          </p>
        </div>
      </section>

      <section className="home-v2-stats">
        <div>
          <strong>{totalRead}</strong>
          <span>Books Read</span>
        </div>

        <div>
          <strong>{totalReading}</strong>
          <span>Currently Reading</span>
        </div>

        <div>
          <strong>{totalWant}</strong>
          <span>Want to Read</span>
        </div>
      </section>

      <section className="home-v2-section">
        <div className="home-v2-section-head">
          <h2>Browse By Category</h2>
          <p>Start with a genre and explore books that match your mood.</p>
        </div>

        <div className="home-v2-category-row">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`home-v2-category ${
                browseCategory === category ? "active" : ""
              }`}
              onClick={() => setBrowseCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loadingBrowse ? (
          <SkeletonGrid />
        ) : browseBooks.length > 0 ? (
          <div className="minimal-book-grid">
            {browseBooks.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No books found</h3>
            <p>Try another category or browse all books.</p>
          </div>
        )}
      </section>

      <section className="home-v2-section">
        <div className="home-v2-section-head">
          <h2>Trending Books</h2>
          <p>Popular picks readers are exploring now.</p>
        </div>

        {loadingTrending ? (
          <SkeletonGrid />
        ) : (
          <div className="minimal-book-grid">
            {trending.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
        )}
      </section>

      {user?.preferredGenres?.length > 0 && (
        <section className="home-v2-section">
          <div className="home-v2-section-head">
            <h2>Based on Your Taste</h2>
            <p>Picks based on {user.preferredGenres.slice(0, 3).join(", ")}.</p>
          </div>

          {loadingTaste ? (
            <SkeletonGrid />
          ) : tasteBooks.length > 0 ? (
            <div className="minimal-book-grid">
              {tasteBooks.map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>No personalized picks yet</h3>
              <p>Update your preferred genres in your profile.</p>
              <button className="btn btn-primary" onClick={() => navigate("profile")}>
                Update Preferences
              </button>
            </div>
          )}
        </section>
      )}

      {recentlyViewed.length > 0 && (
        <section className="home-v2-section">
          <div className="home-v2-section-head">
            <h2>Recently Viewed</h2>
            <p>Pick up where you left off.</p>
          </div>

          <div className="minimal-book-grid">
            {recentlyViewed.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}