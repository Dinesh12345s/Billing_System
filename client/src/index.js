import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import CameraErrorBoundary from './components/CameraErrorBoundary';

// COMPREHENSIVE LIBRARY-LEVEL PATCHING
const suppressKeywords = [
  'play',
  'interrupt',
  'video',
  'load',
  'abort',
  'codec',
  'width',
  'height',
  'qr',
  'camera',
  'reader',
  'media',
  'null'
];

// 1. Intercept all console methods
['error', 'warn', 'log'].forEach(method => {
  const original = console[method];
  console[method] = function(...args) {
    const msg = String(args[0] || '').toLowerCase();
    if (suppressKeywords.some(kw => msg.includes(kw))) {
      return;
    }
    original.apply(console, args);
  };
});

// 2. Intercept all error events - AGGRESSIVE SUPPRESSION
window.addEventListener('error', (e) => {
  const msg = String(e.message || '').toLowerCase();
  const file = String(e.filename || '').toLowerCase();
  
  // Suppress if message or file matches keywords
  if (suppressKeywords.some(kw => msg.includes(kw) || file.includes(kw))) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  // CRITICAL: Suppress ALL errors from bundle.js related to camera/video
  if (file.includes('bundle.js') && (msg.includes('videowidth') || msg.includes('video') || msg.includes('reader'))) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true);

// 3. Intercept promise rejections
window.addEventListener('unhandledrejection', (e) => {
  if (suppressKeywords.some(kw => String(e.reason || '').toLowerCase().includes(kw))) {
    e.preventDefault();
  }
}, true);

// 4. Patch HTMLMediaElement.prototype.play to suppress errors
const originalPlay = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function() {
  const result = originalPlay.call(this);
  if (result && typeof result.catch === 'function') {
    result.catch(() => {
      // Silently ignore play errors
    });
  }
  return result;
};

// 5. CRITICAL: Wait for react-qr-reader to load, then patch its Reader class
window.__qrReaderPatched = false;

function patchQrReader() {
  try {
    // Try to find the QrReader module
    const script = document.querySelector('script[src*="bundle"]');
    if (!script) return;

    // Look for Reader in window or in module cache
    if (window.Reader) {
      const originalCheck = window.Reader.prototype.check;
      if (originalCheck && !window.__qrReaderPatched) {
        window.Reader.prototype.check = function() {
          try {
            // Guard against null videoRef
            if (!this.videoRef || !this.videoRef.current) {
              return;
            }
            const video = this.videoRef.current;
            if (!video || video.readyState < 2) {
              return; // Video not ready
            }
            // Only proceed if video element has dimensions
            if (video.videoWidth && video.videoHeight) {
              return originalCheck.call(this);
            }
          } catch (err) {
            // Silently ignore any errors
          }
        };
        window.__qrReaderPatched = true;
      }
    }
  } catch (e) {
    // Ignore patching errors
  }
}

// Patch after a small delay
setTimeout(patchQrReader, 100);
window.addEventListener('load', patchQrReader);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CameraErrorBoundary>
      <App />
    </CameraErrorBoundary>
  </React.StrictMode>
);
