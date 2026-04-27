export default function About({ navigate }) {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div>
          <span className="about-kicker">About BookBridge</span>
          <h1>Helping readers discover better books.</h1>
          <p>
            BookBridge is a personal reading companion built to help readers
            explore, track, review, and discover books that match their taste.
          </p>
        </div>
      </section>

      <section className="about-section about-two-col">
        <div>
          <h2>Who We Are</h2>
          <p>
            BookBridge is designed for readers who want a calmer, smarter way to
            manage their reading life. From browsing books to saving shelves and
            finding personalized recommendations, we bring everything together in
            one simple space.
          </p>
          <p>
            Our goal is to make book discovery feel personal, organized, and
            enjoyable — not overwhelming.
          </p>
        </div>

        <div className="about-visual-card">
          <div className="about-visual-inner">
          
    
            
          </div>

          <div className="about-floating-stats">
            <div>
              <strong>3</strong>
              <span>Smart shelves</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>Recommendations</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>Books to explore</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-card-grid">
        <div className="about-card">
          <div className="about-icon">◎</div>
          <h3>Our Mission</h3>
          <p>
            To make reading more personal by helping users discover books that
            match their goals, moods, interests, and reading history.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">◉</div>
          <h3>Our Vision</h3>
          <p>
            To become a calm digital library where readers can track progress,
            express opinions, and connect with meaningful books.
          </p>
        </div>
      </section>

      <section className="about-section about-two-col reverse">
        <div className="about-image-placeholder">
          <span>✨</span>
        </div>

        <div>
          <h2>Why BookBridge Exists</h2>
          <p>
            Readers often discover books across many places, but tracking and
            organizing them can feel scattered. BookBridge brings discovery,
            shelves, reviews, and recommendations into one clean experience.
          </p>

          <ul className="about-check-list">
            <li>Personal bookshelf tracking</li>
            <li>Smart recommendations based on taste</li>
            <li>Community-style reviews</li>
            <li>Clean, minimal reading dashboard</li>
          </ul>
        </div>
      </section>

      <section className="about-values">
        <div className="about-center-head">
          <h2>Our Core Values</h2>
          <p>The principles behind BookBridge.</p>
        </div>

        <div className="about-value-grid">
          <div className="about-value-card">
            <div className="about-icon">♡</div>
            <h3>Reader First</h3>
            <p>We design for clarity, calmness, and better reading decisions.</p>
          </div>

          <div className="about-value-card">
            <div className="about-icon">✦</div>
            <h3>Discovery</h3>
            <p>We help readers find books they may not have found alone.</p>
          </div>

          <div className="about-value-card">
            <div className="about-icon">☰</div>
            <h3>Organization</h3>
            <p>We make tracking books simple, useful, and visually clean.</p>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <h2>Start building your reading life.</h2>
        <p>Browse books, save your shelves, and discover what to read next.</p>
        <button className="btn btn-primary" onClick={() => navigate("search")}>
          Browse Books
        </button>
      </section>
    </div>
  );
}