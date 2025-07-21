const { spawn } = require("child_process");
const { findAvailablePort } = require("./find-port");

// Default port to start checking from
const DEFAULT_PORT = 3001;

async function startDev() {
  try {
    // Find an available port
    const port = await findAvailablePort(DEFAULT_PORT);
    console.log(`Starting development server on port ${port}`);

    // Set environment variables
    const env = {
      ...process.env,
      VITE_DEV_SERVER_PORT: port.toString(),
    };

    // Start Vite
    const vite = spawn("npx", ["vite", "--port", port.toString()], {
      env,
      stdio: "inherit",
      shell: true,
    });

    // Start Electron after a delay to ensure Vite is ready
    setTimeout(() => {
      console.log(`Starting Electron pointing to http://localhost:${port}`);
      const electron = spawn("npx", ["electron", "."], {
        env,
        stdio: "inherit",
        shell: true,
      });

      electron.on("close", (code) => {
        console.log(`Electron process exited with code ${code}`);
        vite.kill();
        process.exit(code);
      });
    }, 2000);

    // Handle process termination
    process.on("SIGINT", () => {
      vite.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start development server:", error);
    process.exit(1);
  }
}

startDev();
