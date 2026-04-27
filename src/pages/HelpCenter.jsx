import { useMemo, useState } from "react";

const FAQS = [
  {
    category: "Books",
    question: "How do I search for books?",
    answer:
      "Go to Browse, type a book title, author, or keyword into the search box, then press Search.",
  },
  {
    category: "Library",
    question: "How do I add a book to my library?",
    answer:
      "Open a book detail page and use the shelf selector to add it to Want to Read, Currently Reading, or Finished.",
  },
  {
    category: "Library",
    question: "Can I remove a book from my shelf?",
    answer:
      "Yes. Go to My Books and click Remove on the book you want to delete from your shelf.",
  },
  {
    category: "Profile",
    question: "How do I update my reading preferences?",
    answer:
      "Go to Profile, click Edit Profile, update your genres, reading goal, bio, or favorite author, then click Save Changes.",
  },
  {
    category: "Recommendations",
    question: "How do recommendations work?",
    answer:
      "Recommendations are generated based on your shelves, preferred genres, and reading activity.",
  },
  {
    category: "Reviews",
    question: "Can I write reviews?",
    answer:
      "Yes. Open a book detail page, go to the Reviews tab, rate the book, write your thoughts, and save your review.",
  },
];

export default function HelpCenter({ navigate }) {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return FAQS;

    return FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="help-page">
      <section className="help-hero">
        <span className="help-kicker">Help Center</span>
        <h1>How can we help?</h1>
        <p>Search common questions about browsing, shelves, reviews, and recommendations.</p>

        <div className="help-search">
          <span>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs..."
          />
        </div>
      </section>

      <section className="help-quick-links">
        <button onClick={() => navigate("search")}>Browse Books</button>
        <button onClick={() => navigate("mybooks")}>My Library</button>
        <button onClick={() => navigate("ai")}>Recommendations</button>
        <button onClick={() => navigate("profile")}>Profile</button>
      </section>

      <section className="help-faq-section">
        <div className="help-section-head">
          <h2>Frequently Asked Questions</h2>
          <p>{filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} found</p>
        </div>

        <div className="help-faq-list">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div className={`help-faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                  <button
                    className="help-faq-question"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <div>
                      <span>{faq.category}</span>
                      <strong>{faq.question}</strong>
                    </div>
                    <b>{isOpen ? "−" : "+"}</b>
                  </button>

                  {isOpen && <p className="help-faq-answer">{faq.answer}</p>}
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No FAQs found</h3>
              <p>Try searching another keyword.</p>
            </div>
          )}
        </div>
      </section>

      <section className="help-contact-card">
        <h2>Still need help?</h2>
        <p>Contact the BookBridge team and we’ll get back to you as soon as possible.</p>
        <a href="mailto:bookbridge.team@gmail.com" className="btn btn-primary">
          Email Support
        </a>
      </section>
    </div>
  );
}