const https = require("https");
const fs = require("fs");
const path = require("path");

// Create the audio directory if it doesn't exist
const audioDir = path.join(__dirname, "../public/audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Sample MP3 URLs (these are public domain audio files)
const sampleFiles = [
  {
    url: "https://cdn.freesound.org/previews/328/328857_230356-lq.mp3",
    filename: "sample1.mp3",
    name: "Piano Loop",
  },
  {
    url: "https://cdn.freesound.org/previews/415/415209_7866907-lq.mp3",
    filename: "sample2.mp3",
    name: "Guitar Melody",
  },
  {
    url: "https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3",
    filename: "sample3.mp3",
    name: "Drum Beat",
  },
];

// Download a file from a URL
function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(audioDir, filename);
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded ${filename}`);
          resolve(filePath);
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        reject(err);
      });
  });
}

// Download all sample files
async function downloadSampleFiles() {
  console.log("Downloading sample audio files...");

  try {
    const promises = sampleFiles.map((file) =>
      downloadFile(file.url, file.filename)
    );
    await Promise.all(promises);
    console.log("All sample files downloaded successfully!");

    // Update the README.md file
    updateReadme();
  } catch (error) {
    console.error("Error downloading sample files:", error);
  }
}

// Update the README.md file
function updateReadme() {
  const readmePath = path.join(audioDir, "README.md");
  const readmeContent = `# Sample Audio Files

This directory contains sample audio files for testing the music player.

## Included Files

${sampleFiles.map((file) => `- ${file.filename}: ${file.name}`).join("\n")}

## Audio Format Support

The player supports the following audio formats:

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- M4A (.m4a)
- FLAC (.flac)

## Adding Your Own Audio Files

Simply place your audio files in this directory, and they will be available for playback in the music player.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log("Updated README.md file");
}

// Run the download
downloadSampleFiles();
