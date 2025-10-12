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

// Auto-update SW: reload page when new version is available
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      // Skip waiting and reload to get latest assets
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});
