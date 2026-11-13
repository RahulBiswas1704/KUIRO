import { NextRequest, NextResponse } from 'next/server';
import { sendAutonomousEmailNewsletter } from '@/lib/email/publisher';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, headline, bodyContentHtml, brandName } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient "to" email is required' }, { status: 400 });
    }

    const result = await sendAutonomousEmailNewsletter({
      to,
      subject: subject || '⚡ Your KUIRO Weekly Marketing Digest',
      brandName: brandName || 'KUIRO AI',
      headline: headline || 'Autonomous Marketing Performance Summary',
      bodyContentHtml:
        bodyContentHtml ||
        '<p>This is a live test email from your newly connected KUIRO Email Service engine powered by Resend!</p><p>All festival campaigns, social performance alerts, and customer notifications are functioning correctly.</p>',
    });

    return NextResponse.json({
      success: result.status === 'PUBLISHED',
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unknown email error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({
      configured: !!process.env.RESEND_API_KEY,
      provider: 'Resend',
      usage: 'Pass ?to=your_email@domain.com to send a live test email',
    });
  }

  const result = await sendAutonomousEmailNewsletter({
    to,
    subject: '⚡ KUIRO Live Email System Verification',
    brandName: 'KUIRO Autopilot',
    headline: 'Your Email Marketing Pipeline is Live!',
    bodyContentHtml:
      '<p>Congratulations! Your KUIRO autonomous email engine is successfully connected and transmitting live emails.</p><p>Next up: All automated festive campaigns, weekly recap digests, and WhatsApp notification mirrors will be seamlessly delivered to your subscribers.</p>',
  });

  return NextResponse.json({
    success: result.status === 'PUBLISHED',
    result,
  });
}

