import { useState } from "react";

function Login({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
      onLogin(data.user, data.token);
     }else {
        setError(data.error || "Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      setError("Server connection failed");
    }
  };

  return (
    <div className="login-page">
      <button
  type="button"
  className="back-button"
  onClick={() => window.location.reload()}
>
  ← Back to Home
</button>

      <div className="login-card">

        <div className="login-logo">
          <span>Find</span>MyWorker
        </div>

        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to manage your bookings and find trusted workers.
        </p>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button type="submit" className="login-submit">
            Login
          </button>

        </form>

        <p className="signup-text">
          Don't have an account?
          <button
            type="button"
            onClick={onSignup}
            className="signup-link"
          >
            Sign Up
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;