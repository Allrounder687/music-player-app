const fs = require("fs");
const path = require("path");
const https = require("https");

// Path to sample2.mp3
const sample2Path = path.join(__dirname, "../public/audio/sample2.mp3");

// Alternative URL for sample2.mp3
const alternativeUrl =
  "https://cdn.freesound.org/previews/368/368691_5380137-lq.mp3";

// Download the file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
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
          console.log(`Downloaded ${path.basename(filePath)}`);
          resolve(filePath);
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there was an error
        reject(err);
      });
  });
}

// Check if sample2.mp3 exists and has content
fs.stat(sample2Path, async (err, stats) => {
  if (err || stats.size === 0) {
    console.log("sample2.mp3 is missing or empty, downloading alternative...");
    try {
      await downloadFile(alternativeUrl, sample2Path);
      console.log("Fixed sample2.mp3");
    } catch (error) {
      console.error("Error fixing sample2.mp3:", error);

      // If download fails, copy sample1.mp3 to sample2.mp3
      try {
        const sample1Path = path.join(__dirname, "../public/audio/sample1.mp3");
        fs.copyFileSync(sample1Path, sample2Path);
        console.log("Copied sample1.mp3 to sample2.mp3 as fallback");
      } catch (copyError) {
        console.error("Error copying sample1.mp3:", copyError);
      }
    }
  } else {
    console.log("sample2.mp3 already exists and has content");
  }
});
