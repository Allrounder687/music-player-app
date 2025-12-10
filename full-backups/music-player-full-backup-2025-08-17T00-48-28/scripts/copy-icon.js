const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');
const iconSvgPath = path.join(assetsDir, 'icon.svg');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Check if SVG icon exists
if (!fs.existsSync(iconSvgPath)) {
  console.error('Error: icon.svg not found in assets directory');
  process.exit(1);
}

// Copy SVG to other required formats
const iconFiles = [
  { src: iconSvgPath, dest: path.join(assetsDir, 'icon.ico') },
  { src: iconSvgPath, dest: path.join(assetsDir, 'icon.icns') },
  { src: iconSvgPath, dest: path.join(assetsDir, 'icon.png') }
];

try {
  for (const file of iconFiles) {
    fs.copyFileSync(file.src, file.dest);
    console.log(`Copied ${path.basename(file.src)} to ${path.basename(file.dest)}`);
  }
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error);
  process.exit(1);
}
