const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Alumni = require("../models/Alumni");
const auth = require("../middleware/auth");

const router = express.Router();

// User Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in either User or Alumni collection
    let user = await User.findOne({ email });
    let alumni = await Alumni.findOne({ email });
    
    if (user || alumni) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { user: { id: user._id, isAlumni: false } },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAlumni: false
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Alumni Signup Route
router.post("/alumni/signup", async (req, res) => {
  try {
    const { name, email, password, graduationYear, company, position, bio } = req.body;

    // Check if user already exists in either User or Alumni collection
    let user = await User.findOne({ email });
    let alumni = await Alumni.findOne({ email });
    
    if (user || alumni) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new alumni
    alumni = new Alumni({
      name,
      email,
      password: hashedPassword,
      graduationYear,
      company,
      position,
      bio,
      isAvailableForChat: true
    });
    
    await alumni.save();

    // Generate JWT Token
    const token = jwt.sign(
      { user: { id: alumni._id, isAlumni: true } },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      token,
      user: {
        id: alumni._id,
        name: alumni.name,
        email: alumni.email,
        graduationYear: alumni.graduationYear,
        company: alumni.company,
        position: alumni.position,
        isAlumni: true
      }
    });
  } catch (error) {
    console.error("Alumni signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user in both collections
    let user = await User.findOne({ email });
    let isAlumni = false;
    
    // If not found in User collection, try Alumni collection
    if (!user) {
      user = await Alumni.findOne({ email });
      if (user) isAlumni = true;
    }
    
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { user: { id: user._id, isAlumni } },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Create user object to return
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAlumni
    };
    
    // Add alumni-specific fields if applicable
    if (isAlumni) {
      userResponse.graduationYear = user.graduationYear;
      userResponse.company = user.company;
      userResponse.position = user.position;
    }

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Logged-in User Route
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const isAlumni = req.user.isAlumni;
    
    let user;
    
    if (isAlumni) {
      user = await Alumni.findById(userId).select("-password");
    } else {
      user = await User.findById(userId).select("-password");
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create user object to return
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAlumni
    };
    
    // Add alumni-specific fields if applicable
    if (isAlumni) {
      userResponse.graduationYear = user.graduationYear;
      userResponse.company = user.company;
      userResponse.position = user.position;
      userResponse.bio = user.bio;
      userResponse.isAvailableForChat = user.isAvailableForChat;
    }

    res.json(userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;