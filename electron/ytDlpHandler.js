const { ipcMain, app } = require('electron');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

// Paths for yt-dlp binary
const appDataPath = app.getPath('userData');
const ytDlpDir = path.join(appDataPath, 'bin');
const platform = process.platform;
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

// Binary names based on platform
const ytDlpBinaryName = isWindows ? 'yt-dlp.exe' : 'yt-dlp';
const ytDlpPath = path.join(ytDlpDir, ytDlpBinaryName);

// Download URLs for yt-dlp binaries
const ytDlpUrls = {
    win32: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
    darwin: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos',
    linux: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'
};

/**
 * Check if yt-dlp is installed and download it if not
 * @returns {Promise<string>} Path to yt-dlp binary
 */
async function ensureYtDlp() {
    // First check if yt-dlp is in PATH
    try {
        if (isWindows) {
            execSync('where yt-dlp', { stdio: 'ignore' });
            return 'yt-dlp';
        } else {
            execSync('which yt-dlp', { stdio: 'ignore' });
            return 'yt-dlp';
        }
    } catch (error) {
        console.log('yt-dlp not found in PATH, checking app directory...');
    }

    // Check if yt-dlp is already downloaded in app directory
    try {
        if (fs.existsSync(ytDlpPath)) {
            // Make sure it's executable on Unix systems
            if (!isWindows) {
                fs.chmodSync(ytDlpPath, 0o755);
            }
            return ytDlpPath;
        }
    } catch (error) {
        console.error('Error checking for yt-dlp binary:', error);
    }

    // Download yt-dlp
    console.log('Downloading yt-dlp...');
    try {
        // Create directory if it doesn't exist
        if (!fs.existsSync(ytDlpDir)) {
            fs.mkdirSync(ytDlpDir, { recursive: true });
        }

        // Get download URL for current platform
        const downloadUrl = ytDlpUrls[platform];
        if (!downloadUrl) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Download the binary
        await downloadFile(downloadUrl, ytDlpPath);

        // Make executable on Unix systems
        if (!isWindows) {
            fs.chmodSync(ytDlpPath, 0o755);
        }

        console.log('yt-dlp downloaded successfully');
        return ytDlpPath;
    } catch (error) {
        console.error('Error downloading yt-dlp:', error);
        throw error;
    }
}

/**
 * Download a file from a URL
 * @param {string} url URL to download from
 * @param {string} dest Destination file path
 * @returns {Promise<void>}
 */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { }); // Delete the file on error
            reject(err);
        });
    });
}

/**
 * Execute a yt-dlp command
 * @param {string[]} args Command arguments
 * @param {Object} options Spawn options
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeYtDlp(args, options = {}) {
    const ytDlpBinary = await ensureYtDlp();

    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        const process = spawn(ytDlpBinary, args, options);

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
            }
        });

        process.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Get video information
 * @param {string} url Video URL
 * @returns {Promise<Object>} Video information
 */
async function getVideoInfo(url) {
    try {
        const { stdout } = await executeYtDlp([
            url,
            '--dump-json',
            '--no-playlist'
        ]);

        return JSON.parse(stdout);
    } catch (error) {
        console.error('Error getting video info:', error);
        throw error;
    }
}

/**
 * Get available formats for a video
 * @param {string} url Video URL
 * @returns {Promise<Array>} Available formats
 */
async function getFormats(url) {
    try {
        const { stdout } = await executeYtDlp([
            url,
            '-F',
            '--no-playlist'
        ]);

        // Parse the format output
        const formats = [];
        const lines = stdout.split('\n');

        for (const line of lines) {
            // Skip header lines and empty lines
            if (!line.trim() || line.includes('format code') || line.includes('---')) {
                continue;
            }

            // Parse format line
            const match = line.match(/^(\S+)\s+(\S+)\s+(.+?)(?:\s+(\d+)k)?$/);
            if (match) {
                formats.push({
                    formatCode: match[1],
                    extension: match[2],
                    description: match[3].trim(),
                    bitrate: match[4] ? parseInt(match[4]) : null
                });
            }
        }

        return formats;
    } catch (error) {
        console.error('Error getting formats:', error);
        throw error;
    }
}

/**
 * Download a video
 * @param {string} url Video URL
 * @param {string} outputDir Output directory
 * @param {string} format Format code (optional)
 * @returns {Promise<string>} Path to downloaded file
 */
async function downloadVideo(url, outputDir, format = null) {
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Build arguments
        const args = [
            url,
            '--no-playlist',
            '-o', path.join(outputDir, '%(title)s.%(ext)s')
        ];

        // Add format if specified
        if (format) {
            args.push('-f', format);
        }

        // Execute download
        const { stdout } = await executeYtDlp(args);

        // Extract the output filename from stdout
        const match = stdout.match(/\[download\] Destination: (.+)/);
        if (match) {
            return match[1];
        }

        // If we can't find the filename in stdout, return the output directory
        return outputDir;
    } catch (error) {
        console.error('Error downloading video:', error);
        throw error;
    }
}

/**
 * Extract audio from a video
 * @param {string} url Video URL
 * @param {string} outputDir Output directory
 * @param {string} format Audio format (mp3, m4a, etc.)
 * @param {string} quality Audio quality (0-9 for VBR, 128K, etc.)
 * @returns {Promise<string>} Path to extracted audio file
 */
async function extractAudio(url, outputDir, format = 'mp3', quality = '192') {
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Build arguments
        const args = [
            url,
            '--no-playlist',
            '-x',
            '--audio-format', format,
            '--audio-quality', quality,
            '-o', path.join(outputDir, '%(title)s.%(ext)s')
        ];

        // Execute extraction
        const { stdout } = await executeYtDlp(args);

        // Extract the output filename from stdout
        const match = stdout.match(/\[download\] Destination: (.+)/);
        if (match) {
            return match[1];
        }

        // If we can't find the filename in stdout, return the output directory
        return outputDir;
    } catch (error) {
        console.error('Error extracting audio:', error);
        throw error;
    }
}

/**
 * Get a direct stream URL for a video
 * @param {string} url Video URL
 * @param {string} format Format code (optional)
 * @returns {Promise<string>} Direct stream URL
 */
async function getStreamUrl(url, format = null) {
    try {
        // Build arguments
        const args = [
            url,
            '--no-playlist',
            '--get-url'
        ];

        // Add format if specified
        if (format) {
            args.push('-f', format);
        } else {
            // Default to best audio
            args.push('-f', 'bestaudio');
        }

        // Execute command
        const { stdout } = await executeYtDlp(args);

        // Return the stream URL
        return stdout.trim();
    } catch (error) {
        console.error('Error getting stream URL:', error);
        throw error;
    }
}

/**
 * Register yt-dlp IPC handlers
 */
function registerYtDlpHandlers() {
    // Ensure yt-dlp is installed
    ipcMain.handle('ytdlp:ensure', async () => {
        try {
            const path = await ensureYtDlp();
            return { success: true, path };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get video info
    ipcMain.handle('ytdlp:getVideoInfo', async (event, url) => {
        try {
            const info = await getVideoInfo(url);
            return { success: true, info };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get available formats
    ipcMain.handle('ytdlp:getFormats', async (event, url) => {
        try {
            const formats = await getFormats(url);
            return { success: true, formats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Download video
    ipcMain.handle('ytdlp:downloadVideo', async (event, url, outputDir, format) => {
        try {
            const filePath = await downloadVideo(url, outputDir, format);
            return { success: true, filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Extract audio
    ipcMain.handle('ytdlp:extractAudio', async (event, url, outputDir, format, quality) => {
        try {
            const filePath = await extractAudio(url, outputDir, format, quality);
            return { success: true, filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Get stream URL
    ipcMain.handle('ytdlp:getStreamUrl', async (event, url, format) => {
        try {
            const streamUrl = await getStreamUrl(url, format);
            return { success: true, streamUrl };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}

module.exports = {
    registerYtDlpHandlers,
    ensureYtDlp,
    getVideoInfo,
    getFormats,
    downloadVideo,
    extractAudio,
    getStreamUrl
};