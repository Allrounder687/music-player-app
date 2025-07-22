const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const isDev = !app.isPackaged;
const { registerAudioHandlers } = require("./audioHandler");
const { registerYtDlpHandlers } = require("./ytDlpHandler");
const { registerSaavnHandlers } = require("./saavnHandler");

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
    // Get port from environment variable or use default
    // Vite might use a different port if 3001 is in use
    const port = 3002; // Use port 3002 directly since that's what Vite is using
    console.log(`Loading app from http://localhost:${port}`);
    mainWindow.loadURL(`http://localhost:${port}`);
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
  console.log("Registering audio handlers...");
  registerAudioHandlers();
  console.log("Audio handlers registered successfully");

  // Register yt-dlp handlers
  console.log("Registering yt-dlp handlers...");
  try {
    registerYtDlpHandlers();
    console.log("yt-dlp handlers registered successfully");

    // Manually register the handlers if they're not being registered properly
    if (!ipcMain.eventNames().includes('ytdlp:getStreamUrl')) {
      console.log("Manually registering yt-dlp handlers...");
      const { getStreamUrl, getVideoInfo, getFormats, downloadVideo, extractAudio, ensureYtDlp } = require('./ytDlpHandler');

      ipcMain.handle('ytdlp:ensure', async () => {
        try {
          const path = await ensureYtDlp();
          return { success: true, path };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      ipcMain.handle('ytdlp:getVideoInfo', async (event, url) => {
        try {
          const info = await getVideoInfo(url);
          return { success: true, info };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      ipcMain.handle('ytdlp:getFormats', async (event, url) => {
        try {
          const formats = await getFormats(url);
          return { success: true, formats };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      ipcMain.handle('ytdlp:downloadVideo', async (event, url, outputDir, format) => {
        try {
          const filePath = await downloadVideo(url, outputDir, format);
          return { success: true, filePath };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      ipcMain.handle('ytdlp:extractAudio', async (event, url, outputDir, format, quality) => {
        try {
          const filePath = await extractAudio(url, outputDir, format, quality);
          return { success: true, filePath };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      ipcMain.handle('ytdlp:getStreamUrl', async (event, url, format) => {
        try {
          const streamUrl = await getStreamUrl(url, format);
          return { success: true, streamUrl };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });

      console.log("Manual registration complete");
    }
  } catch (error) {
    console.error("Error registering yt-dlp handlers:", error);
  }

  // Register JioSaavn handlers
  console.log("Registering JioSaavn handlers...");
  try {
    registerSaavnHandlers();
    console.log("JioSaavn handlers registered successfully");

    // List all registered IPC handlers for debugging
    console.log("Registered IPC handlers:", ipcMain.eventNames());
  } catch (error) {
    console.error("Error registering JioSaavn handlers:", error);
  }

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
