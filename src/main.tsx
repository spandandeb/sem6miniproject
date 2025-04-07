import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("main.tsx is executing");

// Error boundary for debugging rendering issues
const renderApp = () => {
  try {
    console.log("Attempting to render the app");
    
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering the application:", error);
    
    // Display a fallback UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #e53e3e;">Application Error</h1>
          <p>There was an error loading the application.</p>
          <pre style="background: #f7fafc; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    }
  }
};

renderApp();
