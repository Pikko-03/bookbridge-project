import { useEffect, useState } from "react";

const GENRES = [
  "Fantasy",
  "Mystery",
  "Thriller",
  "Romance",
  "Science Fiction",
  "Historical Fiction",
  "Psychology",
  "Self-Help",
  "Biography",
  "Horror",
  "Classics",
  "Young Adult",
];

export default function Profile({ user, shelves, reviews, navigate }) {
  const [profile, setProfile] = useState(user);
  const [draft, setDraft] = useState(user);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setProfile(user);
    setDraft(user);
  }, [user]);

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3>Please log in</h3>
        <p>Access your profile and personalize your reading experience.</p>
        <button className="btn btn-primary" onClick={() => navigate("login")}>
          Login
        </button>
      </div>
    );
  }

  const safeShelves = shelves || { read: [], reading: [], want: [] };

  const totalRead = safeShelves.read.length;
  const totalReading = safeShelves.reading.length;
  const totalWant = safeShelves.want.length;
  const totalBooks = totalRead + totalReading + totalWant;
  const totalReviews = Object.keys(reviews || {}).length;

  const readingGoal = Number(profile.readingGoal || 12);
  const progress = Math.min(100, (totalRead / readingGoal) * 100);
  const remaining = Math.max(readingGoal - totalRead, 0);

  const currentData = isEditing ? draft : profile;

  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    const updated = {
      ...draft,
      readingGoal: Number(draft.readingGoal || 12),
    };

    setProfile(updated);
    setDraft(updated);
    localStorage.setItem("bookbridgeUser", JSON.stringify(updated));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  return (
    <div className="profile-v2">
      <section className={`profile-v2-hero ${isEditing ? "is-editing" : ""}`}>
        <div className="profile-hero-top">
          {!isEditing ? (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <div className="profile-edit-actions">
              <button className="btn btn-secondary" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveProfile}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="profile-v2-hero-main">
          <div className="profile-v2-left">
            <div className="profile-v2-avatar">
              {currentData.name?.charAt(0)?.toUpperCase() || "B"}
            </div>

            <div className="profile-v2-identity">
              

              {isEditing ? (
                <input
                  className="profile-name-input"
                  value={draft.name || ""}
                  onChange={(e) => updateDraft("name", e.target.value)}
                  placeholder="Your name"
                />
              ) : (
                <h1>{profile.name || "BookBridge Reader"}</h1>
              )}

              {isEditing ? (
                <textarea
                  className="profile-bio-input"
                  value={draft.bio || ""}
                  onChange={(e) => updateDraft("bio", e.target.value)}
                  placeholder="Tell us about your reading taste..."
                />
              ) : (
                <p className="profile-bio-display">
                  {profile.bio ||
                    "A curious reader building a personal library and discovering better books."}
                </p>
              )}

              <div className="profile-v2-meta">
                <span>Member since {profile.joined || "2026"}</span>
                {profile.email && <span>{profile.email}</span>}
              </div>
            </div>
          </div>

          <div className="profile-v2-social">
            <div>
              <strong>{totalBooks}</strong>
              <span>Books</span>
            </div>
            <div>
              <strong>{totalReviews}</strong>
              <span>Reviews</span>
            </div>
            <div>
              <strong>{(profile.preferredGenres || []).length}</strong>
              <span>Genres</span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-v2-grid">
        <div className="profile-v2-card profile-goal-card">
          <div className="profile-card-head">
            <div>
              <h2>Reading Challenge</h2>
              <p>{new Date().getFullYear()}</p>
            </div>
            <strong>
              {totalRead}/{readingGoal}
            </strong>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <p>{remaining} books left to reach your goal</p>
        </div>

        <div className="profile-v2-card">
          <h2>Reading Stats</h2>

          <div className="profile-mini-stats">
            <div>
              <strong>{totalRead}</strong>
              <span>Finished</span>
            </div>
            <div>
              <strong>{totalReading}</strong>
              <span>Reading</span>
            </div>
            <div>
              <strong>{totalWant}</strong>
              <span>Want</span>
            </div>
          </div>
        </div>
      </section>

      <section className="profile-v2-card">
        <div className="profile-section-head">
          <h2>Reading Preferences</h2>
          <p>Personalize your recommendations and profile information.</p>
        </div>

        <div className="profile-form-grid">
          <div className="profile-field">
            <label>Favorite Author</label>
            <input
              disabled={!isEditing}
              type="text"
              value={draft.favoriteAuthor || ""}
              onChange={(e) => updateDraft("favoriteAuthor", e.target.value)}
              placeholder="Your favorite author"
            />
          </div>

          <div className="profile-field">
            <label>Reading Goal</label>
            <input
              disabled={!isEditing}
              type="number"
              value={draft.readingGoal || ""}
              onChange={(e) => updateDraft("readingGoal", e.target.value)}
              placeholder="12"
            />
          </div>

          <div className="profile-field profile-field-full">
            <label>Bio</label>
            <textarea
              disabled={!isEditing}
              value={draft.bio || ""}
              onChange={(e) => updateDraft("bio", e.target.value)}
              placeholder="Tell us a little about your reading taste..."
            />
          </div>
        </div>

        <div className="profile-preferences">
          <label>Preferred Genres</label>

          {(draft.preferredGenres || []).length === 0 && (
            <p className="profile-hint">Select genres to improve recommendations.</p>
          )}

          <div className="genre-options">
            {GENRES.map((genre) => {
              const selected = (draft.preferredGenres || []).includes(genre);

              return (
                <button
                  key={genre}
                  disabled={!isEditing}
                  type="button"
                  className={`genre-pill ${selected ? "selected" : ""}`}
                  onClick={() => {
                    if (!isEditing) return;

                    const current = draft.preferredGenres || [];

                    const updatedGenres = selected
                      ? current.filter((g) => g !== genre)
                      : [...current, genre];

                    updateDraft("preferredGenres", updatedGenres);
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      </section>
<div className="profile-section">
  <h3>Your Reviews</h3>

  {Object.keys(reviews).length === 0 ? (
    <p className="empty-text">You haven’t written any reviews yet.</p>
  ) : (
    <div className="profile-reviews">
      {Object.entries(reviews).map(([bookKey, review]) => (
        <div key={bookKey} className="review-card">
          <div className="review-rating">⭐ {review.rating}/5</div>
          <div className="review-text">{review.text}</div>
        </div>
      ))}
    </div>
  )}
</div>
      <section className="profile-v2-card">
        <div className="profile-section-head">
          <h2>Quick Actions</h2>
          <p>Jump back into your reading journey.</p>
        </div>

        <div className="profile-actions">
          <button className="btn btn-primary" onClick={() => navigate("search")}>
  Browse Books
</button>

<button className="btn btn-secondary" onClick={() => navigate("mybooks")}>
  My Library
</button>

<button className="btn btn-outline" onClick={() => navigate("ai")}>
  Recommendations
</button>

<button className="btn btn-outline" onClick={() => navigate("help")}>
  Help Center
</button>

<button className="btn btn-outline" onClick={() => navigate("contact")}>
  Contact Us
</button>
        </div>
      </section>
      
    </div>
  );
}