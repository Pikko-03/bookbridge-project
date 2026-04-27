import { useState } from "react";

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

export default function Signup({ navigate, onSignup }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    favoriteAuthor: "",
    readingGoal: "",
    preferredGenres: [],
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleGenre = (genre) => {
    setFormData((prev) => ({
      ...prev,
      preferredGenres: prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter((g) => g !== genre)
        : [...prev.preferredGenres, genre],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword, favoriteAuthor, readingGoal, preferredGenres } =
      formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const newUser = {
      name,
      email,
      joined: "2026",
      favoriteAuthor,
      readingGoal: readingGoal || "12",
      preferredGenres,
      bio: "",
    };

    onSignup(newUser);
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <h1>Create Account</h1>
        <p className="auth-subtitle">
          Join BookBridge and personalize your reading journey.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            placeholder="Full name *"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email address *"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password *"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <input
            type="text"
            name="favoriteAuthor"
            placeholder="Favorite author (optional)"
            value={formData.favoriteAuthor}
            onChange={handleChange}
          />

          <input
            type="number"
            name="readingGoal"
            placeholder="Books you want to read this year"
            value={formData.readingGoal}
            onChange={handleChange}
          />

          <div className="genre-select-block">
            <label className="genre-label">Preferred Genres</label>
            <div className="genre-options">
              {GENRES.map((genre) => (
                <button
                  type="button"
                  key={genre}
                  className={`genre-pill ${
                    formData.preferredGenres.includes(genre) ? "selected" : ""
                  }`}
                  onClick={() => toggleGenre(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}