const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = './public/moments';
const files = fs.readdirSync(dir);

async function processFiles() {
  for (const f of files) {
    if (f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png')) {
      const src = path.join(dir, f);
      const dest = path.join(dir, f.replace(/\.(jpeg|jpg|png)$/i, '.webp'));
      try {
        await sharp(src).webp({ quality: 80 }).toFile(dest);
        fs.unlinkSync(src);
        console.log(`Converted ${f} to ${path.basename(dest)}`);
      } catch (err) {
        console.error(`Error converting ${f}:`, err);
      }
    }
  }
}

processFiles().then(() => console.log('Done'));
