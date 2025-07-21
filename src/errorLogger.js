// Add this to the top of your main entry file
console.log("Error logger initialized");

// Override console.error to make errors more visible
const originalError = console.error;
console.error = function (...args) {
  originalError.apply(console, args);

  // Create a more visible error message
  const errorMsg = args
    .map((arg) =>
      typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
    )
    .join(" ");

  console.log(
    "%c CRITICAL ERROR: " + errorMsg,
    "background: red; color: white; font-size: 16px; font-weight: bold; padding: 4px;"
  );
};

// Add global error handler
window.addEventListener("error", (event) => {
  console.log(
    "%c UNHANDLED ERROR: " + event.message,
    "background: red; color: white; font-size: 16px; font-weight: bold; padding: 4px;"
  );
  console.log("File:", event.filename);
  console.log("Line:", event.lineno);
  console.log("Column:", event.colno);
  console.log("Error object:", event.error);
});

// Add unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.log(
    "%c UNHANDLED PROMISE REJECTION: ",
    "background: red; color: white; font-size: 16px; font-weight: bold; padding: 4px;"
  );
  console.log("Reason:", event.reason);
});
