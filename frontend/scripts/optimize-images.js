import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImage(inputPath, outputPath, options = {}) {
  const {
    width = null,
    quality = 80,
    format = 'webp',
  } = options;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`Processing: ${path.basename(inputPath)}`);
    console.log(`Original size: ${(fs.statSync(inputPath).size / 1024).toFixed(2)} KB`);
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    let pipeline = image;

    // Resize if width is specified
    if (width && width < metadata.width) {
      pipeline = pipeline.resize(width, null, {
        withoutEnlargement: true,
      });
    }

    // Convert to specified format
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality });
    } else if (format === 'png') {
      pipeline = pipeline.png({
        compressionLevel: 9,
        quality,
      });
    } else if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality });
    }

    await pipeline.toFile(outputPath);

    const outputSize = fs.statSync(outputPath).size;
    console.log(`Optimized size: ${(outputSize / 1024).toFixed(2)} KB`);
    console.log(`Saved: ${((1 - outputSize / fs.statSync(inputPath).size) * 100).toFixed(2)}%`);
    console.log('---');

  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
  }
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logoPath = path.join(publicDir, 'logo.png');

  if (!fs.existsSync(logoPath)) {
    console.error('logo.png not found in public directory');
    return;
  }

  // Create backup
  const backupPath = path.join(publicDir, 'logo-original.png');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(logoPath, backupPath);
    console.log('Created backup: logo-original.png\n');
  }

  // Generate multiple formats
  console.log('Generating optimized images...\n');

  // WebP version (modern browsers)
  await optimizeImage(logoPath, path.join(publicDir, 'logo.webp'), {
    quality: 80,
    format: 'webp',
  });

  // Optimized PNG (fallback)
  await optimizeImage(logoPath, path.join(publicDir, 'logo-optimized.png'), {
    quality: 85,
    format: 'png',
  });

  // Smaller PNG for thumbnails
  await optimizeImage(logoPath, path.join(publicDir, 'logo-thumb.webp'), {
    width: 800,
    quality: 75,
    format: 'webp',
  });

  console.log('✓ Image optimization complete!');
  console.log('\nRecommended usage:');
  console.log('1. Use logo.webp for modern browsers');
  console.log('2. Use logo-optimized.png as fallback');
  console.log('3. Consider replacing logo.png with logo-optimized.png');
}

main();
