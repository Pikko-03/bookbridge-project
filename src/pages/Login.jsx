import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login({ navigate, onLogin }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("");

  const createUserProfileIfNeeded = async (firebaseUser, fallbackName) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data();
    const userData = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || fallbackName || "BookBridge Reader",
      email: firebaseUser.email,
      joined: new Date().toISOString(),
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
      if (err.code === "auth/popup-closed-by-user") setError("Google login was cancelled.");
      else if (err.code === "auth/popup-blocked") setError("Popup was blocked. Please allow popups and try again.");
      else if (err.code === "auth/unauthorized-domain") setError("This domain is not authorized for Google login.");
      else setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = formData;
    if (!email || !password) { setError("Please fill in all fields."); return; }
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await createUserProfileIfNeeded(userCredential.user, email.split("@")[0]);
      onLogin(userData);
      navigate("home");
    } catch (err) {
      console.error("Email login failed:", err);
      if (err.code === "auth/invalid-credential") setError("Invalid email or password.");
      else if (err.code === "auth/too-many-requests") setError("Too many attempts. Please wait and try again.");
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus("");
    if (!forgotEmail) { setForgotStatus("error"); return; }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, forgotEmail);
      setForgotStatus("sent");
    } catch (err) {
      console.error("Password reset failed:", err);
      setForgotStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Reset Password</h1>
          <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

          {forgotStatus === "sent" ? (
            <>
              <div className="auth-success">
                ✅ Reset email sent! Check your inbox and follow the link to reset your password.
              </div>
              <button
                className="auth-btn"
                style={{ marginTop: "1rem" }}
                onClick={() => { setShowForgot(false); setForgotEmail(""); setForgotStatus(""); }}
              >
                Back to Login
              </button>
            </>
          ) : (
            <form onSubmit={handleForgotPassword} className="auth-form">
              <input
                type="email"
                placeholder="Your email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={loading}
              />
              {forgotStatus === "error" && (
                <p className="auth-error">Could not send reset email. Please check the address and try again.</p>
              )}
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <button
                type="button"
                className="auth-btn"
                style={{ background: "var(--surface-soft)", color: "var(--text)", border: "1px solid var(--border)" }}
                onClick={() => { setShowForgot(false); setForgotStatus(""); }}
                disabled={loading}
              >
                ← Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

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

          <div style={{ textAlign: "right", marginTop: "-0.25rem" }}>
            <span
              className="auth-link"
              style={{ fontSize: "0.85rem" }}
              onClick={() => { setShowForgot(true); setForgotEmail(formData.email); }}
            >
              Forgot password?
            </span>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="button" className="auth-google-btn" onClick={handleGoogleLogin} disabled={loading}>
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
          Don't have an account?{" "}
          <span className="auth-link" onClick={() => !loading && navigate("signup")}>Sign up</span>
        </p>
      </div>
    </div>
  );
}