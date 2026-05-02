export default function Terms() {
  return (
    <div className="simple-page">
      <section className="simple-hero">
        <span>Terms of Service</span>
        <h1>Use BookBridge responsibly.</h1>
        <p>
          These are sample terms for this student project. BookBridge helps users discover,
          save, and review books for personal use.
        </p>
      </section>

      <section className="simple-card-grid">
        <div className="simple-card">
          <h3>Use of Service</h3>
          <p>BookBridge is intended for personal book discovery and reading organization.</p>
        </div>

        <div className="simple-card">
          <h3>User Content</h3>
          <p>Reviews, bios, and profile details should be respectful and appropriate.</p>
        </div>

        <div className="simple-card">
          <h3>Third-Party Data</h3>
          <p>Book details may come from external APIs, so some information may be incomplete.</p>
        </div>
      </section>
    </div>
  );
}