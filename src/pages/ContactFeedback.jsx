export default function ContactFeedback({ navigate }) {
  return (
    <div className="contact-page">
      <section className="home-v2-hero contact-hero">
        <div className="home-v2-hero-copy">
          <span className="home-v2-kicker">Contact & Feedback</span>
          <h1>Get in touch with BookBridge.</h1>
          <p>
            Have feedback, questions, or found a bug? Send us a message and help us improve the reading experience.
          </p>

          <div className="home-v2-actions">
            <a className="btn btn-primary" href="mailto:bookbridge.team@gmail.com">
              Email Us
            </a>
            <button className="btn btn-secondary" onClick={() => navigate("help")}>
              Help Center
            </button>
          </div>
        </div>

        <div className="home-v2-challenge-card contact-info-card">
          <div>
            <strong>Email</strong>
            <p>bookbridge.team@gmail.com</p>
          </div>

          <div>
            <strong>Response Time</strong>
            <p>Usually within 24–48 hours</p>
          </div>

          <div>
            <strong>Feedback</strong>
            <p>Bug reports, feature ideas, and UX suggestions are welcome.</p>
          </div>
        </div>
      </section>

      <section className="contact-grid">
        <div className="contact-form-card">
          <h2>Send us feedback</h2>
          <p>Tell us what feels confusing, broken, or missing.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks for your feedback! This form is a demo.");
            }}
          >
            <input type="text" placeholder="Full name" />
            <input type="email" placeholder="Email address" />
            <select defaultValue="">
              <option value="" disabled>Feedback type</option>
              <option>Bug report</option>
              <option>Feature request</option>
              <option>Design feedback</option>
              <option>Other</option>
            </select>
            <textarea placeholder="Write your message..." rows="6" />
            <button className="btn btn-primary" type="submit">
              Send Message
            </button>
          </form>
        </div>

        <div className="contact-side-card">
          <h2>Need help?</h2>
          <p>
            Visit the Help Center for common questions about shelves, reviews,
            recommendations, and profile settings.
          </p>
          <button className="btn btn-secondary" onClick={() => navigate("help")}>
            Go to Help Center
          </button>
        </div>
      </section>
    </div>
  );
}