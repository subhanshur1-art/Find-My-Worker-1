
import AdminDashboard from './AdminDashboard'
import Login from './Login'
import Signup from './Signup'
import { useState, useEffect } from 'react'
import WorkerProfile from './WorkerProfile'
import MyBookings from './MyBookings'
import WorkerDashboard from './WorkerDashboard'
import './App.css'

function App() {
  const [showProfile, setShowProfile] = useState(false)
  const [workers, setWorkers] = useState([])
  const [showBookings, setShowBookings] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState(null)
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    fetch("http://localhost:5000/workers")
      .then((response) => response.json())
      .then((data) => {
        console.log("WORKERS FROM BACKEND:", data)
        setWorkers(data)
      })
      .catch((error) => {
        console.error("Error fetching workers:", error)
      })
  }, [])

  // SIGNUP PAGE
  if (showSignup) {
    return (
      <Signup
        onLogin={() => {
          setShowSignup(false)
          setShowLogin(true)
        }}
      />
    )
  }

  // WORKER DASHBOARD
  if (loggedInUser?.role === 'worker' && !showLogin && !showSignup) {
    return (
      <div>
        <button
          onClick={() => {
            setLoggedInUser(null)
            setShowDashboard(false)
            setShowBookings(false)
            setShowProfile(false)
          }}
        >
          Logout
        </button>

        <WorkerDashboard user={loggedInUser} />
      </div>
    )
  }

  // ADMIN DASHBOARD
  if (loggedInUser?.role === 'admin' && !showLogin && !showSignup) {
    return (
      <AdminDashboard
        user={loggedInUser}
        onLogout={() => {
          setLoggedInUser(null)
          setShowDashboard(false)
          setShowBookings(false)
          setShowProfile(false)
          setShowLogin(false)
          setShowSignup(false)
        }}
      />
    )
  }

  // LOGIN PAGE
  if (showLogin) {
    return (
      <Login
        onLogin={(user, token) => {
          setLoggedInUser({ ...user, token })
          setShowLogin(false)
          setShowDashboard(false)
          setShowBookings(false)
          setShowProfile(false)
        }}
        onSignup={() => {
          setShowSignup(true)
        }}
      />
    )
  }

  // WORKER PROFILE PAGE
  if (showProfile) {
    return (
      <WorkerProfile
        worker={showProfile}
        userId={loggedInUser?.id}
        onBack={() => setShowProfile(false)}
      />
    )
  }

  // MY BOOKINGS PAGE
  if (showBookings) {
    return (
      <MyBookings
        userId={loggedInUser?.id}
        onBack={() => setShowBookings(false)}
      />
    )
  }

  // CLIENT DASHBOARD
  if (showDashboard) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo" onClick={() => setShowDashboard(false)}>
            <span>Find</span>MyWorker
          </div>

          <button onClick={() => setShowDashboard(false)}>
            Home
          </button>
        </nav>

        <section style={{ padding: "40px 6%" }}>
          <h1>Welcome, {loggedInUser?.name}!</h1>
          <p>Your FindMyWorker account</p>

          <div style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginTop: "24px"
          }}>
            <div style={{
              padding: "24px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              minWidth: "220px"
            }}>
              <h3>My Bookings</h3>
              <p>View your service bookings and their status.</p>

              <button onClick={() => {
                setShowDashboard(false)
                setShowBookings(true)
              }}>
                View Bookings
              </button>
            </div>

            <div style={{
              padding: "24px",
              border: "1px solid #ddd",
              borderRadius: "12px",
              minWidth: "220px"
            }}>
              <h3>Account Details</h3>
              <p><strong>Name:</strong> {loggedInUser?.name}</p>
              <p><strong>Email:</strong> {loggedInUser?.email}</p>
              <p><strong>Role:</strong> {loggedInUser?.role || "customer"}</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // HOMEPAGE
  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">
          <span>Find</span>MyWorker
        </div>

        <div className="nav-links">
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">Find Workers</a>
          <a href="#">How It Works</a>

          <button
            onClick={() => setShowBookings(true)}
            className="my-bookings-btn"
          >
            My Bookings
          </button>
        </div>

        <div className="nav-buttons">
          {loggedInUser ? (
            <div className="user-area">
              <div className="user-welcome">
                👤 {loggedInUser.name}
              </div>

              <button
                className="logout-btn"
                onClick={() => {
                  setLoggedInUser(null)
                  setShowDashboard(false)
                  setShowBookings(false)
                  setShowProfile(false)
                  setShowLogin(false)
                  setShowSignup(false)
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
          )}

          <button
            className="signup-btn"
            onClick={() => setShowSignup(true)}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">TRUSTED LOCAL SERVICES</p>

          <h1>
            Find the right worker
            <br />
            <span>for your work.</span>
          </h1>

          <p className="hero-text">
            Find skilled and reliable professionals near you.
            Compare services, check prices and book workers
            at your convenient time.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="What service do you need?"
            />

            <input
              type="text"
              placeholder="Enter your location"
            />

            <button>Find Worker</button>
          </div>

          <div className="hero-info">
            <span>✓ Verified Workers</span>
            <span>✓ Transparent Pricing</span>
            <span>✓ Easy Booking</span>
          </div>
        </div>

        <div className="hero-card">
          <div className="worker-icon">👷</div>
          <h3>Need a skilled worker?</h3>
          <p>
            Connect with trusted professionals
            for your everyday work.
          </p>

          <div className="mini-workers">
            <div>⚡</div>
            <div>🔧</div>
            <div>🪚</div>
            <div>🎨</div>
          </div>

          <strong>100+ services available</strong>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="section-heading">
          <p>OUR SERVICES</p>
          <h2>Popular Services</h2>
          <span>
            Find trusted professionals for your everyday needs
          </span>
        </div>

        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon">⚡</div>
            <div>
              <h3>Electrician</h3>
              <p>Wiring, repairs & electrical installation</p>
            </div>
            <span className="service-arrow">→</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🔧</div>
            <div>
              <h3>Plumber</h3>
              <p>Pipe repair, fitting & maintenance</p>
            </div>
            <span className="service-arrow">→</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🪚</div>
            <div>
              <h3>Carpenter</h3>
              <p>Furniture, doors & woodwork services</p>
            </div>
            <span className="service-arrow">→</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🎨</div>
            <div>
              <h3>Painter</h3>
              <p>Home, office & wall painting</p>
            </div>
            <span className="service-arrow">→</span>
          </div>

          <div className="service-card">
            <div className="service-icon">🧹</div>
            <div>
              <h3>Cleaning</h3>
              <p>Home, office & deep cleaning</p>
            </div>
            <span className="service-arrow">→</span>
          </div>

          <div className="service-card">
            <div className="service-icon">❄️</div>
            <div>
              <h3>AC Technician</h3>
              <p>AC repair, servicing & installation</p>
            </div>
            <span className="service-arrow">→</span>
          </div>
        </div>

        <div className="services-bottom">
          <button>View All Services →</button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us">
        <div className="why-content">
          <p className="section-label">WHY FINDMYWORKER?</p>

          <h2>
            Everything you need to
            <span> find the right worker.</span>
          </h2>

          <p>
            FindMyWorker makes it simple to discover trusted
            professionals, understand their services and
            book them according to your requirements.
          </p>
        </div>

        <div className="features">
          <div className="feature">
            <div>✓</div>
            <section>
              <h3>Verified Workers</h3>
              <p>Connect with reliable service professionals.</p>
            </section>
          </div>

          <div className="feature">
            <div>₹</div>
            <section>
              <h3>Clear Pricing</h3>
              <p>Know the expected charges before booking.</p>
            </section>
          </div>

          <div className="feature">
            <div>📅</div>
            <section>
              <h3>Easy Booking</h3>
              <p>Select a convenient date and time.</p>
            </section>
          </div>

          <div className="feature">
            <div>📍</div>
            <section>
              <h3>Local Professionals</h3>
              <p>Find workers available near your location.</p>
            </section>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-heading">
          <p>HOW IT WORKS</p>
          <h2>Get your work done in 3 simple steps</h2>
          <span>
            Finding a trusted professional has never been easier.
          </span>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">🔎</div>
            <h3>Search for a Service</h3>
            <p>
              Choose the service you need and enter your location
              to find available professionals nearby.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">👷</div>
            <h3>Choose Your Worker</h3>
            <p>
              Compare workers based on their skills, experience,
              ratings and service charges.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">📅</div>
            <h3>Book & Get It Done</h3>
            <p>
              Select a suitable date and time, book the worker
              and get your work completed.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="featured-workers">
        <div className="section-heading">
          <p>TRUSTED PROFESSIONALS</p>
          <h2>Featured Workers</h2>
          <span>
            Meet some of the skilled professionals available on FindMyWorker.
          </span>
        </div>

        <div className="worker-grid">
          {workers.map((worker) => (
            <div className="worker-card" key={worker.id}>
              <div className="worker-top">
                <div className="worker-avatar">
                  {worker.job === "Electrician"
                    ? "👨‍🔧"
                    : worker.job === "Plumber"
                    ? "👨‍🔧"
                    : "👨‍🔨"}
                </div>

                <span className="verified">✓ Verified</span>
              </div>

              <h3>{worker.name}</h3>

              <p className="worker-job">
                {worker.job === "Electrician" && "⚡ "}
                {worker.job === "Plumber" && "🔧 "}
                {worker.job === "Carpenter" && "🪚 "}
                {worker.job}
              </p>

              <div className="worker-details">
                <span>📍 {worker.location}</span>
                <span>⭐ {worker.rating}</span>
              </div>

              <div className="worker-bottom">
                <div>
                  <small>Starting from</small>
                  <strong>₹{worker.price}</strong>
                </div>

                <button
                  onClick={() =>
                    setShowProfile(
                      worker.name === "Rahul Kumar"
                        ? "rahul"
                        : worker.name === "Amit Verma"
                        ? "amit"
                        : "sanjay"
                    )
                  }
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="workers-bottom">
          <button>View All Workers →</button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">
          <span>Find</span>MyWorker
        </div>

        <p>
          Connecting people with trusted local professionals.
        </p>

        <small>
          © 2026 FindMyWorker. All rights reserved.
        </small>
      </footer>

    </div>
  )
}

export default App
