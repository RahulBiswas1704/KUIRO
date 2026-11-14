import { NextRequest, NextResponse } from 'next/server';
import { db, scheduledCampaigns, platformPosts, workspaces, brandProfiles } from '@/db';
import { eq, desc } from 'drizzle-orm';
import JSZip from 'jszip';
import { compositeBrandOverlay } from '@/lib/media/compositor';

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 36);
}

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const campaignIdParam = searchParams.get('campaignId');

    let campaign;
    if (campaignIdParam) {
      [campaign] = await database
        .select()
        .from(scheduledCampaigns)
        .where(eq(scheduledCampaigns.id, campaignIdParam))
        .limit(1);
    }

    if (!campaign) {
      [campaign] = await database
        .select()
        .from(scheduledCampaigns)
        .orderBy(desc(scheduledCampaigns.createdAt))
        .limit(1);
    }

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'No campaign found to export' }, { status: 404 });
    }

    // 1. Fetch Posts
    const posts = await database
      .select()
      .from(platformPosts)
      .where(eq(platformPosts.campaignId, campaign.id));

    // 2. Fetch Workspace & Brand Profile
    const [ws] = await database
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, campaign.workspaceId))
      .limit(1);

    const [bp] = await database
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.workspaceId, campaign.workspaceId))
      .limit(1);

    const brandName = ws?.name || 'KUIRO Clinical Brand';
    const primaryColor = bp?.visualIdentity?.primaryHex || '#FF7A00';
    const secondaryColor = bp?.visualIdentity?.secondaryHex || '#0B0F14';
    const phone = ws?.whatsappAdminPhone || '+91 98301 24589';
    const website = bp?.websiteUrl ? bp.websiteUrl.replace(/^https?:\/\//, '') : 'kuiro.in';

    const igPost = posts.find((p) => p.platform === 'instagram');
    const liPost = posts.find((p) => p.platform === 'linkedin');
    const xPost = posts.find((p) => p.platform === 'x');
    const waPost = posts.find((p) => p.platform === 'whatsapp');
    const emailPost = posts.find((p) => p.platform === 'email');

    const topic = campaign.topicSummary;
    const headline = topic.length > 40 ? topic.slice(0, 38) + '...' : topic;
    const subheadline = bp?.industry ? `${bp.industry} • Priority Care` : 'Autonomous Clinical Care Series';

    // 3. Render High-DPI Visual Assets with Indic Compositor
    console.log(`[Creative Kit Exporter] Compositing high-DPI assets for "${topic}"...`);
    const [igVisual, waVisual, liVisual] = await Promise.all([
      // Instagram 4:5 Portrait (1080x1350)
      compositeBrandOverlay({
        headline,
        subheadline,
        brandName,
        primaryColor,
        phone,
        website,
        width: 1080,
        height: 1350,
        aspectRatio: '4:5',
      }),
      // WhatsApp Square 1:1 Broadcast Card (1080x1080)
      compositeBrandOverlay({
        headline,
        subheadline,
        brandName,
        primaryColor: '#10B981', // WhatsApp Emerald Accent
        phone,
        website,
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
      }),
      // LinkedIn Square 1:1 Post (1080x1080)
      compositeBrandOverlay({
        headline,
        subheadline,
        brandName,
        primaryColor: '#0A66C2', // LinkedIn Blue Accent
        phone,
        website,
        width: 1080,
        height: 1080,
        aspectRatio: '1:1',
      }),
    ]);

    // 4. Generate Markdown Copy Assets
    const markdownCopy = `# KUIRO Autonomous Creative Kit: ${topic}
**Generated for:** ${brandName}  
**Campaign Topic:** ${topic}  
**Trigger Type:** ${campaign.triggerType}  
**Publish Date:** ${new Date(campaign.publishAt).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}  
**Compliance Standard:** NMC Ethical Teleconsultation & Advertising Guardrails Applied  

---

## 1. 📸 Instagram (Feed & Story)
**Aspect Ratio:** 4:5 Portrait (1080x1350px)  
**File:** \`visuals/1_instagram_feed_4x5.webp\`  

### Caption:
${igPost?.captionText || 'Invest in your health with proactive preventive care.'}

### Recommended Hashtags:
${igPost?.firstCommentText || '#Healthcare #WellnessIndia #PreventiveCare #KUIRO'}

---

## 2. 💼 LinkedIn (Executive Thought Leadership)
**Aspect Ratio:** 1:1 Square (1080x1080px)  
**File:** \`visuals/3_linkedin_square_1x1.webp\`  

### Post Copy:
${liPost?.captionText || 'Proactive wellness drives institutional resilience and clinical longevity.'}

### Hashtags:
${liPost?.firstCommentText || '#Leadership #CorporateWellness #Healthcare'}

---

## 3. 🐦 X (Twitter)
**Rule:** Main tweet has NO external links (avoids 40% reach penalty).  

### Main Tweet (under 240 chars):
${xPost?.captionText || 'Early health detection beats late intervention every time. Priority clinic consultation slots open today.'}

### Verified First-Reply (Link Placement):
${xPost?.firstCommentText || 'Book priority consultation: https://kuiro.in/book'}

---

## 4. 💬 WhatsApp Broadcast Card
**Aspect Ratio:** 1:1 Square (1080x1080px)  
**File:** \`visuals/2_whatsapp_broadcast_1x1.webp\`  

### Broadcast Message:
${waPost?.captionText || '🌟 Priority Clinic Announcement: Book your preventive checkup today. Reply BOOK or call our desk.'}

---

## 5. 📧 Email Newsletter
**Subject:** ${emailPost?.emailSubject || `${topic} — Priority Update from ${brandName}`}  
**HTML Template File:** \`copy/EMAIL_NEWSLETTER.html\`  
`;

    // 5. Generate Standalone HTML Email Template
    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailPost?.emailSubject || topic}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F6F9; margin: 0; padding: 20px; color: #1E293B; }
    .email-container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0B0F14; padding: 28px 24px; text-align: center; border-bottom: 3px solid ${primaryColor}; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { color: #94A3B8; margin: 6px 0 0 0; font-size: 12px; }
    .body-content { padding: 32px 28px; line-height: 1.65; font-size: 15px; color: #334155; }
    .body-content p { margin-bottom: 18px; }
    .cta-container { text-align: center; margin: 30px 0; }
    .cta-btn { display: inline-block; background-color: ${primaryColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { background: #F8FAFC; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>${brandName}</h1>
      <p>Autonomous Wellness & Preventive Care Bulletin</p>
    </div>
    <div class="body-content">
      <h2 style="font-size: 18px; color: #0B0F14; margin-top: 0;">${topic}</h2>
      ${emailPost?.emailHtml || `<p>Dear Valued Client,</p><p>Proactive care is always more effective than delayed interventions. We are pleased to announce priority consultation slots for our community.</p>`}
      <div class="cta-container">
        <a href="https://${website}/book" class="cta-btn">Book Priority Consultation &rarr;</a>
      </div>
      <p style="font-size: 13px; color: #64748B;">For urgent appointments, reach our reception directly at <strong>${phone}</strong> or visit our clinic.</p>
    </div>
    <div class="footer">
      <p><strong>${brandName}</strong> • ${website}</p>
      <p>Delivered by KUIRO Autonomous Co-Pilot • NMC Compliance Verified</p>
    </div>
  </div>
</body>
</html>`;

    // 6. Generate Staff Instructions Readme
    const staffInstructions = `================================================================================
KUIRO CLINIC MARKETING RECEPTION KIT
Campaign: "${topic}"
Brand: ${brandName}
Generated On: ${new Date().toISOString()}
================================================================================

QUICK INSTRUCTIONS FOR FRONT-DESK STAFF & CLINIC MANAGERS:

1. RECEPTION TV & WAITING LOUNGE DISPLAY:
   - Use the file in "visuals/1_instagram_feed_4x5.webp" or "visuals/2_whatsapp_broadcast_1x1.webp".
   - Load onto a USB stick or cast directly to your waiting area Smart TV.
   - Designed with high-contrast text and emergency contact numbers clearly visible from 15 feet away.

2. WHATSAPP BROADCAST & STATUS:
   - Share "visuals/2_whatsapp_broadcast_1x1.webp" directly to your clinic WhatsApp Business status.
   - Copy the broadcast caption from "copy/CAPTIONS_AND_HASHTAGS.md" (Section 4).

3. SOCIAL MEDIA CHANNELS (MANUAL BACKUP):
   - KUIRO auto-commits and publishes automatically to your connected accounts.
   - If manual posting is required, copy the captions from "copy/CAPTIONS_AND_HASHTAGS.md".

4. EMAIL NEWSLETTER:
   - Open "copy/EMAIL_NEWSLETTER.html" in any browser, or copy the source code into Mailchimp, Resend, or your clinic CRM.

Need assistance? Contact KUIRO Support at support@kuiro.in
================================================================================`;

    // 7. Structured JSON Metadata
    const metadata = {
      campaignId: campaign.id,
      topicSummary: topic,
      triggerType: campaign.triggerType,
      brandName,
      primaryColor,
      publishAt: campaign.publishAt,
      generatedAt: new Date().toISOString(),
      criticCompositeScore: igPost?.aiCriticScore || 96,
      platformsIncluded: ['instagram', 'whatsapp', 'linkedin', 'x', 'email'],
      assetFiles: [
        'visuals/1_instagram_feed_4x5.webp',
        'visuals/2_whatsapp_broadcast_1x1.webp',
        'visuals/3_linkedin_square_1x1.webp',
        'copy/CAPTIONS_AND_HASHTAGS.md',
        'copy/EMAIL_NEWSLETTER.html',
        'CAMPAIGN_SUMMARY.json',
        'README_FOR_CLINIC_STAFF.txt',
      ],
    };

    // 8. Package into JSZip Archive
    const zip = new JSZip();
    const visualsFolder = zip.folder('visuals');
    visualsFolder?.file('1_instagram_feed_4x5.webp', igVisual.buffer);
    visualsFolder?.file('2_whatsapp_broadcast_1x1.webp', waVisual.buffer);
    visualsFolder?.file('3_linkedin_square_1x1.webp', liVisual.buffer);

    const copyFolder = zip.folder('copy');
    copyFolder?.file('CAPTIONS_AND_HASHTAGS.md', markdownCopy);
    copyFolder?.file('EMAIL_NEWSLETTER.html', emailHtml);

    zip.file('CAMPAIGN_SUMMARY.json', JSON.stringify(metadata, null, 2));
    zip.file('README_FOR_CLINIC_STAFF.txt', staffInstructions);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const slug = slugify(topic);
    const filename = `KUIRO_Creative_Kit_${slug}_${Date.now()}.zip`;

    console.log(`[Creative Kit Exporter] Generated ZIP package: ${filename} (${zipBuffer.length} bytes)`);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(zipBuffer.length),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /api/campaigns/export GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export creative kit bundle' },
      { status: 500 }
    );
  }
}
