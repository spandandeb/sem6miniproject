/**
 * Token and ObjectId Test Script
 * This script tests if the dummy token properly converts to a valid MongoDB ObjectId
 */

import axios from 'axios';
import mongoose from 'mongoose';
import chalk from 'chalk';

const API_URL = 'http://localhost:5000';
const DUMMY_TOKEN = 'dummy-token-12345';

// Test data for creating an event
const TEST_EVENT = {
  title: 'ObjectId Test Event',
  description: 'This event tests if the dummy token is properly converted to an ObjectId',
  type: 'workshop',
  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
  location: 'Online',
  meetingLink: 'https://zoom.us/test',
  capacity: 50,
  tags: ['test', 'objectid', 'fix']
};

// Test data for creating a resource
const TEST_RESOURCE = {
  title: 'ObjectId Test Resource',
  description: 'This resource tests if the dummy token is properly converted to an ObjectId',
  category: 'learning_material',
  industry: 'Technology',
  fileUrl: 'https://example.com/test.pdf',
  thumbnailUrl: 'https://example.com/test-thumb.jpg',
  tags: ['test', 'objectid', 'fix']
};

// Visualize the ObjectId format
function displayObjectId() {
  console.log(chalk.blue('\nObjectId Information:'));
  const objectId = new mongoose.Types.ObjectId('000000000000000000000001');
  console.log('  String representation:', chalk.yellow(objectId.toString()));
  console.log('  Valid ObjectId?', chalk.green(mongoose.Types.ObjectId.isValid(objectId)));
  console.log('  Hex value:', chalk.yellow(objectId.toHexString()));
  console.log('  Type:', chalk.yellow(typeof objectId));
  console.log('  Instance check:', chalk.yellow(objectId instanceof mongoose.Types.ObjectId));
}

// Test the connection to check if auth headers and token are working
async function testConnection() {
  console.log(chalk.blue('\nTesting server connection with dummy token...'));
  try {
    // Add the dummy token to the headers
    axios.defaults.headers.common['x-auth-token'] = DUMMY_TOKEN;
    
    const response = await axios.get(`${API_URL}/api/debug/connection`);
    console.log(chalk.green('✓ Connection successful'));
    console.log(chalk.blue('Response data:'));
    console.log(JSON.stringify(response.data, null, 2));
    
    // Check if the user ID in the response is valid
    if (response.data.auth && response.data.auth.id) {
      console.log(chalk.blue('\nValidating user ID from response:'));
      const userId = response.data.auth.id;
      console.log('  User ID:', chalk.yellow(userId));
      console.log('  Valid ObjectId?', chalk.green(mongoose.Types.ObjectId.isValid(userId)));
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Connection test failed:'));
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
    } else {
      console.error('  Error:', error.message);
    }
    return false;
  }
}

// Test creating an event with the dummy token
async function testEventCreation() {
  console.log(chalk.blue('\nTesting event creation with dummy token...'));
  try {
    // Add the dummy token to the headers
    axios.defaults.headers.common['x-auth-token'] = DUMMY_TOKEN;
    
    const response = await axios.post(`${API_URL}/api/events`, TEST_EVENT);
    console.log(chalk.green('✓ Event created successfully'));
    console.log(chalk.blue('Event ID:'), chalk.yellow(response.data._id));
    console.log(chalk.blue('Event organizer:'), chalk.yellow(response.data.organizer));
    return response.data._id;
  } catch (error) {
    console.error(chalk.red('✗ Event creation failed:'));
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
      if (error.response.data.details) {
        console.error('  Validation errors:', error.response.data.details);
      }
    } else {
      console.error('  Error:', error.message);
    }
    return null;
  }
}

// Test creating a resource with the dummy token
async function testResourceCreation() {
  console.log(chalk.blue('\nTesting resource creation with dummy token...'));
  try {
    // Add the dummy token to the headers
    axios.defaults.headers.common['x-auth-token'] = DUMMY_TOKEN;
    
    const response = await axios.post(`${API_URL}/api/resources`, TEST_RESOURCE);
    console.log(chalk.green('✓ Resource created successfully'));
    console.log(chalk.blue('Resource ID:'), chalk.yellow(response.data._id));
    console.log(chalk.blue('Resource author:'), chalk.yellow(response.data.author));
    return response.data._id;
  } catch (error) {
    console.error(chalk.red('✗ Resource creation failed:'));
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Data:', error.response.data);
      if (error.response.data.details) {
        console.error('  Validation errors:', error.response.data.details);
      }
    } else {
      console.error('  Error:', error.message);
    }
    return null;
  }
}

// Test debug endpoints
async function testDebugEndpoints() {
  console.log(chalk.blue('\nTesting debug endpoints...'));
  
  // Test debug connection endpoint
  try {
    axios.defaults.headers.common['x-auth-token'] = DUMMY_TOKEN;
    const connectionResponse = await axios.get(`${API_URL}/api/debug/connection`);
    console.log(chalk.green('✓ Debug connection endpoint works'));
  } catch (error) {
    console.error(chalk.red('✗ Debug connection endpoint failed:'), error.message);
  }
  
  // Test debug event creation endpoint
  try {
    const eventResponse = await axios.post(`${API_URL}/api/debug/test-event`, TEST_EVENT);
    console.log(chalk.green('✓ Debug event endpoint works'));
    console.log(chalk.blue('  User ID:'), chalk.yellow(eventResponse.data.userId));
    console.log(chalk.blue('  User ID type:'), chalk.yellow(eventResponse.data.userIdType));
  } catch (error) {
    console.error(chalk.red('✗ Debug event endpoint failed:'), error.message);
  }
  
  // Test debug resource creation endpoint
  try {
    const resourceResponse = await axios.post(`${API_URL}/api/debug/test-resource`, TEST_RESOURCE);
    console.log(chalk.green('✓ Debug resource endpoint works'));
    console.log(chalk.blue('  User ID:'), chalk.yellow(resourceResponse.data.userId));
    console.log(chalk.blue('  User ID type:'), chalk.yellow(resourceResponse.data.userIdType));
  } catch (error) {
    console.error(chalk.red('✗ Debug resource endpoint failed:'), error.message);
  }
}

// Run all tests
async function runTests() {
  console.log(chalk.yellow.bold('AlumniConnect Token & ObjectId Test Tool'));
  console.log(chalk.yellow('============================================'));
  
  displayObjectId();
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error(chalk.red('Connection test failed, cannot continue with other tests.'));
    return;
  }
  
  await testDebugEndpoints();
  
  // Test real endpoints
  const eventId = await testEventCreation();
  const resourceId = await testResourceCreation();
  
  // Summary
  console.log(chalk.yellow.bold('\nTest Summary:'));
  console.log(chalk.yellow('============================================'));
  console.log('Connection Test:', connectionOk ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
  console.log('Event Creation:', eventId ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
  console.log('Resource Creation:', resourceId ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('\nTest script encountered an error:'));
  console.error(error);
}); 