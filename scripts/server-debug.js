// Simple script to debug server connectivity and test endpoints
const http = require('http');
const readline = require('readline');

const API_URL = 'http://localhost:5000';
const TEST_RESOURCE = {
  title: 'Test Resource',
  description: 'This is a test resource created by the debug tool',
  category: 'learning_material',
  industry: 'Technology',
  fileUrl: 'https://example.com/test-resource.pdf',
  thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
  tags: ['test', 'diagnostic']
};

const TEST_EVENT = {
  title: 'Test Event',
  description: 'This is a test event created by the debug tool',
  type: 'webinar',
  startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
  endTime: new Date(Date.now() + 90000000).toISOString(),  // Tomorrow + 1 hour
  location: 'Online',
  meetingLink: 'https://zoom.us/test-meeting',
  capacity: 50,
  tags: ['test', 'diagnostic']
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, headers: res.headers, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function checkServerConnection() {
  console.log('\nChecking server connection...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/debug/connection',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`\n✅ Server responded with status: ${response.statusCode}`);
    console.log('\nServer response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`\n❌ Server connection failed: ${error.message}`);
    return false;
  }
}

async function testResourceCreation() {
  console.log('\nTesting resource creation...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/debug/test-resource',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': 'dummy-token-12345'
    }
  };
  
  try {
    const response = await makeRequest(options, TEST_RESOURCE);
    console.log(`\n✅ Resource creation test responded with status: ${response.statusCode}`);
    console.log('\nServer response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`\n❌ Resource creation test failed: ${error.message}`);
    return false;
  }
}

async function testEventCreation() {
  console.log('\nTesting event creation...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/debug/test-event',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': 'dummy-token-12345'
    }
  };
  
  try {
    const response = await makeRequest(options, TEST_EVENT);
    console.log(`\n✅ Event creation test responded with status: ${response.statusCode}`);
    console.log('\nServer response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`\n❌ Event creation test failed: ${error.message}`);
    return false;
  }
}

async function testRealResourceCreation() {
  console.log('\nTesting REAL resource creation with API...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/resources',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': 'dummy-token-12345'
    }
  };
  
  try {
    const response = await makeRequest(options, TEST_RESOURCE);
    console.log(`\n✅ REAL Resource creation responded with status: ${response.statusCode}`);
    console.log('\nServer response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`\n❌ REAL Resource creation failed: ${error.message}`);
    return false;
  }
}

async function testRealEventCreation() {
  console.log('\nTesting REAL event creation with API...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': 'dummy-token-12345'
    }
  };
  
  try {
    const response = await makeRequest(options, TEST_EVENT);
    console.log(`\n✅ REAL Event creation responded with status: ${response.statusCode}`);
    console.log('\nServer response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`\n❌ REAL Event creation failed: ${error.message}`);
    return false;
  }
}

function showMenu() {
  console.log('\n🔍 AlumniConnect Server Debug Tool');
  console.log('-------------------------------');
  console.log('1. Check server connection');
  console.log('2. Test debug resource creation');
  console.log('3. Test debug event creation');
  console.log('4. Test REAL resource creation with API');
  console.log('5. Test REAL event creation with API');
  console.log('6. Run all tests');
  console.log('q. Quit');
  
  rl.question('\nEnter your choice: ', async (answer) => {
    switch (answer.trim().toLowerCase()) {
      case '1':
        await checkServerConnection();
        setTimeout(showMenu, 1000);
        break;
      case '2':
        await testResourceCreation();
        setTimeout(showMenu, 1000);
        break;
      case '3':
        await testEventCreation();
        setTimeout(showMenu, 1000);
        break;
      case '4':
        await testRealResourceCreation();
        setTimeout(showMenu, 1000);
        break;
      case '5':
        await testRealEventCreation();
        setTimeout(showMenu, 1000);
        break;
      case '6':
        console.log('\n🧪 Running all tests...');
        await checkServerConnection();
        await testResourceCreation();
        await testEventCreation();
        await testRealResourceCreation();
        await testRealEventCreation();
        setTimeout(showMenu, 1000);
        break;
      case 'q':
        console.log('\nExiting. Goodbye!');
        rl.close();
        break;
      default:
        console.log('\nInvalid option. Please try again.');
        setTimeout(showMenu, 500);
    }
  });
}

console.log('🚀 Starting AlumniConnect Server Debug Tool...');
console.log('Make sure your backend server is running on port 5000.');
showMenu(); 