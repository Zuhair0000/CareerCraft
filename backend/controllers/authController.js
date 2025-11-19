const pool = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(401).json({ message: "All fields required" });
  }

  try {
    const hashed = bcrypt.hash(10, password);

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      return res.status(409).json({ messag: "User already exxist" });
    }

    const user = await pool.query(
      "INSERT INTO users(full_name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashed]
    );

    res
      .status(201)
      .json({ message: "Registered successfully", user: user.rows[0] });
  } catch (err) {
    console.log(err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).json({ message: "All fields required" });
  }

  try {
    const users = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (users.rows.length === 0) {
      return res.status(409).json({ message: "User not found" });
    }
    const user = users.rows[0];

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(409).json({ message: "Password invalid" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
