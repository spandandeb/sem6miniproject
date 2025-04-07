const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      enum: ['learning_material', 'resume_template', 'cover_letter', 'interview_guide']
    },
    industry: {
      type: String,
      required: function() {
        return this.category === 'learning_material';
      }
    },
    fileUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      get: function(v) {
        // Ensure we always return an ObjectId, whether it's stored as string or ObjectId
        if (typeof v === 'string' && mongoose.Types.ObjectId.isValid(v)) {
          return new mongoose.Types.ObjectId(v);
        }
        return v;
      }
    },
    tags: [String],
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number, 
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          get: function(v) {
            // Ensure we always return an ObjectId for reviewer
            if (typeof v === 'string' && mongoose.Types.ObjectId.isValid(v)) {
              return new mongoose.Types.ObjectId(v);
            }
            return v;
          }
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true }
  }
);

// Pre-save middleware to ensure author is an ObjectId
resourceSchema.pre('save', function(next) {
  // If author is a string but a valid ObjectId, convert it
  if (this.author && typeof this.author === 'string' && mongoose.Types.ObjectId.isValid(this.author)) {
    this.author = new mongoose.Types.ObjectId(this.author);
  }
  
  // Also check review users
  if (this.reviews && this.reviews.length > 0) {
    this.reviews.forEach(review => {
      if (review.user && typeof review.user === 'string' && mongoose.Types.ObjectId.isValid(review.user)) {
        review.user = new mongoose.Types.ObjectId(review.user);
      }
    });
  }
  
  next();
});

// Method to increment view count
resourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment download count
resourceSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Method to add a review
resourceSchema.methods.addReview = function(userId, rating, comment) {
  // Ensure userId is an ObjectId
  if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
    userId = new mongoose.Types.ObjectId(userId);
  }
  
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  
  // Update average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.rating.average = totalRating / this.reviews.length;
  this.rating.count = this.reviews.length;
  
  return this.save();
};

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource; 