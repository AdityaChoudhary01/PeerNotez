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

/**
 * Service Worker Registration with Auto-Update Logic
 * * When a new version of the site is deployed:
 * 1. The browser finds a new service worker.
 * 2. It stays in the 'waiting' state until all tabs are closed.
 * 3. postMessage({ type: 'SKIP_WAITING' }) tells it to take over immediately.
 * 4. window.location.reload() ensures the user sees the new version instantly.
 */
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      // Send message to the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      
      // Listen for the 'controllerchange' event to reload the page 
      // once the new service worker has taken control.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  },
});
