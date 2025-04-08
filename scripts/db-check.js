const axios = require('axios');
const chalk = require('chalk');

const API_URL = 'http://localhost:5000';

async function checkDatabaseConnection() {
  console.log(chalk.blue('Checking database connection...'));
  
  try {
    const response = await axios.get(`${API_URL}/api/debug/connection`);
    console.log(chalk.green('✓ Database connection successful'));
    console.log(chalk.blue('Connection details:'));
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(chalk.red('✗ Database connection failed'));
    console.error(chalk.red('Error:'), error.response?.data || error.message);
    return false;
  }
}

async function testResourceAndEventFunctionality() {
  let testPassed = true;
  
  // Test fetching resources
  try {
    console.log(chalk.blue('\nTesting resource listing...'));
    const resources = await axios.get(`${API_URL}/api/resources`);
    console.log(chalk.green(`✓ Resources API working (${resources.data.length} resources found)`));
  } catch (error) {
    console.error(chalk.red('✗ Resources API failed'));
    console.error(chalk.red('Error:'), error.response?.data || error.message);
    testPassed = false;
  }
  
  // Test fetching events
  try {
    console.log(chalk.blue('\nTesting event listing...'));
    const events = await axios.get(`${API_URL}/api/events`);
    console.log(chalk.green(`✓ Events API working (${events.data.length} events found)`));
  } catch (error) {
    console.error(chalk.red('✗ Events API failed'));
    console.error(chalk.red('Error:'), error.response?.data || error.message);
    testPassed = false;
  }
  
  return testPassed;
}

async function runTests() {
  console.log(chalk.bold('=== AlumniConnect API Diagnostic Tool ===\n'));
  
  const dbConnected = await checkDatabaseConnection();
  
  if (dbConnected) {
    const functionalityWorking = await testResourceAndEventFunctionality();
    
    if (functionalityWorking) {
      console.log(chalk.bold.green('\n✓ All systems operational!'));
      console.log(chalk.green('You can now upload resources and create events.'));
    } else {
      console.log(chalk.bold.yellow('\n⚠ Some functionality is not working correctly.'));
      console.log(chalk.yellow('Check that your server is properly configured.'));
    }
  } else {
    console.log(chalk.bold.red('\n✗ Cannot proceed without database connection.'));
    console.log(chalk.red('Please check your MongoDB connection string and ensure the service is running.'));
  }
}

runTests().catch(error => {
  console.error(chalk.red('Test script failed:'), error);
}); 