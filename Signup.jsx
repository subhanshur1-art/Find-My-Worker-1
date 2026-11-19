import { useState } from "react";

function Signup({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Account created successfully!");
      } else {
        setError(data.error || "Signup failed");
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

        <h1>Create Account</h1>

        <p className="login-subtitle">
          Create your account and start booking trusted workers.
        </p>

        <form onSubmit={handleSignup}>

          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="booking-success">
              {message}
            </div>
          )}

          <button type="submit" className="login-submit">
            Create Account
          </button>

        </form>

        <p className="signup-text">
          Already have an account?
          <button
            type="button"
            onClick={onLogin}
            className="signup-link"
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Signup;