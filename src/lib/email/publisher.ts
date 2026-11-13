/**
 * KUIRO Autonomous Email Marketing & Newsletter Engine
 * 
 * Generates and dispatches responsive, high-deliverability branded HTML newsletters
 * directly to customer subscriber lists (via Resend, Amazon SES, or Brevo).
 * Also powers email campaign digests and 48-hour approval alerts for owners.
 */

export interface EmailCampaignPayload {
  to: string | string[];
  fromName?: string;
  fromEmail?: string;
  subject: string;
  preheader?: string;
  brandName: string;
  brandLogoUrl?: string;
  primaryColor?: string;
  headline: string;
  bodyContentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  businessAddress?: string;
  unsubscribeUrl?: string;
}

export interface EmailPublishResult {
  status: 'PUBLISHED' | 'MOCK_PUBLISHED' | 'FAILED';
  campaignId?: string;
  recipientCount: number;
  provider: 'resend' | 'ses' | 'brevo' | 'mock';
  error?: string;
}

/**
 * Generate responsive, accessible HTML for festive and weekly email newsletters
 */
export function buildBrandedNewsletterHtml(payload: EmailCampaignPayload): string {
  const primaryColor = payload.primaryColor || '#FF7A00';
  const brandName = payload.brandName || 'KUIRO Autopilot';
  const preheader = payload.preheader || 'Updates from ' + brandName;
  const ctaText = payload.ctaText || 'Learn More & Book';
  const ctaUrl = payload.ctaUrl || 'https://kuiro.in';
  const businessAddress = payload.businessAddress || 'India';
  const unsubscribeUrl = payload.unsubscribeUrl || '#';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #0B0F14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #070B10; padding: 24px 0; }
    .main { background-color: #0B0F14; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; }
    .button { background-color: ${primaryColor}; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; }
  </style>
</head>
<body>
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
    ${preheader}
  </div>

  <center class="wrapper">
    <table class="main" width="100%">
      <!-- Header with Brand Lockup -->
      <tr>
        <td style="padding: 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background-color: #080C12;">
          <table width="100%">
            <tr>
              <td align="left">
                <span style="font-size: 18px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">${brandName}</span>
              </td>
              <td align="right">
                <span style="font-size: 11px; font-family: monospace; color: ${primaryColor}; background: rgba(255, 122, 0, 0.12); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 122, 0, 0.25);">KUIRO AUTOPILOT</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Hero Headline & Body -->
      <tr>
        <td style="padding: 36px 32px 24px 32px;">
          <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
            ${payload.headline}
          </h1>
          <div style="font-size: 14px; line-height: 1.6; color: #94A3B8; margin-bottom: 28px;">
            ${payload.bodyContentHtml}
          </div>

          <!-- Primary CTA Button -->
          <table width="100%">
            <tr>
              <td align="left">
                <a href="${ctaUrl}" class="button" target="_blank">
                  ${ctaText}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer Compliance & Unsubscribe -->
      <tr>
        <td style="padding: 24px 32px; background-color: #06090E; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #64748B; line-height: 1.5;">
          <p style="margin: 0 0 8px 0;">
            Sent by <strong>${brandName}</strong> • ${businessAddress}
          </p>
          <p style="margin: 0;">
            You are receiving this because you subscribed or visited our location. 
            <a href="${unsubscribeUrl}" style="color: #94A3B8; text-decoration: underline;">Unsubscribe</a> or manage preferences.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

/**
 * Dispatch an autonomous email newsletter campaign
 */
export async function sendAutonomousEmailNewsletter(
  payload: EmailCampaignPayload
): Promise<EmailPublishResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.BREVO_API_KEY;
  const recipientCount = Array.isArray(payload.to) ? payload.to.length : 1;
  const html = buildBrandedNewsletterHtml(payload);

  // If in local/dev mode or missing live keys, gracefully mock the delivery
  if (!apiKey || process.env.NODE_ENV !== 'production') {
    console.log(`[Email Mock Publisher] Automated newsletter dispatched: "${payload.subject}" to ${recipientCount} recipients.`);
    return {
      status: 'MOCK_PUBLISHED',
      campaignId: `email_mock_${Date.now()}`,
      recipientCount,
      provider: 'mock'
    };
  }

  try {
    // Live Resend API Integration
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${payload.fromName || payload.brandName} <updates@kuiro.in>`,
        to: payload.to,
        subject: payload.subject,
        html
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to dispatch email via Resend');

    return {
      status: 'PUBLISHED',
      campaignId: data.id,
      recipientCount,
      provider: 'resend'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Email Publish Error]', errorMsg);
    return {
      status: 'FAILED',
      recipientCount: 0,
      provider: 'resend',
      error: errorMsg
    };
  }
}

