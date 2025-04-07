const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk') || { 
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

// Check if nodemailer is installed
exec('cd backend && npm list nodemailer', (error, stdout, stderr) => {
  if (stdout.includes('(empty)') || stdout.includes('npm ERR!')) {
    console.log(chalk.yellow('Installing nodemailer package for email functionality...'));
    exec('cd backend && npm install nodemailer', (err, out, stdErr) => {
      if (err) {
        console.error(chalk.red('Error installing nodemailer:'), stdErr);
      } else {
        console.log(chalk.green('Nodemailer installed successfully!'));
        checkAxios();
      }
    });
  } else {
    console.log(chalk.green('Nodemailer is already installed.'));
    checkAxios();
  }
});

function checkAxios() {
  exec('npm list axios', (error, stdout, stderr) => {
    if (stdout.includes('(empty)') || stdout.includes('npm ERR!')) {
      console.log(chalk.yellow('Installing axios package for API communication...'));
      exec('npm install axios', (err, out, stdErr) => {
        if (err) {
          console.error(chalk.red('Error installing axios:'), stdErr);
        } else {
          console.log(chalk.green('Axios installed successfully!'));
        }
        startServers();
      });
    } else {
      console.log(chalk.green('Axios is already installed.'));
      startServers();
    }
  });
}

function startServers() {
  console.log(chalk.bold('\n=== Starting AlumniConnect Application ===\n'));
  
  // Check backend MongoDB configuration
  const envPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    console.log(chalk.green('✓ Backend .env file found'));
  } else {
    console.log(chalk.red('✗ Backend .env file not found. MongoDB connection may fail.'));
  }

  // Start Backend Server
  console.log(chalk.blue('\nStarting backend server...'));
  const backendServer = spawn('npm', ['run', 'server'], { 
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
    shell: true 
  });

  backendServer.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(chalk.blue('[Backend] ') + output);
    
    // When backend server is running, start frontend
    if (output.includes('Server running on port') || output.includes('MongoDB Connected')) {
      startFrontend();
    }
  });

  backendServer.stderr.on('data', (data) => {
    console.error(chalk.red('[Backend Error] ') + data.toString());
  });

  backendServer.on('error', (error) => {
    console.error(chalk.red('Failed to start backend server:'), error);
  });

  // Give the backend 10 seconds to start before starting frontend anyway
  const timeoutId = setTimeout(() => {
    console.log(chalk.yellow('\nBackend startup taking longer than expected. Starting frontend anyway...'));
    startFrontend();
  }, 10000);

  function startFrontend() {
    // Clear the timeout to prevent multiple frontend starts
    clearTimeout(timeoutId);
    
    // Start Frontend Dev Server
    console.log(chalk.green('\nStarting frontend development server...'));
    const frontendServer = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      shell: true 
    });

    frontendServer.on('error', (error) => {
      console.error(chalk.red('Failed to start frontend server:'), error);
    });

    console.log(chalk.bold('\n=== AlumniConnect Application Starting ===\n'));
    console.log(chalk.green('To access the application, open your browser to:'));
    console.log(chalk.bold('http://localhost:5173'));
    console.log(chalk.yellow('\nPress Ctrl+C to stop all servers\n'));
  }
}

process.on('SIGINT', () => {
  console.log(chalk.yellow('\nShutting down servers...'));
  process.exit();
}); 