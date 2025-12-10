const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Starting backup restoration process...");

// Define backup files and their destinations
const backupFiles = [
  {
    backup: "backups/SnakeSeekbar.jsx.backup",
    destination: "src/components/SnakeSeekbar.jsx",
  },
  {
    backup: "backups/AudioPlayer.jsx.backup",
    destination: "src/components/AudioPlayer.jsx",
  },
  {
    backup: "backups/MusicContext.jsx.backup",
    destination: "src/store/MusicContext.jsx",
  },
  { backup: "backups/main.js.backup", destination: "electron/main.js" },
  { backup: "backups/vite.config.js.backup", destination: "vite.config.js" },
  { backup: "backups/package.json.backup", destination: "package.json" },
  { backup: "backups/index.html.backup", destination: "index.html" },
];

// Restore each file
backupFiles.forEach(({ backup, destination }) => {
  const backupPath = path.join(__dirname, backup);
  const destPath = path.join(__dirname, destination);

  try {
    // Check if backup file exists
    if (fs.existsSync(backupPath)) {
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Copy backup to destination
      fs.copyFileSync(backupPath, destPath);
      console.log(`✅ Restored ${backup} to ${destination}`);
    } else {
      console.error(`❌ Backup file not found: ${backup}`);
    }
  } catch (error) {
    console.error(`❌ Error restoring ${backup}: ${error.message}`);
  }
});

console.log("Backup restoration complete!");
console.log("Running npm install to ensure dependencies are up to date...");

try {
  execSync("npm install", { stdio: "inherit" });
  console.log("npm install completed successfully.");
} catch (error) {
  console.error("Error running npm install:", error.message);
}

console.log("\nAll done! You can now start the app with:");
console.log("npm run debug");
