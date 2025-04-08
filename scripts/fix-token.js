// ES Module version for fix-token.js
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOKEN_TO_TEST = 'dummy-token-12345';
const PORT = 3333;

// Create test HTML file
const createTestHtml = () => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>AlumniConnect Token Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .box { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    button { padding: 8px 16px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background-color: #4338ca; }
    .success { color: green; }
    .error { color: red; }
    pre { background-color: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>AlumniConnect Token Test Tool</h1>
  
  <div class="box">
    <h2>Step 1: Check for existing token</h2>
    <p>Current token: <span id="current-token">None</span></p>
    <button onclick="checkToken()">Check Token</button>
  </div>
  
  <div class="box">
    <h2>Step 2: Set a test token</h2>
    <button onclick="setTestToken()">Set Test Token</button>
  </div>
  
  <div class="box">
    <h2>Step 3: Test the token with your backend</h2>
    <p>Before testing, make sure your backend server is running on port 5000</p>
    <p>Status: <span id="test-status">Not tested</span></p>
    <button onclick="testToken()">Test Token</button>
    <div id="test-result" style="margin-top: 10px;"></div>
  </div>
  
  <div class="box">
    <h2>Step 4: Clear the token</h2>
    <button onclick="clearToken()">Clear Token</button>
  </div>

  <script>
    function checkToken() {
      const token = localStorage.getItem('authToken');
      document.getElementById('current-token').textContent = token || 'None';
    }
    
    function setTestToken() {
      localStorage.setItem('authToken', '${TOKEN_TO_TEST}');
      checkToken();
      document.getElementById('current-token').className = 'success';
    }
    
    function clearToken() {
      localStorage.removeItem('authToken');
      checkToken();
      document.getElementById('current-token').className = '';
    }
    
    function testToken() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        document.getElementById('test-status').textContent = 'No token found!';
        document.getElementById('test-status').className = 'error';
        return;
      }
      
      document.getElementById('test-status').textContent = 'Testing...';
      document.getElementById('test-status').className = '';
      
      fetch('http://localhost:5000/api/debug/connection', {
        headers: {
          'x-auth-token': token
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server responded with status: ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        document.getElementById('test-status').textContent = 'Success! Token is working.';
        document.getElementById('test-status').className = 'success';
        document.getElementById('test-result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
      })
      .catch(error => {
        document.getElementById('test-status').textContent = 'Error: ' + error.message;
        document.getElementById('test-status').className = 'error';
      });
    }
    
    // Check token on page load
    checkToken();
  </script>
</body>
</html>
`;

  // Save the HTML file
  const filePath = path.join(__dirname, 'token-test.html');
  fs.writeFileSync(filePath, html);
  return filePath;
}

// Start the HTTP server
const startServer = (htmlFilePath) => {
  const server = http.createServer((req, res) => {
    fs.readFile(htmlFilePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading test page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  });
  
  server.listen(PORT, () => {
    console.log(`Token test server running at http://localhost:${PORT}/`);
    console.log('Use this page to test the authentication token.');
    console.log('Make sure your backend server is running on port 5000.');
  });
  
  return server;
}

// Main function
const main = () => {
  console.log('Starting AlumniConnect Token Test Tool...');
  const htmlFilePath = createTestHtml();
  console.log('Created token test page:', htmlFilePath);
  const server = startServer(htmlFilePath);
  
  // Listen for CTRL+C to close server
  process.on('SIGINT', () => {
    console.log('Shutting down token test server...');
    server.close(() => {
      console.log('Token test server closed.');
      process.exit(0);
    });
  });
}

// Run the tool
main(); 