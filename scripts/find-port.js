const net = require("net");

/**
 * Find an available port starting from the given port
 * @param {number} startPort - Port to start checking from
 * @param {number} endPort - Maximum port to check
 * @returns {Promise<number>} - First available port
 */
function findAvailablePort(startPort, endPort = startPort + 10) {
  return new Promise((resolve, reject) => {
    function tryPort(port) {
      if (port > endPort) {
        reject(
          new Error(
            `No available ports found between ${startPort} and ${endPort}`
          )
        );
        return;
      }

      const server = net.createServer();

      server.once("error", (err) => {
        if (err.code === "EADDRINUSE") {
          // Port is in use, try the next one
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });

      server.once("listening", () => {
        // Found an available port
        server.close(() => {
          resolve(port);
        });
      });

      server.listen(port);
    }

    tryPort(startPort);
  });
}

// If this script is run directly
if (require.main === module) {
  const defaultPort = process.env.PORT || 3001;

  findAvailablePort(parseInt(defaultPort, 10))
    .then((port) => {
      console.log(`Available port: ${port}`);
      process.stdout.write(`${port}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Error finding available port:", err);
      process.exit(1);
    });
}

module.exports = { findAvailablePort };
