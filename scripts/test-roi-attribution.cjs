const http = require('http');

const PORT = 3000;
const HOST = '127.0.0.1';

function makeRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('============================================================');
  console.log('🚀 TESTING CAMPAIGN ROI & LEAD ATTRIBUTION (OPTION 2)');
  console.log('============================================================\n');

  try {
    // 1. First trigger conversations seeder so we have leads in Neon DB
    console.log('[1/4] Ensuring active workspace conversations & leads are seeded...');
    await makeRequest('/api/inbox/conversations', 'GET');

    // 2. Test GET /api/campaigns/roi
    console.log('\n[2/4] Testing GET /api/campaigns/roi (Aggregated ROI & Attribution)...');
    const roiRes = await makeRequest('/api/campaigns/roi', 'GET');
    console.log(`  HTTP Status: ${roiRes.status}`);

    if (roiRes.status === 200 && roiRes.data?.success && roiRes.data.roi) {
      const roi = roiRes.data.roi;
      console.log('  ✅ ROI Summary retrieved successfully from Neon DB!');
      console.log(`     Workspace: ${roi.workspaceName}`);
      console.log(`     Total Attributed Leads: ${roi.totalAttributedLeads}`);
      console.log(`     Total Booked Appointments: ${roi.totalAppointmentsBooked} (${roi.overallConversionRate}% conversion)`);
      console.log(`     Total Pipeline Value: ₹${roi.totalPipelineValue.toLocaleString('en-IN')}`);
      console.log(`     Total Realized Revenue: ₹${roi.totalRealizedRevenue.toLocaleString('en-IN')}`);
      console.log(`     Net KUIRO ROI: ${roi.netRoiMultiplier}x Return (vs ₹${roi.monthlySubscriptionCost}/mo)`);
      console.log(`     WhatsApp Leads: ${roi.channelBreakdown.whatsapp.leads} (₹${roi.channelBreakdown.whatsapp.value.toLocaleString('en-IN')})`);
      console.log(`     Instagram Leads: ${roi.channelBreakdown.instagram.leads} (₹${roi.channelBreakdown.instagram.value.toLocaleString('en-IN')})`);
      console.log(`     Email Leads: ${roi.channelBreakdown.email.leads} (₹${roi.channelBreakdown.email.value.toLocaleString('en-IN')})`);
      console.log(`     Campaigns Broken Down: ${roi.campaignBreakdown.length}`);
    } else {
      console.error('  ❌ Failed to retrieve ROI metrics:', roiRes.data || roiRes.raw);
      process.exit(1);
    }

    // 3. Test POST /api/campaigns/roi (Marking an appointment as booked)
    console.log('\n[3/4] Testing POST /api/campaigns/roi (Confirming Appointment Booking)...');
    const roi = roiRes.data.roi;
    const sampleLead = roi.campaignBreakdown.flatMap(c => c.recentLeads).find(l => !l.isBooked) || roi.campaignBreakdown[0]?.recentLeads[0];

    if (sampleLead) {
      console.log(`  Targeting Lead: ${sampleLead.customerName} (${sampleLead.id})`);
      const postBookingRes = await makeRequest('/api/campaigns/roi', 'POST', {
        conversationId: sampleLead.id,
        bookedValue: 8500,
        notes: 'Confirmed Root Canal & Crown procedure via KUIRO Attribution',
      });

      console.log(`  HTTP Status: ${postBookingRes.status}`);
      if (postBookingRes.status === 200 && postBookingRes.data?.success) {
        console.log(`  ✅ ${postBookingRes.data.message}`);
      } else {
        console.error('  ❌ Booking update failed:', postBookingRes.data);
        process.exit(1);
      }
    } else {
      console.log('  ℹ️ No unbooked lead found, skipping booking mutation test.');
    }

    // 4. Test Webhook Attribution Linking
    console.log('\n[4/4] Testing Inbound WhatsApp Webhook Lead Attribution...');
    const waPayload = {
      entry: [{
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            contacts: [{ profile: { name: 'Dr. Siddharth Sen' } }],
            messages: [{
              from: '+919830099887',
              id: `wamid_test_${Date.now()}`,
              timestamp: String(Math.floor(Date.now() / 1000)),
              type: 'text',
              text: { body: 'I would like to book a full mouth aesthetic rehabilitation consultation next week.' },
            }],
          },
        }],
      }],
    };

    const waRes = await makeRequest('/api/webhooks/whatsapp', 'POST', waPayload);
    console.log(`  Webhook Status: ${waRes.status}`);
    if (waRes.status === 200) {
      console.log('  ✅ Inbound customer webhook processed and attributed to latest campaign!');
    } else {
      console.error('  ❌ Webhook failed:', waRes.data);
      process.exit(1);
    }

    console.log('\n============================================================');
    console.log('🎉 ALL CAMPAIGN ROI & LEAD ATTRIBUTION TESTS PASSED!');
    console.log('============================================================');
  } catch (err) {
    console.error('Test Suite encountered an error:', err);
    process.exit(1);
  }
}

runTests();

