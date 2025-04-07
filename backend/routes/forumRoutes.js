const express = require("express");
const router = express.Router();
const ForumMessage = require("../models/ForumMessage");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Get all messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await ForumMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new message
router.post("/messages", auth, async (req, res) => {
  try {
    const { content, username, avatar } = req.body;
    
    if (!content) {
      return res.status(400).json({ msg: "Content is required" });
    }
    
    const newMessage = new ForumMessage({
      content,
      user: req.user.id,
      username,
      avatar
    });
    
    const message = await newMessage.save();
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Add a reply to a message
router.post("/messages/:id/replies", auth, async (req, res) => {
  try {
    const { content, username, avatar } = req.body;
    
    if (!content) {
      return res.status(400).json({ msg: "Content is required" });
    }
    
    const message = await ForumMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }
    
    const newReply = {
      content,
      user: req.user.id,
      username,
      avatar,
      createdAt: Date.now()
    };
    
    message.replies.push(newReply);
    await message.save();
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Message not found" });
    }
    res.status(500).send("Server Error");
  }
});

// Delete a message
router.delete("/messages/:id", auth, async (req, res) => {
  try {
    const message = await ForumMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }
    
    // Check if user owns the message
    if (message.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    
    await message.remove();
    
    res.json({ msg: "Message removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Message not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
