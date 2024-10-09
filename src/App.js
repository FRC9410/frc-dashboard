import React, { useState, useEffect } from 'react';
import TreeView from './components/display/TreeView';

function App() {
  const [connected, setConnected] = useState(false);
  const [robotData, setRobotData] = useState({});
  const [ipAddress, setIpAddress] = useState('127.0.0.1');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Connected to backend WebSocket');
      setConnected(true);

      // Request the current values from the server
      ws.send(JSON.stringify({ type: 'getCurrentValues' }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
    
      const { key, value } = message;
    
      setRobotData((prevData) => {
        const keyParts = key.split('/').filter(Boolean);
        const newData = keyParts.reduceRight((acc, part) => ({ [part]: acc }), value);
    
        return mergeDeep(prevData, newData);
      });
    };

    const mergeDeep = (target, source) => {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
          Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
      }
      return { ...target, ...source };
    };

    ws.onclose = () => {
      console.log('Disconnected from backend WebSocket');
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const updateNetworkTable = (key, value) => {
    // Send a message to update the NetworkTables key
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'setValue',
        key: key,
        value: value,
      }));
    };
  };

  // Function to send the selected IP to the backend
  const connectToIp = (ipAddress) => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onopen = () => {
      // Send the IP address to the backend
      ws.send(JSON.stringify({
        type: 'setIpAddress',
        ipAddress: ipAddress
      }));
    };
  };

  return (
    <div className="App">
      <h1>NetworkTables Dashboard</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>

      <div>
          <div className="App">
            <TreeView data={robotData} />
          </div>
      </div>

      {/* Input to send new value to NetworkTables */}
      <div>
        <button onClick={() => updateNetworkTable('/Dashboard/Development Mode', !robotData.Dashboard['Development Mode'])}>Toggle Dev Mode</button>
      </div>

      {/* Input for the user to enter the robot's IP */}
      <div>
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          placeholder="Enter Robot IP"
        />
        <button onClick={() => connectToIp(ipAddress)}>Connect to Robot IP</button>
      </div>
      <div>
        <button onClick={() => connectToIp('127.0.0.1')}>Connect to Sim IP</button>
      </div>
    </div>
  );
}

export default App;
