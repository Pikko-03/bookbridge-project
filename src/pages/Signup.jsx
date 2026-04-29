import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";


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

  const handleGoogleLogin = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    let userData;

    if (userSnap.exists()) {
      userData = userSnap.data();
    } else {
      userData = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "BookBridge Reader",
        email: firebaseUser.email,
        joined: "2026",
        favoriteAuthor: "",
        readingGoal: 12,
        preferredGenres: [],
        bio: "",
      };

      await setDoc(userRef, userData);
    }

    localStorage.setItem("bookbridgeUser", JSON.stringify(userData));
    onSignup(userData);
    navigate("home");
  } catch (err) {
    setError("Google signup failed.");
  }
};
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
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const {
      name,
      email,
      password,
      confirmPassword,
      favoriteAuthor,
      readingGoal,
      preferredGenres,
    } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, {
        displayName: name,
      });

      const newUser = {
        uid: firebaseUser.uid,
        name,
        email: firebaseUser.email,
        joined: "2026",
        favoriteAuthor,
        readingGoal: Number(readingGoal) || 12,
        preferredGenres,
        bio: "",
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);

      localStorage.setItem("bookbridgeUser", JSON.stringify(newUser));

      onSignup(newUser);
      navigate("home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
<button type="button" className="auth-google-btn" onClick={handleGoogleLogin}>
  <span>🔵</span> Continue with Google
</button>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
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