import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ContentProvider } from "./context/ContentContext.tsx";

// Global API Fetch Interceptor to resolve relative paths to absolute URLs.
// This prevents "DOMException: The string did not match the expected pattern" inside sandboxed browser iframes (e.g. Safari / WebKit and custom platforms).
if (typeof window !== "undefined") {
  // 1. Sandboxed Storage Guard to prevent Safari / WebKit iframe security issues from throwing
  // "DOMException: The string did not match the expected pattern" or "SecurityError: The operation is insecure" on localStorage/sessionStorage
  const setupInMemoryStorage = (storageType: "localStorage" | "sessionStorage") => {
    try {
      const storage = window[storageType];
      if (storage) {
        const testKey = "__avexon_sandbox_test__";
        storage.setItem(testKey, "1");
        storage.removeItem(testKey);
      } else {
        throw new Error("Storage is undefined or blocked");
      }
    } catch (err) {
      console.warn(`[Safe Storage] ${storageType} is blocked or throws an error. Using sandboxed in-memory mock seamlessly via safeLocalStorage/safeSessionStorage wrappers.`, err);
    }
  };

  setupInMemoryStorage("localStorage");
  setupInMemoryStorage("sessionStorage");


  // 2. Global API Fetch Interceptor
  try {
    const originalFetch = window.fetch;
    if (originalFetch) {
      const customFetch = function (input: RequestInfo | URL, init?: RequestInit) {
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
        // Call standard fetch explicitly with window context to avoid raw 'illegal invocation' browser errors
        return originalFetch.call(window, input, init);
      };

      try {
        window.fetch = customFetch;
      } catch (assignErr) {
        console.warn("[Safe Fetch] Standard window.fetch assignment failed. Attempting Object.defineProperty...", assignErr);
        try {
          Object.defineProperty(window, "fetch", {
            value: customFetch,
            configurable: true,
            writable: true,
            enumerable: true
          });
        } catch (defErr) {
          console.error("[Safe Fetch] Critical failure: window.fetch is completely read-only or unconfigurable.", defErr);
        }
      }
    }
  } catch (globalFetchError) {
    console.error("[Safe Fetch] Unexpected error setting up window.fetch interceptor:", globalFetchError);
  }
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

