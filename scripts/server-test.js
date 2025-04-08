import axios from 'axios';
import chalk from 'chalk';

const API_URL = 'http://localhost:5000';

// Test data for creating a resource
const TEST_RESOURCE = {
  title: 'Test Resource',
  description: 'This is a test resource for API testing',
  category: 'learning_material',
  industry: 'Technology',
  fileUrl: 'https://example.com/test.pdf',
  thumbnailUrl: 'https://example.com/test-thumb.jpg',
  tags: ['test', 'api']
};

// Test data for creating an event
const TEST_EVENT = {
  title: 'Test Event',
  description: 'This is a test event for API testing',
  type: 'workshop',
  startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
  location: 'Online',
  meetingLink: 'https://zoom.us/test',
  capacity: 50,
  tags: ['test', 'api']
};

// Tests if the server is running
async function testServerConnection() {
  console.log(chalk.blue('\nTesting server connection...'));
  try {
    const response = await axios.get(`${API_URL}/api/debug/connection`);
    console.log(chalk.green('✓ Server is running'));
    
    if (response.data.status === 'Connected') {
      console.log(chalk.green('✓ MongoDB is connected'));
      console.log(chalk.blue('  Database:'), response.data.database);
    } else {
      console.error(chalk.red('✗ MongoDB is not connected'));
      console.error(chalk.yellow('  Details:'), response.data.message);
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Server connection failed'));
    if (error.code === 'ECONNREFUSED') {
      console.error(chalk.yellow('  Is the server running? Start it with:'));
      console.error(chalk.yellow('  cd backend && npm run server'));
    } else {
      console.error(chalk.red('  Error:'), error.message);
    }
    return false;
  }
}

async function createTestResource() {
  console.log(chalk.blue('\nTesting resource creation...'));
  try {
    // Add a dummy token for testing
    axios.defaults.headers.common['x-auth-token'] = 'dummy-token-12345';
    
    const response = await axios.post(`${API_URL}/api/resources`, TEST_RESOURCE);
    console.log(chalk.green('✓ Resource created successfully'));
    console.log(chalk.blue('Resource ID:'), response.data._id);
    return response.data._id;
  } catch (error) {
    console.error(chalk.red('✗ Resource creation failed:'));
    if (error.response?.status === 401) {
      console.error(chalk.yellow('  Authentication error - token may be invalid'));
    } else {
      console.error(chalk.red('  Error:'), error.response?.data || error.message);
    }
    return null;
  }
}

async function createTestEvent() {
  console.log(chalk.blue('\nTesting event creation...'));
  try {
    // Add a dummy token for testing
    axios.defaults.headers.common['x-auth-token'] = 'dummy-token-12345';
    
    const response = await axios.post(`${API_URL}/api/events`, TEST_EVENT);
    console.log(chalk.green('✓ Event created successfully'));
    console.log(chalk.blue('Event ID:'), response.data._id);
    return response.data._id;
  } catch (error) {
    console.error(chalk.red('✗ Event creation failed:'));
    if (error.response?.status === 401) {
      console.error(chalk.yellow('  Authentication error - token may be invalid'));
    } else {
      console.error(chalk.red('  Error:'), error.response?.data || error.message);
    }
    return null;
  }
}

async function testDebugEndpoints() {
  console.log(chalk.blue('\nTesting debug endpoints...'));
  
  try {
    const response = await axios.get(`${API_URL}/api/debug/connection`);
    console.log(chalk.green('✓ Debug connection endpoint works'));
  } catch (error) {
    console.error(chalk.red('✗ Debug connection endpoint failed:'), error.message);
  }
  
  try {
    axios.defaults.headers.common['x-auth-token'] = 'dummy-token-12345';
    const eventResponse = await axios.post(`${API_URL}/api/debug/test-event`, TEST_EVENT);
    console.log(chalk.green('✓ Debug event endpoint works'));
  } catch (error) {
    console.error(chalk.red('✗ Debug event endpoint failed:'), error.message);
  }
  
  try {
    axios.defaults.headers.common['x-auth-token'] = 'dummy-token-12345';
    const resourceResponse = await axios.post(`${API_URL}/api/debug/test-resource`, TEST_RESOURCE);
    console.log(chalk.green('✓ Debug resource endpoint works'));
  } catch (error) {
    console.error(chalk.red('✗ Debug resource endpoint failed:'), error.message);
  }
}

async function runTests() {
  console.log(chalk.yellow.bold('AlumniConnect API Test Tool'));
  console.log(chalk.yellow('=============================='));
  
  const serverOk = await testServerConnection();
  if (!serverOk) {
    console.error(chalk.red('Server not available, cannot continue with API tests.'));
    process.exit(1);
  }
  
  await testDebugEndpoints();
  
  const resourceId = await createTestResource();
  const eventId = await createTestEvent();
  
  console.log(chalk.yellow.bold('\nTest Summary:'));
  console.log(chalk.yellow('=============================='));
  console.log('Server Connection:', serverOk ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
  console.log('Resource Creation:', resourceId ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
  console.log('Event Creation:', eventId ? chalk.green('✓ Passed') : chalk.red('✗ Failed'));
  
  if (resourceId && eventId) {
    console.log(chalk.green.bold('\nAll tests passed! The API is working correctly.'));
  } else {
    console.log(chalk.yellow.bold('\nSome tests failed. Check the error messages above.'));
  }
}

// Run all tests
runTests().catch(error => {
  console.error(chalk.red('\nTest script encountered an error:'));
  console.error(error);
}); 