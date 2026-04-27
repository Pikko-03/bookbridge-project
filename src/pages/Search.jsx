import { useEffect, useMemo, useState } from "react";
import BookCover from "../components/BookCover";
import StarRating from "../components/StarRating";
import ShelfSelector from "../components/ShelfSelector";

const CATEGORIES = [
  "All",
  "Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
];

const BOOKS_PER_PAGE = 16;

export default function Search({
  navigate,
  addToShelf,
  removeFromShelf = () => {},
  getShelf,
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedText, setSearchedText] = useState("Popular books");
  const [page, setPage] = useState(1);

  const normalizeBook = (book) => {
    const stableNumber = Math.abs(
      String(book.key || book.title || "")
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    const rating = Number((3.4 + (stableNumber % 16) / 10).toFixed(1));

    return {
      ...book,
      title: book.title || "Untitled Book",
      author: book.author || book.author_name?.[0] || "Unknown Author",
      author_name: book.author_name || [book.author || "Unknown Author"],
      subject: book.subject || [],
      first_publish_year: book.first_publish_year || null,
      rating,
    };
  };

  const buildSearchTerm = () => {
    if (query.trim()) return query.trim();
    if (activeCategory !== "All") return `${activeCategory} books`;
    return "popular books";
  };

  const fetchBooks = async () => {
    const searchTerm = buildSearchTerm();

    setLoading(true);
    setPage(1);
    setSearchedText(searchTerm);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          searchTerm
        )}&limit=80&fields=key,title,author_name,cover_i,first_publish_year,subject,edition_count`
      );

      const data = await res.json();

      const cleaned = (data.docs || [])
        .filter((book) => book.title && book.key)
        .map(normalizeBook);

      setBooks(cleaned);
    } catch (error) {
      console.error("Search failed:", error);
      setBooks([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, [activeCategory]);

  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (ratingFilter !== "all") {
      result = result.filter((book) => book.rating >= Number(ratingFilter));
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => (b.first_publish_year || 0) - (a.first_publish_year || 0)
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) => (a.first_publish_year || 9999) - (b.first_publish_year || 9999)
      );
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [books, ratingFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));

  const paginatedBooks = filteredBooks.slice(
    (page - 1) * BOOKS_PER_PAGE,
    page * BOOKS_PER_PAGE
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleCategory = (category) => {
    setActiveCategory(category);
    setQuery("");
  };

  const goToPage = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (page > 4) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 3) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="search-v2">
      <section className="search-v2-hero">
        <div>
          <span className="search-v2-kicker">Explore Library</span>
          <h1>Browse books</h1>
          <p>Search titles, authors, genres, and discover books to add to your shelves.</p>
        </div>

        <form className="search-v2-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search by title, author, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section className="search-v2-results-head">
  <div>
    <h2>{searchedText}</h2>
    <p>
      Showing{" "}
      {filteredBooks.length === 0
        ? 0
        : `${(page - 1) * BOOKS_PER_PAGE + 1}-${Math.min(
            page * BOOKS_PER_PAGE,
            filteredBooks.length
          )}`}{" "}
      of {filteredBooks.length} books
    </p>
  </div>
</section>

<section className="search-v2-panel">
  <div className="search-v2-categories">
    {CATEGORIES.map((category) => (
      <button
        key={category}
        className={`category-tab ${activeCategory === category ? "active" : ""}`}
        onClick={() => handleCategory(category)}
      >
        {category}
      </button>
    ))}
  </div>

  <div className="search-v2-filter-row">
    <div className="filter-group">
      <label>Rating</label>
      <select
        value={ratingFilter}
        onChange={(e) => {
          setRatingFilter(e.target.value);
          setPage(1);
        }}
      >
        <option value="all">All ratings</option>
        <option value="4">4 stars & up</option>
        <option value="4.5">4.5 stars & up</option>
      </select>
    </div>

    <div className="filter-group">
      <label>Sort</label>
      <select
        value={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          setPage(1);
        }}
      >
        <option value="popular">Popular</option>
        <option value="rating">Highest rated</option>
        <option value="newest">Newest release</option>
        <option value="oldest">Oldest first</option>
        <option value="title">Title A-Z</option>
      </select>
    </div>
  </div>
</section>

      {loading ? (
        <div className="bento-books-grid">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="skeleton-book-card">
              <div className="skeleton skeleton-cover" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
      ) : paginatedBooks.length > 0 ? (
        <>
          <div className="bento-books-grid">
            {paginatedBooks.map((book) => (
              <div
                key={book.key}
                className="bento-book-card"
                onClick={() => navigate("book", book)}
              >
                <div className="bento-cover-wrap">
                  <BookCover book={book} />
                </div>

                <div className="bento-book-title">{book.title}</div>
                <div className="bento-book-author">{book.author}</div>

                <div className="bento-book-meta">
                  <StarRating value={Math.round(book.rating)} readOnly />
                  {book.first_publish_year && (
                    <span className="bento-year">{book.first_publish_year}</span>
                  )}
                </div>

                <div
                  className="bento-actions"
                  onClick={(e) => e.stopPropagation()}
                >
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

          {totalPages > 1 && (
            <div className="pagination-wrap">
              <div className="pagination-row">
                <button
                  className="pagination-btn secondary"
                  disabled={page === 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </button>

                <div className="pagination-pages">
                  {getVisiblePages().map((item, index) =>
                    item === "..." ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        className={`pagination-number ${page === item ? "active" : ""}`}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>

                <button
                  className="pagination-btn secondary"
                  disabled={page === totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>No books found</h3>
          <p>Try a different keyword, category, or remove filters.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setQuery("");
              setActiveCategory("All");
              setRatingFilter("all");
              setSortBy("popular");
            }}
          >
            Reset search
          </button>
        </div>
      )}
    </div>
  );
}