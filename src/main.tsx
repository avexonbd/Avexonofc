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
      console.warn(`[Safe Storage] ${storageType} is blocked or throws an error. Installing sandboxed in-memory mock.`, err);
      
      const inMemoryStore: Record<string, string> = {};
      const mockStorage = {
        getItem: (key: string) => (key in inMemoryStore ? inMemoryStore[key] : null),
        setItem: (key: string, val: string) => { inMemoryStore[key] = String(val); },
        removeItem: (key: string) => { delete inMemoryStore[key]; },
        clear: () => { Object.keys(inMemoryStore).forEach(k => delete inMemoryStore[k]); },
        key: (index: number) => Object.keys(inMemoryStore)[index] || null,
        get length() { return Object.keys(inMemoryStore).length; }
      };

      try {
        Object.defineProperty(window, storageType, {
          value: mockStorage,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (defErr) {
        console.warn(`[Safe Storage] Failed to defineProperty on window.${storageType}. Overriding Storage prototype...`, defErr);
        try {
          const originalGetItem = Storage.prototype.getItem;
          const originalSetItem = Storage.prototype.setItem;
          const originalRemoveItem = Storage.prototype.removeItem;
          const originalClear = Storage.prototype.clear;

          Storage.prototype.getItem = function (key: string) {
            try {
              return originalGetItem.call(this, key);
            } catch (e) {
              return key in inMemoryStore ? inMemoryStore[key] : null;
            }
          };
          Storage.prototype.setItem = function (key: string, value: string) {
            try {
              originalSetItem.call(this, key, value);
            } catch (e) {
              inMemoryStore[key] = String(value);
            }
          };
          Storage.prototype.removeItem = function (key: string) {
            try {
              originalRemoveItem.call(this, key);
            } catch (e) {
              delete inMemoryStore[key];
            }
          };
          Storage.prototype.clear = function () {
            try {
              originalClear.call(this);
            } catch (e) {
              Object.keys(inMemoryStore).forEach(k => delete inMemoryStore[k]);
            }
          };
        } catch (protoErr) {
          console.error(`[Safe Storage] Critical failure patching Storage prototype for ${storageType}:`, protoErr);
        }
      }
    }
  };

  setupInMemoryStorage("localStorage");
  setupInMemoryStorage("sessionStorage");


  // 2. Global API Fetch Interceptor
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
    // Call standard fetch explicitly with window context to avoid raw 'illegal invocation' browser errors
    return originalFetch.call(window, input, init);
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

