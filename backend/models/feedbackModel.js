const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    eventExperience: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    speakerInteraction: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    sessionRelevance: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    suggestions: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
