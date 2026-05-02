import { useState } from "react";
import BookCover from "../components/BookCover";
import StarRating from "../components/StarRating";
import ShelfSelector from "../components/ShelfSelector";

const QUICK_PROMPTS = [
  "Books similar to Harry Potter",
  "Mystery and thriller books with strong twists",
  "Books about psychology and human behavior",
  "Self-help books for personal growth",
  "Classic books everyone should read",
  "Fantasy books for beginners",
  "Romance books with emotional stories",
  "Science fiction books with big ideas",
];

const FALLBACK_GENRES = [
  "Fantasy",
  "Mystery",
  "Romance",
  "Psychology",
  "Science Fiction",
  "Self-Help",
];

export default function AIRecommend({
  navigate,
  shelves,
  user,
  addToShelf,
  removeFromShelf,
  getShelf,
}) {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const readBooks = shelves?.read || [];
  const wantBooks = shelves?.want || [];
  const readingBooks = shelves?.reading || [];
  const totalBooks = Object.values(shelves || {}).flat().length;
const [hasSearched, setHasSearched] = useState(false);
  const normalizeBook = (book) => ({
    ...book,
    title: book.title || "Untitled Book",
    author: book.author || book.author_name?.[0] || "Unknown Author",
    author_name: book.author_name || [book.author || "Unknown Author"],
    subject: book.subject || [],
    rating: book.rating || Math.floor(Math.random() * 2) + 4,
  });

  const getSeed = () => {
    const preferredGenres = user?.preferredGenres || [];

    if (prompt.trim()) {
      return {
        query: `${prompt.trim()} books`,
        reason: `Based on your request: "${prompt.trim()}"`,
      };
    }

    if (readBooks.length > 0) {
      const book = readBooks[0];
      return {
        query: `${book.subject?.[0] || book.title} books`,
        reason: `Because you read ${book.title}`,
      };
    }

    if (readingBooks.length > 0) {
      const book = readingBooks[0];
      return {
        query: `${book.subject?.[0] || book.title} books`,
        reason: `Because you are currently reading ${book.title}`,
      };
    }

    if (wantBooks.length > 0) {
      const book = wantBooks[0];
      return {
        query: `${book.subject?.[0] || book.title} books`,
        reason: `Because you want to read ${book.title}`,
      };
    }

    if (preferredGenres.length > 0) {
      return {
        query: `${preferredGenres.slice(0, 2).join(" ")} books`,
        reason: `Based on your favorite genres: ${preferredGenres.join(", ")}`,
      };
    }

    return {
      query: `${FALLBACK_GENRES[Math.floor(Math.random() * FALLBACK_GENRES.length)]} books`,
      reason: "Popular picks to help you get started",
    };
  };

  const getRecommendations = async () => {
    const seed = getSeed();

    setLoading(true);
    setHasSearched(true);
    setReason(seed.reason);
    setRecommendations([]);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          seed.query
        )}&limit=24&fields=key,title,author_name,cover_i,first_publish_year,subject`
      );

      const data = await res.json();

      const books = (data.docs || [])
        .filter((book) => book.key && book.title)
        .map((book) =>
          normalizeBook({
            ...book,
            reason: book.subject?.[0]
              ? `Because you may like ${book.subject[0]}`
              : seed.reason,
          })
        )
        .slice(0, 8);

      setRecommendations(books);
    } catch (error) {
      console.error("Recommendation failed:", error);
      setRecommendations([]);
    }

    setLoading(false);
  };

  const clearAll = () => {
    setPrompt("");
    setRecommendations([]);
    setReason("");
    setHasSearched(false);
  };

  return (
    <div className="ai-recommend-page">
      <section className="ai-new-hero">
        <div className="ai-new-hero-content">
          <span className="ai-kicker">Personalized discovery</span>

          <h1>Find your next great read</h1>

          <p>
            Get recommendations based on your shelves, preferred genres, and reading interests.
          </p>

          <div className="ai-hero-actions">
            <button className="btn btn-amber" onClick={getRecommendations}>
              Recommend for Me
            </button>

            <button className="btn btn-outline" onClick={() => navigate("profile")}>
              Update Preferences
            </button>
          </div>
        </div>

        <div className="ai-insight-card taste-profile-card">
  <h3>Your taste profile</h3>

  <div className="taste-genre-list">
    {(user?.preferredGenres?.length ? user.preferredGenres : FALLBACK_GENRES.slice(0, 3)).map(
      (genre) => (
        <span key={genre}>{genre}</span>
      )
    )}
  </div>

  <p>{totalBooks} books in your library</p>
</div>
      </section>

      {totalBooks > 0 && (
        <div className="alert alert-success ai-personal-alert">
          Your recommendations can use your shelf history and profile preferences.
        </div>
      )}

      <section className="ai-command-card">
        <div className="ai-command-header">
          <h2>What would you like to read?</h2>
          <p>Choose a prompt or describe your ideal book.</p>
        </div>

        <div className="quick-prompt-row">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item}
              type="button"
              className={`genre-chip ${prompt === item ? "selected" : ""}`}
              onClick={() => setPrompt(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <textarea
          className="ai-prompt-box"
          placeholder="Example: I want a mystery book with deep characters and a surprising ending..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="ai-command-footer">
          <button className="btn btn-primary" onClick={getRecommendations} disabled={loading}>
            {loading ? "Finding books..." : "Get Recommendations"}
          </button>

          <button className="btn btn-secondary" onClick={clearAll}>
            Clear
          </button>
        </div>
      </section>

      {loading && (
        <section className="ai-results">
          <div className="ai-results-header">
            <div>
              <h2 className="section-title">Finding books for you</h2>
              <p className="section-subtitle">Personalizing results from Open Library...</p>
            </div>
          </div>

          <div className="ai-recommend-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton-book-card">
                <div className="skeleton skeleton-cover" />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-btn" />
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && recommendations.length > 0 && (
        <section className="ai-results">
          <div className="ai-results-header">
            <div>
              <h2 className="section-title">Recommended for You</h2>
              <p className="section-subtitle">{reason}</p>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={getRecommendations}>
              Refresh
            </button>
          </div>

          <div className="ai-recommend-grid">
            {recommendations.map((book) => (
              <div
                key={book.key}
                className="ai-recommend-card"
                onClick={() => navigate("book", book)}
              >
                <BookCover book={book} />

                <div className="ai-book-title">{book.title}</div>
                <div className="ai-book-author">{book.author}</div>

                <div className="ai-book-meta">
                  <StarRating value={book.rating} readOnly />
                  {book.first_publish_year && <span>{book.first_publish_year}</span>}
                </div>

                <div className="ai-reason">{book.reason}</div>

                <div onClick={(e) => e.stopPropagation()}>
                  <ShelfSelector
                    book={book}
                    getShelf={getShelf}
                    addToShelf={addToShelf}
                    removeFromShelf={removeFromShelf}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && recommendations.length === 0 && (
  <section className="empty-state ai-empty-results">
    <div className="empty-icon">{hasSearched ? "🔎" : "📚"}</div>

    <h3>
      {hasSearched
        ? "No recommendations found"
        : "Start your recommendation journey"}
    </h3>

    <p>
      {hasSearched
        ? "Try a simpler prompt, choose one of the quick prompts, or update your reading preferences."
        : "Use a prompt, or click Recommend for Me to get suggestions from your profile and shelves."}
    </p>

    <div className="empty-actions">
      {hasSearched ? (
        <>
          <button
            className="btn btn-primary"
            onClick={() => setPrompt("Fantasy books for beginners")}
          >
            Try a sample prompt
          </button>

          <button className="btn btn-secondary" onClick={clearAll}>
            Reset
          </button>
        </>
      ) : (
        <button className="btn btn-primary" onClick={getRecommendations}>
          Recommend for Me
        </button>
      )}
    </div>
  </section>
)}
    </div>
  );
}