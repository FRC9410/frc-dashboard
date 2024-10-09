const express = require('express');
const WebSocket = require('ws');
const NTClient = require('wpilib-nt-client');

// Create the Express app
const app = express();

// Serve static files from React app (after you build it)
app.use(express.static('build'));

// Start NetworkTables client
let ntClient = new NTClient.Client();

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store the latest values in a map
let latestValues = {};

connectToIp('127.0.0.1')

// Handle client connections and requests
wss.on('connection', (ws) => {
  // When a client connects, send them the current state of all keys
  ws.on('message', (message) => {
    const request = JSON.parse(message);

    // Handle data requests from the client
    if (request.type === 'getCurrentValues') {
      Object.entries(latestValues).forEach(([key, value]) => {
        ws.send(JSON.stringify({ key, value }));
      });
    }

    // Handle write requests to NetworkTables
    if (request.type === 'setValue') {
      const { key, value } = request;
      console.log(ntClient);
      console.log(`Setting NetworkTables key: ${key}, value: ${value}`);
      ntClient.Update(ntClient.getKeyID(key), value);

      // Optionally, immediately broadcast this change to all clients
      broadcastToClients({ key, value });
    }

    // Handle IP address change requests from the client
    if (request.type === 'setIpAddress') {
      const { ipAddress } = request;
      disconnectFromIp();
      console.log(`Connecting to new IP address: ${ipAddress}`);
      connectToIp(ipAddress);
    }
  });
});

function connectToIp(ipAddress) {
  ntClient = new NTClient.Client();
  ntClient.start((isConnected, err) => {
    if (err) {
      console.error('NetworkTables connection error:', err);
    } else {
      console.log('NetworkTables connected:', isConnected);
    }
  }, ipAddress);

  ntClient.addListener((key, value, type, id) => {
    latestValues[key] = value;
    broadcastToClients({ key, value });
  });
}

function disconnectFromIp() {
  ntClient.stop();
  ntClient.destroy();
}

// Broadcast function to send data to all WebSocket clients
function broadcastToClients(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Serve the React app's index.html file on all routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'build' });
});

// Start the Express server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
