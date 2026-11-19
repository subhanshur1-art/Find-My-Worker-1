
require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Admin email: ", (email) => {
  rl.question("Enter new password (minimum 8 characters): ", async (password) => {
    if (password.length < 8) {
      console.log("Password must be at least 8 characters.");
      rl.close();
      db.end();
      return;
    }

    try {
      const hash = await bcrypt.hash(password, 10);

      db.query(
        "UPDATE users SET password = ? WHERE email = ? AND role = 'admin'",
        [hash, email.trim().toLowerCase()],
        (err, result) => {
          if (err) {
            console.error(err.message);
          } else if (result.affectedRows === 1) {
            console.log("Admin password reset successfully!");
          } else {
            console.log("Admin account not found.");
          }

          rl.close();
          db.end();
        }
      );
    } catch (error) {
      console.error(error);
      rl.close();
      db.end();
    }
  });
});
