const sharp = require('sharp');
const fs = require('fs');

async function test() {
  const svg = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0B0F14"/>
    <text x="50" y="100" fill="#FF7A00" font-family="'Noto Sans Bengali', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Sora', sans-serif" font-size="44" font-weight="700">
      শুভ নববর্ষ • শুভ দীপাবলি
    </text>
    <text x="50" y="200" fill="#FFFFFF" font-family="'Noto Sans Devanagari', 'Noto Sans Bengali', 'Noto Sans Tamil', 'Sora', sans-serif" font-size="44" font-weight="700">
      शुभ दीपावली • खुशहाल होली
    </text>
    <text x="50" y="300" fill="#00C88C" font-family="'Noto Sans Tamil', 'Noto Sans Devanagari', 'Noto Sans Bengali', 'Sora', sans-serif" font-size="44" font-weight="700">
      இனிய தீபாவளி நல்வாழ்த்துகள்
    </text>
  </svg>`;

  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  console.log('Successfully rendered Indic SVG to PNG buffer of length:', buf.length);
  fs.writeFileSync('scripts/indic-test-out.png', buf);
}

test().catch(console.error);
