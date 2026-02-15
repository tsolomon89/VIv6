import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClientBridge } from './src/bridge';

// Initialize Editor Bridge
const bridge = new ClientBridge();
// bridge.send('handshake', { status: 'ready' }); // Optional

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);