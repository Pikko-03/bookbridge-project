export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* LEFT */}
        <div className="footer-brand">
          <div className="footer-logo">
            Book<span>Bridge</span>
          </div>
          <p className="footer-tagline">
            Discover your next favorite book, track your reading, and share reviews.
          </p>
        </div>

        {/* RIGHT GRID */}
        <div className="footer-grid">

          <div>
            <h4>Company</h4>
            <button onClick={() => navigate("about")}>About</button>
            <button onClick={() => navigate("careers")}>Careers</button>
            <button onClick={() => navigate("privacy")}>Privacy</button>
            <button onClick={() => navigate("terms")}>Terms</button>
          </div>

          <div>
            <h4>Explore</h4>
            <button onClick={() => navigate("search")}>Browse Books</button>
            <button onClick={() => navigate("ai")}>Recommendations</button>
            <button>Top Rated</button>
            <button>Genres</button>
          </div>

          <div>
            <h4>Support</h4>
            <button onClick={() => navigate("help")}>Help Center</button>
            <button onClick={() => navigate("contact")}>Contact</button>
            <button onClick={() => navigate("community")}>Community</button>
            <button>Feedback</button>
          </div>

           <div>
            <h4>Connect</h4>
            <button><span></span> Instagram</button>
            <button><span></span> Facebook</button>
            <button><span></span> Twitter</button>
            <button><span></span> Linkedin</button>
          </div>

          <div>
            <div>
  
</div>
          </div>

        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 BookBridge. Built for readers, by readers.</p>
      </div>
    </footer>
  );
}