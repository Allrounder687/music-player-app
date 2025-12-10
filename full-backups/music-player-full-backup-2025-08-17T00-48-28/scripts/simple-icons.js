const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const assetsDir = path.join(__dirname, '../assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Simple function to create a colored square icon
function createSimpleIcon(size, color, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  
  // Draw a simple music note in the center
  const center = size / 2;
  const noteSize = size * 0.5;
  
  ctx.fillStyle = '#ffffff';
  
  // Draw note body
  ctx.beginPath();
  ctx.ellipse(center, center - noteSize * 0.1, noteSize * 0.3, noteSize * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw note stem
  ctx.fillRect(center + noteSize * 0.1, center - noteSize * 0.5, noteSize * 0.15, noteSize * 0.7);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated ${outputPath}`);
}

// Generate icons
function generateIcons() {
  try {
    // Generate Windows ICO (just using a PNG for now, in a real app you'd use a proper ICO generator)
    createSimpleIcon(256, '#4F46E5', path.join(assetsDir, 'icon.ico'));
    
    // Generate macOS ICNS (just using a PNG for now)
    createSimpleIcon(512, '#4F46E5', path.join(assetsDir, 'icon.icns'));
    
    // Generate PNG for Linux and other uses
    createSimpleIcon(512, '#4F46E5', path.join(assetsDir, 'icon.png'));
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
