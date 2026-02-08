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

// Auto-update service worker
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      // Send message to the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      
      // Reload once the new service worker has taken control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  },
});
