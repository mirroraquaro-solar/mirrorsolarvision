import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateHeroResponsive() {
  const src = path.resolve('public/assets/images/hero/hero-rooftop-solar.png');
  const sizes = [480, 768, 1200, 1600];

  for (const w of sizes) {
    const avifDest = path.resolve(`public/assets/images/hero/hero-rooftop-solar-${w}.avif`);
    const webpDest = path.resolve(`public/assets/images/hero/hero-rooftop-solar-${w}.webp`);

    await sharp(src)
      .resize(w, null, { withoutEnlargement: true })
      .avif({ quality: 72, effort: 4 })
      .toFile(avifDest);

    await sharp(src)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(webpDest);

    const avifSize = (fs.statSync(avifDest).size / 1024).toFixed(1);
    const webpSize = (fs.statSync(webpDest).size / 1024).toFixed(1);
    console.log(`Size ${w}px -> AVIF: ${avifSize} KB, WebP: ${webpSize} KB`);
  }
}

generateHeroResponsive();
