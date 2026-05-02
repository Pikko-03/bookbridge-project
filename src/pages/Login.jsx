import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login({ navigate, onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserProfileIfNeeded = async (firebaseUser, fallbackName) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    }

    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || fallbackName || "BookBridge Reader",
      email: firebaseUser.email,
      joined: "2026",
      favoriteAuthor: "",
      readingGoal: 12,
      preferredGenres: [],
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

      onLogin(userData);
      navigate("home");
    } catch (err) {
      console.error("Google login failed:", err);

      if (err.code === "auth/popup-closed-by-user") {
        setError("Google login was cancelled.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups and try again.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized for Google login.");
      } else {
        setError("Google login failed. Please try again.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fallbackName = email.split("@")[0];
      const userData = await createUserProfileIfNeeded(
        userCredential.user,
        fallbackName
      );

      onLogin(userData);
      navigate("home");
    } catch (err) {
      console.error("Email login failed:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Log in to continue your reading journey.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

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
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <span className="auth-link" onClick={() => !loading && navigate("signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}