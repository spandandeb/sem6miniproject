const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedbackModel");

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { eventId, rating, eventExperience, speakerInteraction, sessionRelevance, suggestions } = req.body;

    // Validate required fields
    if (!eventId || !rating || !eventExperience || !speakerInteraction || !sessionRelevance) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create event name mapping (in a real app, this would come from a database)
    const events = {
      "event1": "Tech Career Workshop",
      "event2": "Resume Building Session",
      "event3": "Interview Preparation Seminar",
      "event4": "Networking Masterclass",
      "event5": "Industry Insights Panel"
    };

    // Create feedback object
    const feedback = new Feedback({
      eventId,
      eventName: events[eventId] || "Unknown Event",
      rating,
      eventExperience,
      speakerInteraction,
      sessionRelevance,
      suggestions: suggestions || "",
      // userId would be set from authenticated user in a real app
    });

    // Save feedback to database
    const savedFeedback = await feedback.save();
    
    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback
// @access  Public (would be restricted in a real app)
router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get feedback by ID
// @access  Public (would be restricted in a real app)
router.get("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
