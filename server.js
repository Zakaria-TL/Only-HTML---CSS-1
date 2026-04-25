const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "db",
  user: "root",
  password: "root",
  database: "testdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

function checkConnection() {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Database not ready will try after 5 seconds");
      setTimeout(checkConnection, 5000);
    } else {
      console.log("Connection succeed by Pool");
      connection.release();
    }
  });
}

checkConnection();

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error or User exists" });
      res.json({ message: "User registered successfully" });
    },
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.length > 0) return res.json({ message: "Login success" });
      res.json({ message: "Invalid credentials" });
    },
  );
});

app.listen(3000, () => {
  console.log(" Server running on http://localhost:3000");
});
