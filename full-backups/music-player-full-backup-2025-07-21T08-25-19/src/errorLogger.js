// Add this to the top of your main entry file
console.log("Error logger initialized");

// Override console.error to make errors more visible
const originalError = console.error;
console.error = function (...args) {
  originalError.apply(console, args);

  // Create a more visible error message
  let errorMsg;
  try {
    errorMsg = args
      .map((arg) => {
        if (typeof arg === "object") {
          try {
            // Handle circular references by using a custom replacer
            const seen = new WeakSet();
            return JSON.stringify(
              arg,
              (key, value) => {
                if (typeof value === "object" && value !== null) {
                  if (seen.has(value)) {
                    return "[Circular Reference]";
                  }
                  seen.add(value);
                }
                return value;
              },
              2
            );
          } catch (e) {
            return `[Object: ${arg?.constructor?.name || typeof arg}]`;
          }
        } else {
          return String(arg);
        }
      })
      .join(" ");
  } catch (e) {
    errorMsg = "Error formatting error message: " + e.message;
  }

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
