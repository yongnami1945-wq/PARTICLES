import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and suppress external third-party extension noise (such as MetaMask provider injection errors in sandboxed iframes)
if (typeof window !== 'undefined') {
  const isExtensionNoise = (err: unknown, filename?: unknown): boolean => {
    const s = `${String(err || '')} ${String(filename || '')}`.toLowerCase();
    return (
      s.includes('metamask') ||
      s.includes('failed to connect to metamask') ||
      s.includes('chrome-extension://') ||
      s.includes('moz-extension://') ||
      s.includes('ethereum') ||
      s.includes('web3')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = reason ? (reason.message || reason.stack || String(reason)) : '';
    if (isExtensionNoise(msg)) {
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  }, true);

  window.addEventListener('error', (event) => {
    if (isExtensionNoise(event.message, event.filename)) {
      event.preventDefault();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
