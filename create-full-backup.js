const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Creating full project backup...");

// Get current date for backup name
const now = new Date();
const dateString = now.toISOString().replace(/:/g, "-").replace(/\..+/, "");
const backupName = `music-player-full-backup-${dateString}`;
const backupDir = path.join(__dirname, "full-backups", backupName);

// Create backup directory
try {
  fs.mkdirSync(path.join(__dirname, "full-backups"), { recursive: true });
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`Created backup directory: ${backupDir}`);
} catch (error) {
  console.error(`Error creating backup directory: ${error.message}`);
  process.exit(1);
}

// Directories to backup
const dirsToBackup = [
  "src",
  "electron",
  "public",
  "scripts",
  "assets",
  ".kiro",
];

// Files to backup from root directory
const filesToBackup = [
  "package.json",
  "package-lock.json",
  "vite.config.js",
  "index.html",
  "tailwind.config.js",
  "postcss.config.js",
  ".gitignore",
  "README.md",
  "TROUBLESHOOTING_GUIDE.md",
  "ELECTRON_APP_FIXES.md",
  "AUDIO_PLAYER_IMPROVEMENTS.md",
  "SNAKE_SEEKBAR_FIX.md",
  "electron-debug.js",
  "restore-backups.js",
];

// Copy directories
dirsToBackup.forEach((dir) => {
  const sourcePath = path.join(__dirname, dir);
  const destPath = path.join(backupDir, dir);

  try {
    if (fs.existsSync(sourcePath)) {
      console.log(`Backing up directory: ${dir}`);
      copyRecursive(sourcePath, destPath);
    } else {
      console.log(`Directory not found, skipping: ${dir}`);
    }
  } catch (error) {
    console.error(`Error backing up directory ${dir}: ${error.message}`);
  }
});

// Copy individual files
filesToBackup.forEach((file) => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(backupDir, file);

  try {
    if (fs.existsSync(sourcePath)) {
      console.log(`Backing up file: ${file}`);
      fs.copyFileSync(sourcePath, destPath);
    } else {
      console.log(`File not found, skipping: ${file}`);
    }
  } catch (error) {
    console.error(`Error backing up file ${file}: ${error.message}`);
  }
});

// Create a zip archive of the backup
try {
  console.log("Creating zip archive...");

  // Use different commands based on platform
  if (process.platform === "win32") {
    // On Windows, use PowerShell's Compress-Archive
    execSync(
      `powershell -command "Compress-Archive -Path '${backupDir}\\*' -DestinationPath '${backupDir}.zip'"`,
      { stdio: "inherit" }
    );
  } else {
    // On Unix-like systems, use zip
    execSync(`zip -r "${backupDir}.zip" "${backupDir}"`, { stdio: "inherit" });
  }

  console.log(`Zip archive created: ${backupDir}.zip`);
} catch (error) {
  console.error(`Error creating zip archive: ${error.message}`);
}

console.log("\nFull backup completed successfully!");
console.log(`Backup location: ${backupDir}`);
console.log(`Zip archive: ${backupDir}.zip`);

// Helper function to copy directories recursively
function copyRecursive(src, dest) {
  // Create destination directory
  fs.mkdirSync(dest, { recursive: true });

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // Process each entry
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules and .git directories
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyRecursive(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
