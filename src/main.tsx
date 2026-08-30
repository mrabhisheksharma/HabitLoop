import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA offline caching & installability
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Benign registration failure in preview sandbox
    });
  });
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
