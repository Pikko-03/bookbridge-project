import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


export default function Login({ navigate, onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleLogin = async () => {
  try {
    setLoading(true);

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
    onLogin(userData);
    navigate("home");
  } catch (err) {
    setError("Google login failed.");
  } finally {
    setLoading(false);
  }
};


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = userCredential.user;

      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userData;

      if (userSnap.exists()) {
        userData = userSnap.data();
      } else {
        userData = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || email.split("@")[0],
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

      onLogin(userData);
      navigate("home");
    } catch (err) {
      setError("Invalid email or password.");
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
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="auth-error">{error}</p>}
          <button
  type="button"
  className="auth-google-btn"
  onClick={handleGoogleLogin}
>
  <img
    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJg75LWB1zIJt1VTZO7O68yKciaDSkk3KMdw&s"
    alt="Google logo"
    className="google-icon"
  />
  Continue with Google
</button>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account?{" "}
          <span className="auth-link" onClick={() => navigate("signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}