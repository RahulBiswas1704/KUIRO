const sharp = require('sharp');
const https = require('https');
const fs = require('fs');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading Noto Sans Bengali TTF...');
  const bengaliBuffer = await download('https://fonts.gstatic.com/s/notosansbengali/v33/Cn-SJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mcSPVFpVEqE-6Kmsm5MudA.ttf');
  console.log('Downloaded Bengali TTF:', bengaliBuffer.length, 'bytes');

  const base64Bengali = bengaliBuffer.toString('base64');

  const svg = `<svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @font-face {
          font-family: 'Noto Sans Bengali';
          src: url(data:font/truetype;charset=utf-8;base64,${base64Bengali}) format('truetype');
          font-weight: 700;
        }
      </style>
    </defs>
    <rect width="100%" height="100%" fill="#0B0F14"/>
    <text x="60" y="160" fill="#FF7A00" font-family="'Noto Sans Bengali', sans-serif" font-size="54" font-weight="700">
      শুভ নববর্ষ ১৪৩১
    </text>
  </svg>`;

  const pngBuf = await sharp(Buffer.from(svg)).png().toBuffer();
  console.log('Rendered SVG with embedded base64 font into PNG! Length:', pngBuf.length);
  fs.writeFileSync('scripts/bengali-test.png', pngBuf);
}

run().catch(console.error);

