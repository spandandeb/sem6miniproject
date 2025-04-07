const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configure nodemailer (would use env variables in production)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Get all events
router.get('/', async (req, res) => {
  try {
    const { type, upcoming, past, search } = req.query;
    
    const queryObj = {};
    
    // Filter by type if provided
    if (type) {
      queryObj.type = type;
    }
    
    // Filter by date
    const now = new Date();
    if (upcoming === 'true') {
      queryObj.startTime = { $gte: now };
    } else if (past === 'true') {
      queryObj.endTime = { $lt: now };
    }
    
    // Search by title or description
    if (search) {
      queryObj.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const events = await Event.find(queryObj)
      .populate('organizer', 'name email')
      .sort({ startTime: 1 }) // Sort by upcoming events first
      .lean();
    
    // Add virtual properties to each event (since we're using lean())
    const eventsWithCounts = events.map(event => {
      const attendeeCount = event.attendees.filter(a => a.status !== 'cancelled').length;
      return {
        ...event,
        attendeeCount,
        availableSpots: event.capacity - attendeeCount,
        isFull: (event.capacity - attendeeCount) <= 0
      };
    });
    
    res.json(eventsWithCounts);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new event
router.post('/', auth, async (req, res) => {
  try {
    console.log('Event creation - Request body:', JSON.stringify(req.body));
    console.log('Event creation - User object:', JSON.stringify(req.user));
    console.log('Event creation - User ID:', req.user.id);
    console.log('Event creation - User ID type:', typeof req.user.id);
    
    const { 
      title, 
      description, 
      type, 
      startTime, 
      endTime, 
      location, 
      meetingLink, 
      capacity, 
      tags,
      imageUrl
    } = req.body;
    
    // Create the event object with explicit organizer value
    const organizerId = req.user.id;
    console.log('Event creation - Organizer ID before creating event:', organizerId);
    
    const newEvent = new Event({
      title,
      description,
      type,
      startTime,
      endTime,
      location, 
      meetingLink,
      organizer: organizerId,
      capacity,
      tags: tags || [],
      imageUrl
    });
    
    console.log('Event creation - Event object created:', newEvent);
    console.log('Event creation - Organizer type in event:', typeof newEvent.organizer);
    
    const savedEvent = await newEvent.save();
    console.log('Event creation - Event saved successfully:', savedEvent._id);
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    // Provide more specific error message for troubleshooting
    if (error.name === 'ValidationError') {
      console.error('Event validation error details:', JSON.stringify(error.errors));
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await event.remove();
    
    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for an event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if event is full
    if (event.isFull()) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    // Check if user is already registered
    const alreadyRegistered = event.attendees.find(
      a => a.user.toString() === req.user.id && a.status !== 'cancelled'
    );
    
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Add user to attendees
    event.attendees.push({
      user: req.user.id,
      status: 'registered',
      registeredAt: Date.now()
    });
    
    await event.save();
    
    // Send confirmation email
    const emailResult = await sendConfirmationEmail(req.user.email, event);
    
    res.json({ 
      message: 'Successfully registered for event',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel registration
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Find user's registration
    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user.id && a.status === 'registered'
    );
    
    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'Not registered for this event' });
    }
    
    // Update status to cancelled
    event.attendees[attendeeIndex].status = 'cancelled';
    
    await event.save();
    
    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to send confirmation email
async function sendConfirmationEmail(userEmail, event) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'alumni@connect.edu',
      to: userEmail,
      subject: `Event Registration Confirmation: ${event.title}`,
      html: `
        <h1>Registration Confirmed!</h1>
        <p>Thank you for registering for ${event.title}.</p>
        <h2>Event Details:</h2>
        <ul>
          <li><strong>Date:</strong> ${new Date(event.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(event.startTime).toLocaleTimeString()} - ${new Date(event.endTime).toLocaleTimeString()}</li>
          <li><strong>Location:</strong> ${event.location}</li>
          ${event.meetingLink ? `<li><strong>Meeting Link:</strong> ${event.meetingLink}</li>` : ''}
        </ul>
        <p>We look forward to seeing you there!</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

module.exports = router; 