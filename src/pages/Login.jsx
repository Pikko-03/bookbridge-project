import { useState } from "react";

export default function Login({ navigate, onLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const demoUser = {
      name: email.split("@")[0],
      email,
      joined: "2024",
    };

    onLogin(demoUser);
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

          <button type="submit" className="auth-btn">
            Log In
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