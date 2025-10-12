import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker with auto-update
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Notify user or force reload when a new SW is available
    if (registration && registration.waiting) {
      console.log("New version available, reloading...");
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});
