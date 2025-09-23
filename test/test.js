const { spawn } = require('child_process');
const http = require('http');

const port = process.env.PORT || 3000;

// Start the app.js server
const appProcess = spawn('node', ['app.js'], {
  env: { ...process.env, PORT: port }
});

// Give server 2 seconds to start
setTimeout(() => {
  http.get(`http://127.0.0.1:${port}/`, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (data.includes('Hello from Jenkins pipeline!')) {
        console.log('✅ Test passed');
        cleanup(0);
      } else {
        console.error('❌ Test failed: unexpected response:', data);
        cleanup(1);
      }
    });
  }).on('error', err => {
    console.error('❌ Test failed:', err.message);
    cleanup(1);
  });
}, 2000);

// Cleanup (stop server + exit)
function cleanup(code) {
  appProcess.kill();
  process.exit(code);
}
