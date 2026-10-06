import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
const publicDir = path.join(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  try {
    console.log('Generating PWA icons from icon.svg...');

    // 1. Standard 192x192 icon
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'pwa-192x192.png'));
    console.log('Generated pwa-192x192.png');

    // 2. Standard 512x512 icon
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'pwa-512x512.png'));
    console.log('Generated pwa-512x512.png');

    // 3. Apple Touch Icon 180x180
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png');

    // 4. Maskable 512x512 icon (add a safe-zone padding)
    // To make it maskable, we resize the icon slightly smaller (e.g., 400x400) 
    // and place it over a solid background color matching our blue theme (#1e3a8a / rgb(30, 58, 138))
    const innerIcon = await sharp(svgPath)
      .resize(380, 380)
      .toBuffer();

    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 30, g: 58, b: 138, alpha: 1 } // #1e3a8a
      }
    })
      .composite([{ input: innerIcon, gravity: 'center' }])
      .png()
      .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
    console.log('Generated pwa-maskable-512x512.png');

    console.log('All PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
