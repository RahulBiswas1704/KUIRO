const http = require('http');
const JSZip = require('jszip');

const PORT = 3000;
const HOST = '127.0.0.1';

function fetchBinary(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          buffer,
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runTest() {
  console.log('============================================================');
  console.log('🚀 TESTING 1-CLICK CREATIVE KIT ASSET EXPORTER (OPTION 4)');
  console.log('============================================================\n');

  try {
    console.log('[1/2] Invoking GET /api/campaigns/export ...');
    const res = await fetchBinary('/api/campaigns/export');

    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Content-Type: ${res.headers['content-type']}`);
    console.log(`  Content-Disposition: ${res.headers['content-disposition']}`);
    console.log(`  Total Download Size: ${res.buffer.length} bytes (${Math.round(res.buffer.length / 1024)} KB)`);

    if (res.status !== 200 || !res.headers['content-type']?.includes('zip')) {
      console.error('  ❌ Export failed or did not return a ZIP archive!');
      process.exit(1);
    }

    console.log('\n[2/2] Inspecting unzipped contents with JSZip...');
    const zip = await JSZip.loadAsync(res.buffer);
    const files = Object.keys(zip.files);

    console.log(`  Discovered ${files.length} packaged entries:`);
    files.forEach((f) => {
      const isDir = zip.files[f].dir;
      if (!isDir) {
        console.log(`   📄 ${f}`);
      }
    });

    // Check mandatory assets
    const expectedAssets = [
      'visuals/1_instagram_feed_4x5.webp',
      'visuals/2_whatsapp_broadcast_1x1.webp',
      'visuals/3_linkedin_square_1x1.webp',
      'copy/CAPTIONS_AND_HASHTAGS.md',
      'copy/EMAIL_NEWSLETTER.html',
      'CAMPAIGN_SUMMARY.json',
      'README_FOR_CLINIC_STAFF.txt',
    ];

    for (const exp of expectedAssets) {
      if (!zip.files[exp]) {
        console.error(`  ❌ Missing expected asset in ZIP: ${exp}`);
        process.exit(1);
      }
    }

    // Inspect copy contents
    const copyContent = await zip.files['copy/CAPTIONS_AND_HASHTAGS.md'].async('string');
    console.log(`\n  ✅ Markdown Copy Preview (First 150 chars):\n     ${copyContent.slice(0, 150).replace(/\n/g, ' ')}...`);

    const summaryContent = await zip.files['CAMPAIGN_SUMMARY.json'].async('string');
    const summaryJson = JSON.parse(summaryContent);
    console.log(`\n  ✅ Summary Metadata:\n     Topic: "${summaryJson.topicSummary}"\n     Brand: "${summaryJson.brandName}"\n     Critic Quality Score: ${summaryJson.criticCompositeScore}/100`);

    console.log('\n============================================================');
    console.log('🎉 1-CLICK CREATIVE KIT ZIP EXPORT TEST PASSED COMPLETELY!');
    console.log('============================================================');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

runTest();

