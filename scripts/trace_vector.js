const sharp = require('sharp');
const fs = require('fs');

async function traceImage(imagePath, threshold = 128) {
  const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  
  const grid = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    grid[i] = data[i * 4 + 3] > threshold ? 1 : 0;
  }

  // Find connected components or contours using Moore-Neighbor tracing
  const visited = new Uint8Array(width * height);
  const contours = [];

  const directions = [
    [-1, 0], [-1, 1], [0, 1], [1, 1],
    [1, 0], [1, -1], [0, -1], [-1, -1]
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Border pixel: inside shape, but has at least one 0 neighbor
      if (grid[idx] === 1 && !visited[idx]) {
        let hasZeroNeighbor = false;
        for (let d = 0; d < 8; d++) {
          const nx = x + directions[d][0];
          const ny = y + directions[d][1];
          if (grid[ny * width + nx] === 0) {
            hasZeroNeighbor = true;
            break;
          }
        }

        if (hasZeroNeighbor) {
          // Trace contour
          const points = traceBoundary(grid, width, height, x, y, visited);
          if (points.length > 20) {
            contours.push(points);
          }
        }
      }
    }
  }

  return { width, height, contours };
}

function traceBoundary(grid, width, height, startX, startY, visited) {
  const points = [];
  let currX = startX;
  let currY = startY;
  
  // 8 directions clockwise starting from West
  const dx = [-1, -1, 0, 1, 1, 1, 0, -1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  let dir = 0;
  let iterations = 0;
  const maxIterations = 50000;

  do {
    points.push([currX, currY]);
    visited[currY * width + currX] = 1;

    // Search for next contour pixel
    let found = false;
    let checkDir = (dir + 5) % 8; // backtrack direction

    for (let i = 0; i < 8; i++) {
      const d = (checkDir + i) % 8;
      const nx = currX + dx[d];
      const ny = currY + dy[d];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        if (grid[ny * width + nx] === 1) {
          currX = nx;
          currY = ny;
          dir = d;
          found = true;
          break;
        }
      }
    }

    if (!found) break;
    iterations++;
  } while ((currX !== startX || currY !== startY) && iterations < maxIterations);

  return points;
}

// Douglas-Peucker algorithm to simplify polygon
function simplifyPath(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      maxIdx = i;
    }
  }

  if (maxDist > tolerance) {
    const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
    const right = simplifyPath(points.slice(maxIdx), tolerance);
    return left.slice(0, left.length - 1).concat(right);
  } else {
    return [start, end];
  }
}

function perpendicularDistance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

async function run() {
  const symbol = await traceImage('public/brand/kuiro-symbol.png');
  console.log('Symbol contours found:', symbol.contours.length);
  symbol.contours.forEach((c, i) => {
    const simplified = simplifyPath(c, 1.2);
    console.log(`Symbol contour ${i}: raw ${c.length} pts -> simplified ${simplified.length} pts`);
  });

  const wordmark = await traceImage('public/brand/kuiro-wordmark.png');
  console.log('Wordmark contours found:', wordmark.contours.length);
  wordmark.contours.forEach((c, i) => {
    const simplified = simplifyPath(c, 1.0);
    console.log(`Wordmark contour ${i}: raw ${c.length} pts -> simplified ${simplified.length} pts`);
  });
}

run();

