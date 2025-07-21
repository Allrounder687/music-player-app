const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

console.log("Starting Electron debug script...");

// Check if electron is installed
try {
  const electronPath = require("electron");
  console.log("Electron found at:", electronPath);
} catch (err) {
  console.error("Electron not found. Please run: npm install electron");
  process.exit(1);
}

// Check if main.js exists
const mainJsPath = path.join(__dirname, "electron", "main.js");
if (!fs.existsSync(mainJsPath)) {
  console.error(`main.js not found at ${mainJsPath}`);
  process.exit(1);
}
console.log("main.js found at:", mainJsPath);

// Check if preload.js exists
const preloadJsPath = path.join(__dirname, "electron", "preload.js");
if (!fs.existsSync(preloadJsPath)) {
  console.error(`preload.js not found at ${preloadJsPath}`);
  process.exit(1);
}
console.log("preload.js found at:", preloadJsPath);

// Check if index.html exists
const indexHtmlPath = path.join(__dirname, "index.html");
if (!fs.existsSync(indexHtmlPath)) {
  console.error(`index.html not found at ${indexHtmlPath}`);
  process.exit(1);
}
console.log("index.html found at:", indexHtmlPath);

// Check if port 3001 is in use
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use!`);
        resolve(false);
      } else {
        console.error(`Error checking port: ${err.message}`);
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

async function startApp() {
  // Check if port 3001 is available
  const portAvailable = await checkPort(3001);
  if (!portAvailable) {
    console.error(
      "Please close any applications using port 3001 and try again."
    );
    process.exit(1);
  }

  // Start Vite dev server
  console.log("Starting Vite dev server on port 3001...");
  const vite = spawn("npx", ["vite", "--port", "3001", "--strictPort"], {
    stdio: "inherit",
    shell: true,
  });

  // Function to check if Vite server is ready
  function checkViteServer() {
    return new Promise((resolve) => {
      const req = http.get("http://localhost:3001", (res) => {
        if (res.statusCode === 200) {
          console.log("Vite server is ready!");
          resolve(true);
        } else {
          setTimeout(() => checkViteServer().then(resolve), 500);
        }
      });

      req.on("error", () => {
        setTimeout(() => checkViteServer().then(resolve), 500);
      });

      req.end();
    });
  }

  // Wait for Vite server to be ready
  console.log("Waiting for Vite server to start...");
  await checkViteServer();

  // Start Electron with debugging
  console.log("Starting Electron...");
  const electron = spawn("npx", ["electron", ".", "--inspect"], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ELECTRON_ENABLE_LOGGING: 1,
      ELECTRON_ENABLE_STACK_DUMPING: 1,
      NODE_ENV: "development",
    },
  });

  electron.on("close", (code) => {
    console.log(`Electron process exited with code ${code}`);
    vite.kill();
    process.exit(code);
  });

  // Handle process termination
  process.on("SIGINT", () => {
    console.log("Terminating processes...");
    vite.kill();
    process.exit(0);
  });
}

startApp();
