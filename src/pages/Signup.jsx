import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

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
  const [loading, setLoading] = useState(false);

  const createUserProfileIfNeeded = async (firebaseUser, extraData = {}) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    const userData = {
      uid: firebaseUser.uid,
      name:
        extraData.name ||
        firebaseUser.displayName ||
        firebaseUser.email?.split("@")[0] ||
        "BookBridge Reader",
      email: firebaseUser.email,
      joined: "2026",
      favoriteAuthor: extraData.favoriteAuthor || "",
      readingGoal: Number(extraData.readingGoal) || 12,
      preferredGenres: extraData.preferredGenres || [],
      bio: "",
    };

    await setDoc(userRef, userData);
    return userData;
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userData = await createUserProfileIfNeeded(result.user);

      onSignup(userData);
      navigate("home");
    } catch (err) {
      console.error("Google signup failed:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google signup was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized for Google signup.");
      } else {
        setError("Google signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleGenre = (genre) => {
    if (loading) return;

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

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      const userData = await createUserProfileIfNeeded(userCredential.user, {
        name,
        favoriteAuthor,
        readingGoal,
        preferredGenres,
      });

      onSignup(userData);
      navigate("home");
    } catch (err) {
      console.error("Signup failed:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Signup failed. Please try again.");
      }
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
            disabled={loading}
          />

          <input
            type="email"
            name="email"
            placeholder="Email address *"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="text"
            name="favoriteAuthor"
            placeholder="Favorite author (optional)"
            value={formData.favoriteAuthor}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="number"
            name="readingGoal"
            placeholder="Reading goal — how many books do you want to read this year?"
            value={formData.readingGoal}
            onChange={handleChange}
            disabled={loading}
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
                  disabled={loading}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJg75LWB1zIJt1VTZO7O68yKciaDSkk3KMdw&s"
              alt="Google logo"
              className="google-icon"
            />
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => !loading && navigate("login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}