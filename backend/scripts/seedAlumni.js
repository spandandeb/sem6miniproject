const mongoose = require('mongoose');
const Alumni = require('../models/Alumni');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample alumni data with numericId fields
const alumniData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '$2a$10$XHvjKGhEktF1XQxua9CrI.KhGXRzJ7HdrVwGaP3YYUr1PmPUjfq1O', // hashed "password123"
    graduationYear: 2018,
    company: 'Google',
    position: 'Software Engineer',
    bio: 'Experienced software engineer with a passion for AI and machine learning.',
    isAvailableForChat: true,
    numericId: 101
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: '$2a$10$XHvjKGhEktF1XQxua9CrI.KhGXRzJ7HdrVwGaP3YYUr1PmPUjfq1O', // hashed "password123"
    graduationYear: 2019,
    company: 'Microsoft',
    position: 'Product Manager',
    bio: 'Product manager with experience in tech products and user experience design.',
    isAvailableForChat: true,
    numericId: 102
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    password: '$2a$10$XHvjKGhEktF1XQxua9CrI.KhGXRzJ7HdrVwGaP3YYUr1PmPUjfq1O', // hashed "password123"
    graduationYear: 2020,
    company: 'Amazon',
    position: 'Data Scientist',
    bio: 'Data scientist with expertise in big data and analytics.',
    isAvailableForChat: true,
    numericId: 103
  }
];

// Function to seed alumni data
const seedAlumni = async () => {
  try {
    // Clear existing alumni data
    await Alumni.deleteMany({});
    console.log('Cleared existing alumni data');

    // Insert new alumni data
    const createdAlumni = await Alumni.insertMany(alumniData);
    console.log(`Added ${createdAlumni.length} alumni to the database`);
    
    // Display the created alumni
    createdAlumni.forEach(alumni => {
      console.log(`Created alumni: ${alumni.name} with ID ${alumni._id} and numericId ${alumni.numericId}`);
    });

    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  } catch (error) {
    console.error('Error seeding alumni data:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedAlumni();
