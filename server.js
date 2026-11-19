
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err.message);
    return;
  }

  console.log("MySQL connected successfully!");
});

// Create a token after login
function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from backend .env");
  }

  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Test backend
app.get("/", (req, res) => {
  res.send("FindMyWorker Backend is running!");
});

// Get all workers
app.get("/workers", (req, res) => {
  db.query("SELECT * FROM workers", (err, results) => {
    if (err) {
      console.error("Error fetching workers:", err);
      return res.status(500).json({
        error: "Failed to fetch workers"
      });
    }

    return res.json(results);
  });
});

// Get all services
app.get("/services", (req, res) => {
  db.query("SELECT * FROM services", (err, results) => {
    if (err) {
      console.error("Error fetching services:", err);
      return res.status(500).json({
        error: "Failed to fetch services"
      });
    }

    return res.json(results);
  });
});

// Get services offered by a particular worker
app.get("/worker-services/:workerId", (req, res) => {
  const workerId = req.params.workerId;

  const sql = `
    SELECT
      ws.id AS worker_service_id,
      s.id AS service_id,
      s.name AS service_name,
      s.description,
      ws.price,
      ws.pricing_type,
      ws.estimated_duration,
      ws.is_available
    FROM worker_services ws
    JOIN services s ON ws.service_id = s.id
    WHERE ws.worker_id = ?
      AND ws.is_available = TRUE
    ORDER BY s.name
  `;

  db.query(sql, [workerId], (err, results) => {
    if (err) {
      console.error("Error fetching worker services:", err);
      return res.status(500).json({
        error: "Failed to fetch worker services"
      });
    }

    return res.json(results);
  });
});

// Create a booking
app.post("/bookings", (req, res) => {
  const {
    user_id,
    worker_id,
    worker_service_id,
    booking_date,
    booking_time,
    service_address,
    problem_description
  } = req.body;

  if (
    !user_id ||
    !worker_id ||
    !worker_service_id ||
    !booking_date ||
    !booking_time
  ) {
    return res.status(400).json({
      error: "All booking details are required"
    });
  }

  const checkServiceSql = `
    SELECT
      id,
      price,
      visiting_fee,
      pricing_type,
      estimated_duration
    FROM worker_services
    WHERE id = ?
      AND worker_id = ?
      AND is_available = TRUE
  `;

  db.query(
    checkServiceSql,
    [worker_service_id, worker_id],
    (serviceErr, serviceResults) => {
      if (serviceErr) {
        console.error("Service validation error:", serviceErr);
        return res.status(500).json({
          error: "Failed to validate selected service"
        });
      }

      if (serviceResults.length === 0) {
        return res.status(400).json({
          error: "Selected service is not available for this worker"
        });
      }

      const service = serviceResults[0];
      const servicePrice = Number(service.price);
      const visitingFee = Number(service.visiting_fee || 0);
      const estimatedTotal = servicePrice + visitingFee;

      const sql = `
        INSERT INTO bookings (
          user_id,
          worker_id,
          worker_service_id,
          service_price,
          visiting_fee,
          estimated_total,
          booking_date,
          booking_time,
          service_address,
          problem_descriptio
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sql,
        [
          user_id,
          worker_id,
          worker_service_id,
          servicePrice,
          visitingFee,
          estimatedTotal,
          booking_date,
          booking_time,
          service_address || null,
          problem_description || null
        ],
        (err, result) => {
          if (err) {
            console.error("Error creating booking:", err);
            return res.status(500).json({
              error: "Failed to create booking"
            });
          }

          return res.status(201).json({
            message: "Booking created successfully",
            bookingId: result.insertId,
            pricing: {
              servicePrice,
              visitingFee,
              estimatedTotal
            },
            estimatedDuration: service.estimated_duration
          });
        }
      );
    }
  );
});

// Get bookings for a user
app.get("/my-bookings/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      b.id AS booking_id,
      u.name AS user_name,
      u.email AS user_email,
      w.name AS worker_name,
      w.job,
      w.location,
      s.name AS service_name,
      s.description AS service_description,
      b.service_price,
      b.visiting_fee,
      b.estimated_total,
      ws.pricing_type,
      ws.estimated_duration,
      b.booking_date,
      b.booking_time,
      b.status,
      b.created_at,
      b.service_address,
      b.problem_description
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN workers w ON b.worker_id = w.id
    JOIN worker_services ws ON b.worker_service_id = ws.id
    JOIN services s ON ws.service_id = s.id
    WHERE b.user_id = ?
    ORDER BY b.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).json({
        error: "Failed to fetch bookings"
      });
    }

    return res.json(results);
  });
});

// Signup: store hashed passwords
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, phone)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        typeof phone === "string" && phone.trim()
          ? phone.trim()
          : null
      ],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
              error: "Email already registered"
            });
          }

          console.error("Signup error:", err);
          return res.status(500).json({
            error: "Signup failed"
          });
        }

        return res.status(201).json({
          message: "Account created successfully",
          userId: result.insertId
        });
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Signup failed"
    });
  }
});

// Login: supports hashed accounts and migrates old plaintext passwords
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      error: "Email and password are required"
    });
  }

  const sql = `
    SELECT id, name, email, password, phone, role
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [email.trim().toLowerCase()],
    async (err, results) => {
      if (err) {
        console.error("Login database error:", err);
        return res.status(500).json({
          error: "Login failed"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          error: "Invalid email or password"
        });
      }

      const user = results[0];

      try {
        const storedPassword = user.password;
        const isBcryptHash =
          typeof storedPassword === "string" &&
          /^\$2[aby]\$/.test(storedPassword);

        let isMatch = false;

        if (isBcryptHash) {
          isMatch = await bcrypt.compare(password, storedPassword);
        } else {
          // Compatibility for existing plaintext-password accounts.
          isMatch = password === storedPassword;

          if (isMatch) {
            const newHash = await bcrypt.hash(password, 10);

            await new Promise((resolve, reject) => {
              db.query(
                "UPDATE users SET password = ? WHERE id = ?",
                [newHash, user.id],
                (updateErr) => {
                  if (updateErr) return reject(updateErr);
                  resolve();
                }
              );
            });
          }
        }

        if (!isMatch) {
          return res.status(401).json({
            error: "Invalid email or password"
          });
        }

        const token = createToken(user);
        delete user.password;

        return res.status(200).json({
          message: "Login successful",
          token,
          user
        });
      } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
          error: "Login failed"
        });
      }
    }
  );
});

// Update booking status


app.patch("/bookings/:bookingId/status", (req, res) => {
  const bookingId = Number(req.params.bookingId);
  const { status } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please login first" });
  }

  let decoded;

  try {
    decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired login token",
    });
  }

  if (decoded.role !== "worker") {
    return res.status(403).json({
      error: "Only workers can update assigned bookings",
    });
  }

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ error: "Invalid booking ID" });
  }

  if (!["Accepted", "Rejected", "Completed"].includes(status)) {
    return res.status(400).json({ error: "Invalid booking status" });
  }

  const checkSql = `
    SELECT b.id, b.status
    FROM bookings b
    JOIN workers w ON w.id = b.worker_id
    WHERE b.id = ? AND w.user_id = ?
  `;

  db.query(checkSql, [bookingId, decoded.id], (err, results) => {
    if (err) {
      console.error("Booking ownership check error:", err);
      return res.status(500).json({
        error: "Could not verify booking assignment",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Booking not found for this worker",
      });
    }

    const currentStatus = results[0].status;

    const validTransition =
      (currentStatus === "Pending" &&
        ["Accepted", "Rejected"].includes(status)) ||
      (currentStatus === "Accepted" && status === "Completed");

    if (!validTransition) {
      return res.status(409).json({
        error: `Cannot change booking from ${currentStatus} to ${status}`,
      });
    }

    const updateSql = `
      UPDATE bookings
      SET status = ?
      WHERE id = ? AND status = ?
    `;

    db.query(
      updateSql,
      [status, bookingId, currentStatus],
      (updateErr, result) => {
        if (updateErr) {
          console.error("Booking status update error:", updateErr);
          return res.status(500).json({
            error: "Failed to update booking status",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(409).json({
            error: "Booking status has already changed",
          });
        }

        return res.json({
          message: `Booking ${status.toLowerCase()} successfully`,
          bookingId,
          status,
        });
      }
    );
  });
});

// Start server

app.get("/worker/bookings", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Please login first"
    });
  }

  let decoded;

  try {
    const token = authHeader.split(" ")[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired login token"
    });
  }

  if (decoded.role !== "worker") {
    return res.status(403).json({
      error: "Worker access only"
    });
  }

  const sql = `
    SELECT
      b.id,
      b.booking_date,
      b.booking_time,
      b.service_address,
      b.problem_description,
      b.service_price,
      b.visiting_fee,
      b.estimated_total,
      b.status,
      u.name AS customer_name
    FROM bookings b
    JOIN workers w ON w.id = b.worker_id
    JOIN users u ON u.id = b.user_id
    WHERE w.user_id = ?
    ORDER BY b.created_at DESC
  `;

  db.query(sql, [decoded.id], (err, results) => {
    if (err) {
      console.error("Worker bookings error:", err);
      return res.status(500).json({
        error: "Failed to fetch worker bookings"
      });
    }

    return res.json(results);
  });
});

// ================= ADMIN DASHBOARD API =================

// Admin authentication middleware
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Please login first" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access only" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Get Admin Dashboard data
app.get("/admin/dashboard", verifyAdmin, async (req, res) => {
  const runQuery = (sql) =>
    new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

  try {
    const [users, workers, bookings, stats] = await Promise.all([
      runQuery(`
        SELECT id, name, email, phone, role, created_at
        FROM users
        ORDER BY id DESC
      `),

      runQuery(`
        SELECT
          w.id, w.name, w.job, w.location,
          w.rating, w.experience, w.price, w.phone,
          w.user_id, u.email AS account_email
        FROM workers w
        LEFT JOIN users u ON u.id = w.user_id
        ORDER BY w.id DESC
      `),

      runQuery(`
        SELECT
          b.id AS booking_id,
          b.user_id,
          b.worker_id,
          b.service_price,
          b.visiting_fee,
          b.estimated_total,
          b.booking_date,
          b.booking_time,
          b.service_address,
          b.problem_description,
          b.status,
          u.name AS customer_name,
          u.email AS customer_email,
          u.phone AS customer_phone,
          w.name AS worker_name,
          s.name AS service_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN workers w ON b.worker_id = w.id
        LEFT JOIN worker_services ws ON b.worker_service_id = ws.id
        LEFT JOIN services s ON ws.service_id = s.id
        ORDER BY b.id DESC
      `),

      runQuery(`
        SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'customer') AS totalCustomers,
          (SELECT COUNT(*) FROM workers) AS totalWorkers,
          (SELECT COUNT(*) FROM bookings) AS totalBookings,
          (SELECT COUNT(*) FROM bookings WHERE status = 'Pending') AS pendingBookings
      `)
    ]);

    res.json({
      users,
      workers,
      bookings,
      stats: stats[0]
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      error: "Failed to load Admin Dashboard"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
