const { contextBridge, ipcRenderer } = require("electron");

// Whitelist of valid channels for IPC communication
const validChannels = {
  // Renderer to Main
  toMain: [
    "app:version",
    "app:minimize",
    "app:maximize",
    "app:close",
    "read-dir",
    "fs:readDir",
    "fs:openDialog",
    "audio:readFile",
    "audio:getMetadata",
    "ytdlp:ensure",
    "ytdlp:getVideoInfo",
    "ytdlp:getFormats",
    "ytdlp:downloadVideo",
    "ytdlp:extractAudio",
    "ytdlp:getStreamUrl",
  ],
  // Main to Renderer
  fromMain: ["app:version-reply", "window:maximized", "window:unmaximized"],
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electron", {
  // Send a message to the main process
  send: (channel, data) => {
    if (validChannels.toMain.includes(channel)) {
      ipcRenderer.send(channel, data);
    } else {
      console.warn(`Attempted to send on invalid channel: ${channel}`);
    }
  },

  // Receive a message from the main process
  receive: (channel, func) => {
    if (validChannels.fromMain.includes(channel)) {
      // Strip event as it includes `sender`
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      // Return cleanup function
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    console.warn(`Attempted to receive on invalid channel: ${channel}`);
    return undefined;
  },

  // Invoke a method in the main process and wait for the result
  invoke: async (channel, data) => {
    if (validChannels.toMain.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }
    console.warn(`Attempted to invoke on invalid channel: ${channel}`);
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },

  // Window control methods
  window: {
    minimize: () => ipcRenderer.send("app:minimize"),
    maximize: () => ipcRenderer.send("app:maximize"),
    close: () => ipcRenderer.send("app:close"),
  },

  // File system methods
  fs: {
    readDir: async (dirPath) => {
      return await ipcRenderer.invoke("fs:readDir", dirPath);
    },
    openDialog: async (options) => {
      return await ipcRenderer.invoke("fs:openDialog", options);
    },
  },

  // Audio methods
  audio: {
    readFile: async (filePath) => {
      return await ipcRenderer.invoke("audio:readFile", filePath);
    },
    getMetadata: async (filePath) => {
      return await ipcRenderer.invoke("audio:getMetadata", filePath);
    },
  },

  // yt-dlp methods
  ytdlp: {
    ensure: async () => {
      return await ipcRenderer.invoke("ytdlp:ensure");
    },
    getVideoInfo: async (url) => {
      return await ipcRenderer.invoke("ytdlp:getVideoInfo", url);
    },
    getFormats: async (url) => {
      return await ipcRenderer.invoke("ytdlp:getFormats", url);
    },
    downloadVideo: async (url, outputDir, format) => {
      return await ipcRenderer.invoke("ytdlp:downloadVideo", url, outputDir, format);
    },
    extractAudio: async (url, outputDir, format, quality) => {
      return await ipcRenderer.invoke("ytdlp:extractAudio", url, outputDir, format, quality);
    },
    getStreamUrl: async (url, format) => {
      return await ipcRenderer.invoke("ytdlp:getStreamUrl", url, format);
    },
  },
});

// Handle window controls in the renderer process
window.addEventListener("DOMContentLoaded", () => {
  const minimizeBtn = document.getElementById("minimize-btn");
  const maximizeBtn = document.getElementById("maximize-btn");
  const closeBtn = document.getElementById("close-btn");

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      window.electron.window.minimize();
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      window.electron.window.maximize();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      window.electron.window.close();
    });
  }
});
