const sharp = require('sharp');
const fs = require('fs');

async function getContours(imagePath, threshold = 100) {
  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  
  const grid = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    grid[i] = data[i * 4 + 3] > threshold ? 1 : 0;
  }

  const visited = new Uint8Array(width * height);
  const contours = [];

  const dx = [-1, -1, 0, 1, 1, 1, 0, -1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (grid[idx] === 1 && !visited[idx]) {
        let isBorder = false;
        for (let d = 0; d < 8; d++) {
          const nx = x + dx[d];
          const ny = y + dy[d];
          if (grid[ny * width + nx] === 0) {
            isBorder = true;
            break;
          }
        }

        if (isBorder) {
          const pts = [];
          let cx = x;
          let cy = y;
          let dir = 0;
          let iters = 0;

          do {
            pts.push([cx, cy]);
            visited[cy * width + cx] = 1;
            let found = false;
            let checkDir = (dir + 5) % 8;

            for (let i = 0; i < 8; i++) {
              const d = (checkDir + i) % 8;
              const nx = cx + dx[d];
              const ny = cy + dy[d];
              if (nx >= 0 && nx < width && ny >= 0 && ny < height && grid[ny * width + nx] === 1) {
                cx = nx;
                cy = ny;
                dir = d;
                found = true;
                break;
              }
            }
            if (!found) break;
            iters++;
          } while ((cx !== x || cy !== y) && iters < 50000);

          if (pts.length > 30) {
            contours.push(pts);
          }
        }
      }
    }
  }

  return { width, height, contours };
}

function perpendicularDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

function simplify(pts, tol) {
  if (pts.length <= 2) return pts;
  let maxD = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perpendicularDistance(pts[i], pts[0], pts[pts.length - 1]);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > tol) {
    const p1 = simplify(pts.slice(0, idx + 1), tol);
    const p2 = simplify(pts.slice(idx), tol);
    return p1.slice(0, p1.length - 1).concat(p2);
  }
  return [pts[0], pts[pts.length - 1]];
}

// Convert points to SVG smooth path using cubic beziers
function pointsToSvgPath(points) {
  if (points.length < 3) return '';
  let d = `M ${points[0][0]} ${points[0][1]} `;

  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    // Catmull-Rom to Cubic Bezier
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += `C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }

  d += 'Z';
  return d;
}

function pointsToPolygonPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

async function generateSvgAssets() {
  const symbol = await getContours('public/brand/kuiro-symbol.png');
  const wordmark = await getContours('public/brand/kuiro-wordmark.png');

  console.log(`Symbol contours: ${symbol.contours.length}`);
  console.log(`Wordmark contours: ${wordmark.contours.length}`);

  // Create Symbol SVG paths
  const symbolPaths = symbol.contours.map(c => {
    const simp = simplify(c, 2.5);
    return pointsToPolygonPath(simp);
  });

  // Create Wordmark SVG paths (with fill-rule="evenodd" for holes in R and O)
  const wordmarkPaths = wordmark.contours.map(c => {
    const simp = simplify(c, 1.8);
    return pointsToPolygonPath(simp);
  });

  // 1. kuiro-icon.svg: Standalone geometric K (viewBox 0 0 1024 1024)
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="72 157 894 703" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Geometric Symbol (Flat #FF7A00) -->
  <g fill="#FF7A00">
${symbolPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
</svg>`;
  fs.writeFileSync('public/brand/kuiro-icon.svg', iconSvg);
  console.log('Written public/brand/kuiro-icon.svg');

  // 2. kuiro-primary.svg (Dark theme: Orange Symbol + White Wordmark, Horizontal)
  // Symbol width: 894, height: 703 -> Scale symbol to height 340 (width: ~432)
  // Wordmark width: 979, height: 202 -> Scale wordmark to height 220 (width: ~1066)
  // Total lockup width: ~1650, height: ~400
  const primaryDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1620 420" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Primary Logo (Dark: Flat Orange Symbol + Crisp White Wordmark) -->
  <g id="kuiro-symbol" fill="#FF7A00" transform="translate(40, 20) scale(0.48) translate(-72, -157)">
${symbolPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <g id="kuiro-wordmark" fill="#FFFFFF" fill-rule="evenodd" transform="translate(530, 85) scale(1.05) translate(-25, -188)">
${wordmarkPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
</svg>`;
  fs.writeFileSync('public/brand/kuiro-primary.svg', primaryDarkSvg);
  console.log('Written public/brand/kuiro-primary.svg');

  // 3. kuiro-primary-light.svg (Light theme: Orange Symbol + Charcoal #0B0F14 Wordmark)
  const primaryLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1620 420" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Primary Logo (Light: Flat Orange Symbol + Charcoal Wordmark) -->
  <g id="kuiro-symbol" fill="#FF7A00" transform="translate(40, 20) scale(0.48) translate(-72, -157)">
${symbolPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <g id="kuiro-wordmark" fill="#0B0F14" fill-rule="evenodd" transform="translate(530, 85) scale(1.05) translate(-25, -188)">
${wordmarkPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
</svg>`;
  fs.writeFileSync('public/brand/kuiro-primary-light.svg', primaryLightSvg);
  console.log('Written public/brand/kuiro-primary-light.svg');

  // 4. kuiro-stacked.svg (Dark theme: Centered Symbol on top + Wordmark underneath)
  const stackedDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 900" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Stacked Logo (Dark: Centered Orange Symbol + White Wordmark) -->
  <g id="kuiro-symbol" fill="#FF7A00" transform="translate(300, 40) scale(0.56) translate(-72, -157)">
${symbolPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <g id="kuiro-wordmark" fill="#FFFFFF" fill-rule="evenodd" transform="translate(50, 480) scale(1.02) translate(-25, -188)">
${wordmarkPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <text x="550" y="760" text-anchor="middle" fill="#D1D5DB" font-family="'Inter', sans-serif" font-size="34" font-weight="500" letter-spacing="0.16em">
    CREATE / APPROVE / GROW.
  </text>
</svg>`;
  fs.writeFileSync('public/brand/kuiro-stacked.svg', stackedDarkSvg);
  console.log('Written public/brand/kuiro-stacked.svg');

  // 5. kuiro-stacked-light.svg (Light theme: Centered Symbol on top + Charcoal Wordmark underneath)
  const stackedLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 900" fill="none" width="100%" height="100%">
  <!-- Official KUIRO Stacked Logo (Light: Centered Orange Symbol + Charcoal Wordmark) -->
  <g id="kuiro-symbol" fill="#FF7A00" transform="translate(300, 40) scale(0.56) translate(-72, -157)">
${symbolPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <g id="kuiro-wordmark" fill="#0B0F14" fill-rule="evenodd" transform="translate(50, 480) scale(1.02) translate(-25, -188)">
${wordmarkPaths.map(p => `    <path d="${p}" />`).join('\n')}
  </g>
  <text x="550" y="760" text-anchor="middle" fill="#374151" font-family="'Inter', sans-serif" font-size="34" font-weight="500" letter-spacing="0.16em">
    CREATE / APPROVE / GROW.
  </text>
</svg>`;
  fs.writeFileSync('public/brand/kuiro-stacked-light.svg', stackedLightSvg);
  console.log('Written public/brand/kuiro-stacked-light.svg');
}

generateSvgAssets().catch(console.error);

