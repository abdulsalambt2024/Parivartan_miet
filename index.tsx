
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This is the main entry point for the application.
// It finds the root DOM element and renders the App component into it.

const rootElement = document.getElementById('app');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element with id "app"');
}
