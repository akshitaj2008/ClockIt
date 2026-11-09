const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { isDbConnected } = require("../utils/dbStatus");

const router = express.Router();

// Built-in trial account (documented in the README). It only works while the
// database is unreachable, when the app runs on the in-memory fallback store.
// The id is a valid 24-hex ObjectId so tokens stay compatible if the
// database comes back up.
const TRIAL_EMAIL = "trial@clockit.dev";
const TRIAL_PASSWORD = "trial1234";
const TRIAL_USER = {
  id: "000000000000000000000001",
  name: "Trial User",
  email: TRIAL_EMAIL,
};

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}


// REGISTER
// POST /api/auth/register


router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (!isDbConnected()) {
     return res.status(503).json({
       message:
         "The database is currently unreachable, so new accounts can't " +
         "be created right now. Please try again shortly.",
     });
   }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});


// LOGIN
// POST /api/auth/login


router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!isDbConnected()) {
      // Trial account works regardless of database status.
      if (email === TRIAL_EMAIL && password === TRIAL_PASSWORD) {
        return res.status(200).json({
          message: "Login successful",
          token: signToken(TRIAL_USER.id),
          user: TRIAL_USER,
        });
      }

      return res.status(503).json({
        message:
          "The database is currently unreachable, so accounts can't log " +
          "in right now. Please try again shortly.",
      });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

module.exports = router;