// scripts/download-indic-fonts.cjs
const fs = require('fs');
const path = require('path');
const https = require('https');

const fonts = [
  {
    name: 'noto-sans-bengali-700.ttf',
    url: 'https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf',
  },
  {
    name: 'noto-sans-devanagari-700.ttf',
    url: 'https://fonts.gstatic.com/s/notosansdevanagari/v33/TuGoUUFzXI5FBtUq5a8bjKYTZjtRU6Sgv3NaV_SNmI0b8QQCQmHn6B2OHjbL_08AlZMiy-A.ttf',
  },
  {
    name: 'noto-sans-tamil-700.ttf',
    url: 'https://fonts.gstatic.com/s/notosanstamil/v31/ieVc2YdFI3GCY6SyQy1KfStzYKZgzN1z4LKDbeZce-0429tBManUktuex7shpL0R.ttf',
  },
];

const destDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  console.log(`Downloading Indic fonts to ${destDir}...`);
  for (const f of fonts) {
    const dest = path.join(destDir, f.name);
    await download(f.url, dest);
    const size = fs.statSync(dest).size;
    console.log(`Saved ${f.name} (${size} bytes)`);
  }
  console.log('All fonts downloaded successfully!');
}

main().catch(console.error);

