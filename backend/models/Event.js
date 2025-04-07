const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['mentoring_session', 'workshop', 'webinar', 'networking']
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true, // Can be "Online" or physical location
    },
    meetingLink: {
      type: String,
      required: function() {
        return this.location === 'Online';
      }
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      get: function(v) {
        // Ensure we always return an ObjectId, whether it's stored as string or ObjectId
        if (typeof v === 'string' && mongoose.Types.ObjectId.isValid(v)) {
          return new mongoose.Types.ObjectId(v);
        }
        return v;
      }
    },
    capacity: {
      type: Number,
      required: true
    },
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        status: {
          type: String,
          enum: ['registered', 'attended', 'cancelled'],
          default: 'registered'
        },
        registeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tags: [String],
    imageUrl: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true }
  }
);

// Pre-save middleware to ensure organizer is an ObjectId
eventSchema.pre('save', function(next) {
  // If organizer is a string but a valid ObjectId, convert it
  if (this.organizer && typeof this.organizer === 'string' && mongoose.Types.ObjectId.isValid(this.organizer)) {
    this.organizer = new mongoose.Types.ObjectId(this.organizer);
  }
  next();
});

// Virtual for current attendance count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(a => a.status !== 'cancelled').length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.attendees.filter(a => a.status !== 'cancelled').length;
});

// Method to check if event is full
eventSchema.methods.isFull = function() {
  return this.availableSpots <= 0;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 