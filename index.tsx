// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Import AppWrapper, not App

// Enhanced error handling
window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMsg = "Could not find root element to mount to";
  console.error(errorMsg);
  document.body.innerHTML = `<div style="padding: 20px; color: red;"><h2>Error</h2><p>${errorMsg}</p></div>`;
  throw new Error(errorMsg);
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper /> {/* Render AppWrapper here */}
  </React.StrictMode>
);