const express = require("express");
const router = express.Router();
const Alumni = require("../models/Alumni");
const auth = require("../middleware/auth");

// Get all alumni
router.get("/", async (req, res) => {
  try {
    const alumni = await Alumni.find().select("-password");
    res.json(alumni);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get alumni by ID
router.get("/:id", async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id).select("-password");
    if (!alumni) {
      return res.status(404).json({ msg: "Alumni not found" });
    }
    res.json(alumni);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Alumni not found" });
    }
    res.status(500).send("Server Error");
  }
});

// Update alumni availability status
router.put("/status", auth, async (req, res) => {
  const { isAvailableForChat } = req.body;
  
  try {
    // Verify the user is an alumni
    const alumni = await Alumni.findById(req.user.id);
    if (!alumni) {
      return res.status(401).json({ msg: "Not authorized as alumni" });
    }
    
    alumni.isAvailableForChat = isAvailableForChat;
    await alumni.save();
    
    res.json({ msg: "Status updated", isAvailableForChat });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
