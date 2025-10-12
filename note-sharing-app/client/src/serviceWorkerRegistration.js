const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/
  )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('SW registered:', registration);

          // Listen for updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, call callback
                  if (config && config.onUpdate) {
                    config.onUpdate(registration);
                  }
                }
              };
            }
          };
