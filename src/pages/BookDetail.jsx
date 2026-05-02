import { useEffect, useMemo, useRef, useState } from "react";
import BookCover from "../components/BookCover";
import StarRating from "../components/StarRating";
import ShelfSelector from "../components/ShelfSelector";

const DEMO_REVIEWS = [
  {
    id: 1,
    name: "Sophia Lee",
    rating: 5,
    date: "Apr 2026",
    shelf: "Read",
    helpful: 124,
    text: "A thoughtful and beautifully written book. The ideas stay with you long after you finish reading.",
  },
  {
    id: 2,
    name: "Daniel Hart",
    rating: 4,
    date: "Mar 2026",
    shelf: "Currently Reading",
    helpful: 88,
    text: "Insightful and elegant. Some parts require a slower read, but the payoff is worth it.",
  },
  {
    id: 3,
    name: "Mia Chen",
    rating: 4,
    date: "Feb 2026",
    shelf: "Want to Read",
    helpful: 57,
    text: "A strong read with memorable ideas and elegant writing.",
  },
];

const SHELF_LABELS = {
  want: "Want to Read",
  reading: "Currently Reading",
  read: "Read",
};

export default function BookDetail({
  book,
  navigate,
  addToShelf,
  removeFromShelf,
  getShelf,
  review,
  addReview,
  user,
  shelves = { read: [], reading: [], want: [] },
}) {
  const [details, setDetails] = useState(null);
  const [edition, setEdition] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviewSort, setReviewSort] = useState("top");

  const [rating, setRating] = useState(review?.rating || 0);
  const [text, setText] = useState(review?.text || "");
  const [saved, setSaved] = useState(!!review);

  const currentShelf = getShelf(book);

  const reviewsRef = useRef(null);
const authorRef = useRef(null);

const scrollToReviews = () => {
  setActiveTab("reviews");

  setTimeout(() => {
    reviewsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 80);
};

const scrollToAuthor = () => {
  setActiveTab("overview");

  setTimeout(() => {
    authorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 80);
};

  useEffect(() => {
    setRating(review?.rating || 0);
    setText(review?.text || "");
    setSaved(!!review);
  }, [review, book?.key]);

  useEffect(() => {
    if (!book?.key) return;

    const fetchData = async () => {
      setLoading(true);
      setSimilarLoading(true);

      try {
        const detailRes = await fetch(`https://openlibrary.org${book.key}.json`);
        const detailData = await detailRes.json();
        setDetails(detailData);

        let fetchedAuthor = null;

        if (detailData?.authors?.[0]?.author?.key) {
          try {
            const authorRes = await fetch(
              `https://openlibrary.org${detailData.authors[0].author.key}.json`
            );
            fetchedAuthor = await authorRes.json();
            setAuthorData(fetchedAuthor);
          } catch {}
        }

        try {
          const editionRes = await fetch(
            `https://openlibrary.org${book.key}/editions.json?limit=1`
          );
          const editionData = await editionRes.json();
          setEdition(editionData.entries?.[0] || null);
        } catch {}

        const authorName =
          book.author || book.author_name?.[0] || fetchedAuthor?.name || "";

        const subjects =
          detailData?.subjects?.slice(0, 2) || book?.subject?.slice(0, 2) || [];

        const related = [];

        if (authorName) {
          try {
            const res = await fetch(
              `https://openlibrary.org/search.json?author=${encodeURIComponent(
                authorName
              )}&limit=6&fields=key,title,author_name,cover_i,first_publish_year,subject`
            );
            const data = await res.json();
            related.push(
              ...(data.docs || []).map((b) => ({
                ...b,
                author: b.author_name?.[0] || authorName,
                reason: "By the same author",
              }))
            );
          } catch {}
        }

        for (const subject of subjects) {
          try {
            const res = await fetch(
              `https://openlibrary.org/search.json?q=${encodeURIComponent(
                subject
              )}&limit=6&fields=key,title,author_name,cover_i,first_publish_year,subject`
            );
            const data = await res.json();
            related.push(
              ...(data.docs || []).map((b) => ({
                ...b,
                author: b.author_name?.[0] || "Unknown Author",
                reason: `Because you like ${subject}`,
              }))
            );
          } catch {}
        }

        const unique = new Map();

        related.forEach((item) => {
          if (!item?.key || item.key === book.key) return;
          if (!unique.has(item.key)) unique.set(item.key, item);
        });

        setSimilarBooks(Array.from(unique.values()).slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch book details:", err);
      }

      setLoading(false);
      setSimilarLoading(false);
    };

    fetchData();
  }, [book, shelves]);

  const description = useMemo(() => {
    const raw = details?.description;
    if (!raw) return "";
    return typeof raw === "string" ? raw : raw.value || "";
  }, [details]);

  const authorName =
    book.author || book.author_name?.[0] || authorData?.name || "Unknown Author";

  const averageRating = useMemo(() => {
    const values = [5, 4, 4, 3, 5, review?.rating].filter(Boolean);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
  }, [review]);

  const isbn13 = edition?.isbn_13?.[0] || "9780140135152";
  const isbn10 = edition?.isbn_10?.[0] || "0140135154";
  const publisher = edition?.publishers?.[0] || "Penguin";
  const publishDate = edition?.publish_date || book.first_publish_year || "1990";
  const pages = edition?.number_of_pages || details?.number_of_pages || "176";
  const language =
    edition?.languages?.[0]?.key?.replace("/languages/", "").toUpperCase() ||
    "English";

  const handleSaveReview = () => {
    if (rating === 0) return;
    addReview(book.key, {
      rating,
      text,
      date: new Date().toISOString(),
      helpful: 0,
    });
    setSaved(true);
  };

  const allReviews = review
    ? [
        {
          id: "you",
          name: user?.name || "You",
          rating: review.rating,
          date: "Now",
          shelf: currentShelf ? SHELF_LABELS[currentShelf] : "Read",
          helpful: review.helpful || 0,
          text: review.text || "You rated this book.",
          isUser: true,
        },
        ...DEMO_REVIEWS,
      ]
    : DEMO_REVIEWS;
const [reviewSearch, setReviewSearch] = useState("");
  const filteredReviews = allReviews.filter((item) =>
  item.text.toLowerCase().includes(reviewSearch.toLowerCase()) ||
  item.name.toLowerCase().includes(reviewSearch.toLowerCase())
);

const sortedReviews = [...filteredReviews].sort((a, b) => {
  if (reviewSort === "top") return b.helpful - a.helpful;
  if (reviewSort === "rating") return b.rating - a.rating;
  return String(b.id).localeCompare(String(a.id));
});

  if (loading) {
    return (
      <div className="book-detail-v2">
        <div className="book-detail-skeleton">
          <div className="skeleton skeleton-cover" />
          <div>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-btn" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-v2">
      <div className="bd-header">
  <button className="bd-back-btn" onClick={() => navigate("search")}>
    ← Back to Browse
  </button>
</div>

      <section className="bd-hero">
        <aside className="bd-cover-panel">
          <BookCover book={book} className="bd-cover" />

          <ShelfSelector
            book={book}
            getShelf={getShelf}
            addToShelf={addToShelf}
            removeFromShelf={removeFromShelf}
          />

          <div className="bd-buy-card">
  <span>Buy this book</span>

  <a
    className="bd-buy-btn"
    href={`https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`}
    target="_blank"
    rel="noreferrer"
  >
    Buy on Amazon
  </a>

  <a
    className="bd-buy-btn secondary"
    href={`https://www.google.com/search?q=${encodeURIComponent(
      book.title + " Google Books"
    )}`}
    target="_blank"
    rel="noreferrer"
  >
    Find on Google Books
  </a>
</div>
        </aside>

        <main className="bd-main-info">
          <div className="bd-kicker">Book Details</div>
          <h1>{book.title}</h1>
          <p className="bd-author">
  by{" "}
  <button className="bd-author-link" onClick={scrollToAuthor}>
    {authorName}
  </button>
</p>

          <button className="bd-rating-row bd-rating-clickable" onClick={scrollToReviews}>
            <StarRating value={Math.round(Number(averageRating))} readOnly />
            <strong>{averageRating}</strong>
            <span>3,434 ratings · 511 reviews</span>
          </button>

          <p className="bd-description">
            {description
              ? description.length > 760
                ? description.slice(0, 760) + "..."
                : description
              : "No description is currently available for this book."}
          </p>

          {(details?.subjects || book.subject)?.length > 0 && (
            <div className="bd-tags">
              {(details?.subjects || book.subject || []).slice(0, 7).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <div className="bd-social-row">
  <div className="bd-social-card">
    <div className="bd-people-icons">
      <span>👤</span>
      <span>👤</span>
      <span>👤</span>
    </div>
    <strong>6,160 people</strong>
    <span>currently reading</span>
  </div>

  <div className="bd-social-card">
    <div className="bd-people-icons">
      <span>👤</span>
      <span>👤</span>
      <span>👤</span>
    </div>
    <strong>392,578 people</strong>
    <span>want to read</span>
  </div>
</div>
        </main>
      </section>

      <section className="bd-tabs">
        {["overview", "reviews", "similar"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "Overview"}
            {tab === "reviews" && "Reviews"}
            {tab === "similar" && "Similar Books"}
          </button>
        ))}
      </section>

      {activeTab === "overview" && (
  <section className="bd-grid-section">
    <div className="bd-card bd-edition-card-v2">
      <h2>Edition details</h2>

      <div className="bd-edition-list">
        <div className="bd-edition-item">
          <span className="bd-edition-icon">📄</span>
          <div>
            <small>Format</small>
            <strong>{pages} pages, Paperback</strong>
          </div>
        </div>

        <div className="bd-edition-item">
          <span className="bd-edition-icon">📅</span>
          <div>
            <small>Published</small>
            <strong>
              {publishDate} by {publisher}
            </strong>
          </div>
        </div>

        <div className="bd-edition-item">
          <span className="bd-edition-icon">🔖</span>
          <div>
            <small>ISBN</small>
            <strong>
              {isbn13} / {isbn10}
            </strong>
          </div>
        </div>

        <div className="bd-edition-item">
          <span className="bd-edition-icon">🌐</span>
          <div>
            <small>Language</small>
            <strong>{language}</strong>
          </div>
        </div>
      </div>
    </div>

    <div className="bd-card bd-author-card-v2" ref={authorRef}>
      <h2>About the author</h2>

      <div className="bd-author-box-v2">
        <div className="bd-author-avatar">
          {authorName.charAt(0).toUpperCase()}
        </div>

        <div className="bd-author-content-v2">
          <h3>{authorName}</h3>

          <p>
            {authorData?.bio
              ? typeof authorData.bio === "string"
                ? authorData.bio.slice(0, 280)
                : authorData.bio?.value?.slice(0, 280)
              : `${authorName} is known for thoughtful writing, memorable stories, and works that continue to resonate with readers.`}
            ...
          </p>

          <div className="bd-author-socials">
            <a
              href={`https://twitter.com/search?q=${encodeURIComponent(authorName)}`}
              target="_blank"
              rel="noreferrer"
              title="Twitter"
            >
              𝕏
            </a>

            <a
              href={`https://www.facebook.com/search/top?q=${encodeURIComponent(authorName)}`}
              target="_blank"
              rel="noreferrer"
              title="Facebook"
            >
              f
            </a>

            <a
              href={`https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(authorName)}`}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
            >
              ◎
            </a>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(authorName)}`}
              target="_blank"
              rel="noreferrer"
              title="More"
            >
              ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
)}

      {activeTab === "reviews" && (
        <section className="bd-reviews-section" ref={reviewsRef}>
          <div className="bd-section-head">
  <div>
    <h2>Community reviews</h2>
    <p>See how readers are responding to this book.</p>
  </div>

  <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
    <option value="top">Top reviews</option>
    <option value="newest">Newest</option>
    <option value="rating">Highest rated</option>
  </select>
</div>

<div className="bd-review-overview">
  <div className="bd-review-score">
    <div className="bd-score-stars">
      <StarRating value={4} readOnly />
    </div>
    <strong>{averageRating}</strong>
    <span>561 ratings · 187 reviews</span>
  </div>

  <div className="bd-rating-breakdown">
    {[5, 4, 3, 2, 1].map((star, index) => {
      const data = [
        { count: 121, percent: 21 },
        { count: 225, percent: 40 },
        { count: 157, percent: 27 },
        { count: 49, percent: 8 },
        { count: 9, percent: 1 },
      ][index];

      return (
        <div className="bd-rating-line-row" key={star}>
          <span>{star} stars</span>
          <div className="bd-rating-track">
            <div style={{ width: `${data.percent}%` }} />
          </div>
          <small>
            {data.count} ({data.percent}%)
          </small>
        </div>
      );
    })}
  </div>

  <div className="bd-review-search-row">
    <div className="bd-review-search">
      <span>🔍</span>
      <input
        value={reviewSearch}
        onChange={(e) => setReviewSearch(e.target.value)}
        placeholder="Search review text"
      />
    </div>
  </div>
</div>

<div className="bd-review-form-card">
            {saved && review ? (
              <>
                <StarRating value={review.rating} readOnly />
                {review.text && <p>"{review.text}"</p>}
                <button className="btn btn-secondary btn-sm" onClick={() => setSaved(false)}>
                  Edit Review
                </button>
              </>
            ) : (
              <>
                <h3>Your review</h3>
                <StarRating value={rating} onChange={setRating} />
                <textarea
                  placeholder="Write your thoughts..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSaveReview}
                  disabled={rating === 0}
                >
                  Save Review
                </button>
              </>
            )}
          </div>

          <div className="bd-review-list">
            {sortedReviews.map((item) => (
              <article key={item.id} className="bd-review-card">
                <div className="bd-review-avatar">
                  {item.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="bd-review-meta">
                    <strong>{item.name}</strong>
                    <span>{item.shelf}</span>
                    <small>{item.date}</small>
                  </div>

                  <StarRating value={item.rating} readOnly />

                  <p>{item.text}</p>

                  <div className="bd-review-actions">
  <button>Helpful</button>
  <button>Not helpful</button>
  <span>{item.helpful} people found this helpful</span>
</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "similar" && (
        <section className="bd-similar-section">
          <div className="bd-section-head">
            <div>
              <h2>Readers also enjoyed</h2>
              <p>Related picks based on author, topic, and reading interest.</p>
            </div>
          </div>

          {similarLoading ? (
            <div className="minimal-book-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-book-card">
                  <div className="skeleton skeleton-cover" />
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-text" />
                </div>
              ))}
            </div>
          ) : similarBooks.length > 0 ? (
            <div className="minimal-book-grid">
              {similarBooks.map((item) => (
                <div
                  key={item.key}
                  className="minimal-book-card"
                  onClick={() => navigate("book", item)}
                >
                  <BookCover book={item} />
                  <h3>{item.title}</h3>
                  <p>{item.author}</p>
                  {item.reason && <div className="bd-reason">{item.reason}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No similar books found</h3>
              <p>Try browsing by category to discover related books.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}