import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const iconSvgPath = path.join(publicDir, 'icon.svg');
const iconMaskableSvgPath = path.join(publicDir, 'icon-maskable.svg');

const iconSvg = fs.readFileSync(iconSvgPath);
const iconMaskableSvg = fs.readFileSync(iconMaskableSvgPath);

async function generate() {
  console.log('Generating PNG icons...');

  // Standard PWA icons
  await sharp(iconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  
  // Legacy / fallback named icons
  await sharp(iconSvg).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(iconSvg).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));
  
  // Maskable icons
  await sharp(iconMaskableSvg).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-maskable-192x192.png'));
  await sharp(iconMaskableSvg).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple Touch Icon & Favicons
  await sharp(iconSvg).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  await sharp(iconSvg).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(iconSvg).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));

  console.log('All PNG icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
