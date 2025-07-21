import "./errorLogger"; // Add error logger first
import React from "react";
import ReactDOM from "react-dom/client";

const TestApp = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working correctly!</p>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
