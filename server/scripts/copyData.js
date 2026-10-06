import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src/data');
const distDir = path.resolve('dist/data');

if (fs.existsSync(srcDir)) {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  for (const file of fs.readdirSync(srcDir)) {
    if (file.endsWith('.json')) {
      fs.copyFileSync(path.join(srcDir, file), path.join(distDir, file));
      console.log(`[copyData] Copied ${file} to dist/data/`);
    }
  }
}
