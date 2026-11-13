const fs = require('fs');

const symSvg = fs.readFileSync('public/brand/kuiro-symbol-clean.svg', 'utf8');
const wordSvg = fs.readFileSync('public/brand/kuiro-wordmark-clean.svg', 'utf8');

const symPathMatch = symSvg.match(/<path d="([^"]+)"/);
const wordPathMatch = wordSvg.match(/<path d="([^"]+)"/);

if (!symPathMatch || !wordPathMatch) {
  throw new Error('Could not extract path from SVGs');
}

const symPath = symPathMatch[1];
const wordPath = wordPathMatch[1];

// 1. kuiro-icon.svg
// Tight padding around symbol (bbox: X: 71..968, Y: 157..862)
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 145 920 730" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Standalone Icon (Flat #FF7A00) -->
  <path d="${symPath}" fill="#FF7A00" fill-rule="evenodd" stroke="none" />
</svg>
`;
fs.writeFileSync('public/brand/kuiro-icon.svg', iconSvg);
console.log('Saved kuiro-icon.svg');

// 2. Primary Horizontal Logo (kuiro-primary.svg and kuiro-primary-light.svg)
// In the official banner:
// Symbol: 212 x 170. Wordmark: 490 x 100. Spacing: 38.
// In 1000 x 280 viewport:
const symScale = 200 / 705; // 0.283688
const symScaledW = 897 * symScale; // ~254.5
const symScaledH = 200;

const wordScale = 117.6 / 203; // ~0.57931
const wordScaledW = 981 * wordScale; // ~568.3
const wordScaledH = 117.6;

const gap = 45;
const totalW = symScaledW + gap + wordScaledW; // ~867.8
const startX = (1000 - totalW) / 2; // ~66.1

const symX = startX - 71 * symScale;
const symY = 40 - 157 * symScale;

const wordX = startX + symScaledW + gap - 25 * wordScale;
const wordY = (140 - wordScaledH / 2) - 188 * wordScale;

function makePrimary(textColor, comment) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 280" fill="none" width="100%" height="100%">
  <!-- ${comment} -->
  <g id="kuiro-symbol" fill="#FF7A00" fill-rule="evenodd" transform="translate(${symX.toFixed(2)}, ${symY.toFixed(2)}) scale(${symScale.toFixed(5)})">
    <path d="${symPath}" stroke="none" />
  </g>
  <g id="kuiro-wordmark" fill="${textColor}" fill-rule="evenodd" transform="translate(${wordX.toFixed(2)}, ${wordY.toFixed(2)}) scale(${wordScale.toFixed(5)})">
    <path d="${wordPath}" stroke="none" />
  </g>
</svg>
`;
}

fs.writeFileSync('public/brand/kuiro-primary.svg', makePrimary('#FFFFFF', 'Official KUIRO Primary Lockup - Dark Theme'));
fs.writeFileSync('public/brand/kuiro-primary-light.svg', makePrimary('#0B0F14', 'Official KUIRO Primary Lockup - Light Theme'));
console.log('Saved kuiro-primary.svg & kuiro-primary-light.svg');

// 3. Stacked Logo (kuiro-stacked.svg and kuiro-stacked-light.svg)
const stackSymScale = 220 / 897;
const stackSymScaledW = 220;
const stackSymScaledH = 705 * stackSymScale; // ~172.8

const stackWordScale = 380 / 981;
const stackWordScaledW = 380;
const stackWordScaledH = 203 * stackWordScale; // ~78.6

const stackSymX = 250 - 110 - 71 * stackSymScale;
const stackSymY = 40 - 157 * stackSymScale;

const stackWordX = 250 - 190 - 25 * stackWordScale;
const stackWordY = (40 + stackSymScaledH + 35) - 188 * stackWordScale;

const totalStackedH = 40 + stackSymScaledH + 35 + stackWordScaledH + 40; // ~366.4

function makeStacked(textColor, comment) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" fill="none" width="100%" height="100%">
  <!-- ${comment} -->
  <g id="kuiro-symbol" fill="#FF7A00" fill-rule="evenodd" transform="translate(${stackSymX.toFixed(2)}, ${stackSymY.toFixed(2)}) scale(${stackSymScale.toFixed(5)})">
    <path d="${symPath}" stroke="none" />
  </g>
  <g id="kuiro-wordmark" fill="${textColor}" fill-rule="evenodd" transform="translate(${stackWordX.toFixed(2)}, ${stackWordY.toFixed(2)}) scale(${stackWordScale.toFixed(5)})">
    <path d="${wordPath}" stroke="none" />
  </g>
</svg>
`;
}

fs.writeFileSync('public/brand/kuiro-stacked.svg', makeStacked('#FFFFFF', 'Official KUIRO Stacked Lockup - Dark Theme'));
fs.writeFileSync('public/brand/kuiro-stacked-light.svg', makeStacked('#0B0F14', 'Official KUIRO Stacked Lockup - Light Theme'));
console.log('Saved kuiro-stacked.svg & kuiro-stacked-light.svg');

