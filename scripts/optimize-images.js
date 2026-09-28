import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = path.resolve('public/assets/images');

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function optimizeImages() {
  const allFiles = await getAllFiles(imagesDir);
  console.log(`Found ${allFiles.length} files to inspect.`);

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const relPath = path.relative(imagesDir, filePath);

    try {
      const metadata = await sharp(filePath).metadata();
      const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

      // 1. Generate optimized WebP version if not webp
      if (ext !== '.webp') {
        let webpBuffer = sharp(filePath);
        if (metadata.width > 1600) {
          webpBuffer = webpBuffer.resize(1600, null, { withoutEnlargement: true });
        }
        await webpBuffer.webp({ quality: 82, effort: 6 }).toFile(webpPath);
        const webpStats = fs.statSync(webpPath);
        console.log(`Generated WebP: ${path.relative(imagesDir, webpPath)} (${(webpStats.size / 1024).toFixed(1)} KB vs ${sizeKB} KB)`);
      }

      // 2. Compress the original file in-place if it is large
      if (ext === '.png' && stats.size > 80 * 1024) {
        const tmpPath = filePath + '.tmp.png';
        let img = sharp(filePath);
        if (metadata.width > 1600) {
          img = img.resize(1600, null, { withoutEnlargement: true });
        }
        await img.png({ quality: 80, compressionLevel: 9, palette: true }).toFile(tmpPath);
        const newStats = fs.statSync(tmpPath);
        if (newStats.size < stats.size) {
          fs.renameSync(tmpPath, filePath);
          console.log(`Compressed PNG in-place: ${relPath} (${sizeKB} KB -> ${(newStats.size / 1024).toFixed(1)} KB)`);
        } else {
          fs.unlinkSync(tmpPath);
        }
      } else if (['.jpg', '.jpeg'].includes(ext) && stats.size > 80 * 1024) {
        const tmpPath = filePath + '.tmp.jpg';
        let img = sharp(filePath);
        if (metadata.width > 1600) {
          img = img.resize(1600, null, { withoutEnlargement: true });
        }
        await img.jpeg({ quality: 82, mozjpeg: true }).toFile(tmpPath);
        const newStats = fs.statSync(tmpPath);
        if (newStats.size < stats.size) {
          fs.renameSync(tmpPath, filePath);
          console.log(`Compressed JPEG in-place: ${relPath} (${sizeKB} KB -> ${(newStats.size / 1024).toFixed(1)} KB)`);
        } else {
          fs.unlinkSync(tmpPath);
        }
      }
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
    }
  }

  // Specifically optimize PM Modi and Hero for maximum mobile performance
  const heroPng = path.join(imagesDir, 'hero/hero-rooftop-solar.png');
  const heroWebp = path.join(imagesDir, 'hero/hero-rooftop-solar.webp');
  if (fs.existsSync(heroPng)) {
    await sharp(heroPng)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(heroWebp);
    console.log(`Optimized hero webp: ${(fs.statSync(heroWebp).size / 1024).toFixed(1)} KB`);
  }

  const pmModiJpg = path.join(imagesDir, 'logo/pm-modi.jpg');
  const pmModiWebp = path.join(imagesDir, 'logo/pm-modi.webp');
  if (fs.existsSync(pmModiJpg)) {
    await sharp(pmModiJpg)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(pmModiWebp);
    console.log(`Optimized PM Modi webp: ${(fs.statSync(pmModiWebp).size / 1024).toFixed(1)} KB`);
  }

  console.log('Image optimization complete!');
}

optimizeImages();
