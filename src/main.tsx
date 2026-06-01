import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ContentProvider } from "./context/ContentContext.tsx";

// Global API Fetch Interceptor to resolve relative paths to absolute URLs.
// This prevents "DOMException: The string did not match the expected pattern" inside sandboxed browser iframes (e.g. Safari / WebKit and custom platforms).
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === "string" && input.startsWith("/api/")) {
      try {
        const origin = window.location.origin;
        if (origin && origin !== "null" && origin.startsWith("http")) {
          input = origin + input;
        } else {
          const href = window.location.href;
          if (href && href.startsWith("http")) {
            const match = href.match(/^(https?:\/\/[^\/]+)/);
            if (match) {
              input = match[1] + input;
            }
          }
        }
      } catch (e) {
        console.warn("Failed to resolve absolute URL for fetch:", e);
      }
    }
    return originalFetch.call(this, input, init);
  };
}

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("Service Worker registered successfully:", reg);
        
        // Request Notification permission
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            console.log("Notification permission status:", permission);
          });
        }
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider>
      <App />
    </ContentProvider>
  </StrictMode>,
);

