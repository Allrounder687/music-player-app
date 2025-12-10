const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ico = require('svg-to-ico');

const assetsDir = path.join(__dirname, '../assets');
const iconSvgPath = path.join(assetsDir, 'icon.svg');

// Ensure output directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate PNG icons
const generatePng = async (size, outputPath) => {
  await sharp(iconSvgPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`Generated ${outputPath}`);
};

// Generate ICO file for Windows
const generateIco = async () => {
  const outputPath = path.join(assetsDir, 'icon.ico');
  await ico(iconSvgPath, outputPath);
  console.log(`Generated ${outputPath}`);
};

// Generate ICNS file for macOS
const generateIcns = async () => {
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  const pngFiles = [];
  
  // Generate PNGs at different sizes
  for (const size of sizes) {
    const pngPath = path.join(assetsDir, `icon-${size}.png`);
    await generatePng(size, pngPath);
    pngFiles.push(pngPath);
  }
  
  // Generate ICNS (requires 'iconutil' on macOS)
  if (process.platform === 'darwin') {
    const icnsDir = path.join(assetsDir, 'icon.iconset');
    
    // Create iconset directory
    if (fs.existsSync(icnsDir)) {
      fs.rmSync(icnsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(icnsDir, { recursive: true });
    
    // Copy PNGs to iconset with proper naming
    const iconSizes = [
      { size: 16, scale: 1 },
      { size: 32, scale: 1 },
      { size: 32, scale: 2 },
      { size: 64, scale: 1 },
      { size: 128, scale: 1 },
      { size: 128, scale: 2 },
      { size: 256, scale: 1 },
      { size: 256, scale: 2 },
      { size: 512, scale: 1 },
      { size: 512, scale: 2 },
    ];
    
    for (const { size, scale } of iconSizes) {
      const scaleSuffix = scale > 1 ? `@${scale}x` : '';
      const outputName = `icon_${size}x${size}${scaleSuffix}.png`;
      const outputPath = path.join(icnsDir, outputName);
      
      // Find the closest size we have
      const closestSize = sizes.reduce((prev, curr) => 
        Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
      );
      
      await sharp(path.join(assetsDir, `icon-${closestSize}.png`))
        .resize(size * scale, size * scale)
        .toFile(outputPath);
    }
    
    // Generate ICNS file
    const { execSync } = require('child_process');
    try {
      execSync(`iconutil -c icns ${icnsDir} -o ${path.join(assetsDir, 'icon.icns')}`);
      console.log('Generated icon.icns');
      // Clean up
      fs.rmSync(icnsDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Failed to generate ICNS file. Make sure you are on macOS with Xcode command line tools installed.');
      console.error(error);
    }
  } else {
    console.log('Skipping ICNS generation (requires macOS)');
  }
  
  // Clean up temporary PNGs
  for (const pngFile of pngFiles) {
    fs.unlinkSync(pngFile);
  }
};

// Generate all icons
const generateIcons = async () => {
  try {
    // Generate ICO for Windows
    await generateIco();
    
    // Generate ICNS for macOS
    await generateIcns();
    
    // Generate PNG for Linux and other uses
    await generatePng(512, path.join(assetsDir, 'icon.png'));
    
    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
};

generateIcons();
