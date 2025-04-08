const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// Get all resources with filtering options
router.get('/', async (req, res) => {
  try {
    const { category, industry, search, sortBy, limit = 20 } = req.query;
    
    const queryObj = {};
    
    // Filter by category
    if (category) {
      queryObj.category = category;
    }
    
    // Filter by industry
    if (industry) {
      queryObj.industry = industry;
    }
    
    // Search in title or description
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Always only return public resources
    queryObj.isPublic = true;
    
    // Create query with sort options
    let query = Resource.find(queryObj)
      .populate('author', 'name email')
      .limit(parseInt(limit));
    
    // Apply sorting
    if (sortBy === 'popular') {
      query = query.sort({ downloads: -1 });
    } else if (sortBy === 'newest') {
      query = query.sort({ createdAt: -1 });
    } else if (sortBy === 'highly_rated') {
      query = query.sort({ 'rating.average': -1 });
    } else {
      // Default sort by newest
      query = query.sort({ createdAt: -1 });
    }
    
    const resources = await query.lean();
    
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'name email')
      .populate('reviews.user', 'name email');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Increment view count
    await resource.incrementViews();
    
    res.json(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new resource
router.post('/', auth, async (req, res) => {
  try {
    console.log('Resource creation - Request body:', JSON.stringify(req.body));
    console.log('Resource creation - User object:', JSON.stringify(req.user));
    console.log('Resource creation - User ID:', req.user.id);
    console.log('Resource creation - User ID type:', typeof req.user.id);
    
    const { 
      title, 
      description, 
      category, 
      industry, 
      fileUrl, 
      thumbnailUrl, 
      tags,
      isPublic
    } = req.body;
    
    // Create the resource object with explicit author value
    const authorId = req.user.id;
    console.log('Resource creation - Author ID before creating resource:', authorId);
    
    const newResource = new Resource({
      title,
      description,
      category,
      industry,
      fileUrl,
      thumbnailUrl,
      tags: tags || [],
      author: authorId,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    console.log('Resource creation - Resource object created:', newResource);
    console.log('Resource creation - Author type in resource:', typeof newResource.author);
    
    const savedResource = await newResource.save();
    console.log('Resource creation - Resource saved successfully:', savedResource._id);
    
    res.status(201).json(savedResource);
  } catch (error) {
    console.error('Error creating resource:', error);
    // Provide more specific error message for troubleshooting
    if (error.name === 'ValidationError') {
      console.error('Resource validation error details:', JSON.stringify(error.errors));
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a resource
router.put('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user is the author
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this resource' });
    }
    
    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedResource);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a resource
router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user is the author
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }
    
    await Resource.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Resource removed' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a download
router.post('/:id/download', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Increment download count
    await resource.incrementDownloads();
    
    // In a real app, you would handle file download here
    // For now, we'll just return the file URL
    res.json({ 
      message: 'Download registered successfully',
      fileUrl: resource.fileUrl
    });
  } catch (error) {
    console.error('Error registering download:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a review/rating
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // Check if user already reviewed
    const hasReviewed = resource.reviews.some(review => 
      review.user.toString() === req.user.id
    );
    
    if (hasReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this resource' });
    }
    
    // Add review
    await resource.addReview(req.user.id, rating, comment);
    
    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 