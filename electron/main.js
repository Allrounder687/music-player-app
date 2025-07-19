const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const isDev = !app.isPackaged;
const { registerAudioHandlers } = require("./audioHandler");

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;

// Create the browser window
function createWindow() {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  const iconPath = isDev
    ? path.join(__dirname, "../assets/icon.png")
    : path.join(process.resourcesPath, "assets/icon.png");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#111827",
    show: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: false, // Disable sandbox to fix renderer issues
      preload: path.join(__dirname, "preload.js"),
      // Disable GPU acceleration in the renderer
      disableBlinkFeatures: "Accelerated2dCanvas,AcceleratedSmoothing",
      offscreen: false,
    },
    // Disable frame for custom window controls
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#111827",
      symbolColor: "#f3f4f6",
      height: 32,
    },
    frame: false,
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window when ready to prevent flickering
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window closed event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle renderer process crashes
  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.error("Renderer process gone:", details);
    if (details.reason !== "clean-exit") {
      // Restart the app if the renderer crashes
      if (mainWindow) {
        mainWindow.reload();
      }
    }
  });

  // Handle renderer process errors
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Failed to load:", errorCode, errorDescription);
    }
  );

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Handle window controls
  ipcMain.on("app:minimize", () => {
    mainWindow.minimize();
  });

  ipcMain.on("app:maximize", () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on("app:close", () => {
    mainWindow.close();
  });

  // Update maximize button state when window state changes
  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window:maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window:unmaximized");
  });
}

// Disable hardware acceleration to fix GPU process crashes
app.disableHardwareAcceleration();

// Disable GPU process to prevent crashes
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("disable-gpu-rasterization");

// Handle GPU process crashes
app.on("gpu-process-crashed", (event, killed) => {
  console.error("GPU process crashed", { killed });
});

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Register audio handlers
  registerAudioHandlers();

  // Register global shortcuts
  if (isDev) {
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
    } = require("electron-devtools-installer");
    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log("An error occurred: ", err));
  }
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, re-create a window when the dock icon is clicked and no other windows are open
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle("app:version", () => {
  return app.getVersion();
});

// File system operations
ipcMain.handle("fs:readDir", async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files
      .filter(
        (dirent) =>
          dirent.isFile() &&
          [".mp3", ".wav", ".ogg", ".m4a", ".flac"].includes(
            path.extname(dirent.name).toLowerCase()
          )
      )
      .map((dirent) => ({
        name: dirent.name,
        path: path.join(dirPath, dirent.name),
        ext: path.extname(dirent.name).toLowerCase(),
      }));
  } catch (error) {
    console.error("Error reading directory:", error);
    throw error;
  }
});

// Open file dialog
ipcMain.handle("fs:openDialog", async (event, options) => {
  console.log("fs:openDialog handler called with options:", options);
  try {
    console.log("Showing open dialog...");
    const dialogOptions = {
      properties: ["openFile", "multiSelections"],
      filters: [
        {
          name: "Audio Files",
          extensions: ["mp3", "wav", "ogg", "m4a", "flac"],
        },
        { name: "All Files", extensions: ["*"] },
      ],
      ...options,
    };
    console.log("Dialog options:", dialogOptions);

    const result = await dialog.showOpenDialog(mainWindow, dialogOptions);
    const { canceled, filePaths } = result;
    console.log("Dialog result:", {
      canceled,
      fileCount: filePaths?.length || 0,
    });

    if (canceled || filePaths.length === 0) {
      return { canceled: true, files: [] };
    }

    // Get file information for each selected file
    const files = await Promise.all(
      filePaths.map(async (filePath) => {
        const stats = await fs.stat(filePath);
        return {
          name: path.basename(filePath),
          path: filePath,
          ext: path.extname(filePath).toLowerCase(),
          size: stats.size,
          lastModified: stats.mtime,
        };
      })
    );

    console.log("Processed files:", files.length);
    return { canceled: false, files };
  } catch (error) {
    console.error("Error opening file dialog:", error);
    console.error(error.stack);
    return { canceled: true, error: error.message, files: [] };
  }
});
