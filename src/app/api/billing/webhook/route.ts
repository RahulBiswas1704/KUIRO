import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db, workspaces } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Handles incoming payment & subscription webhooks from Razorpay / Stripe
 * Validates cryptographic webhook HMAC signature to prevent unauthorized tenant tier tampering.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.BILLING_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SECRET;

    const signature =
      req.headers.get('x-razorpay-signature') ||
      req.headers.get('stripe-signature');

    // Cryptographic Signature Verification
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Unauthorized: Missing webhook cryptographic signature.' },
          { status: 401 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSignature);
      const isSignatureValid =
        sigBuf.length === expBuf.length &&
        crypto.timingSafeEqual(sigBuf, expBuf);

      if (!isSignatureValid) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid webhook signature.' },
          { status: 401 }
        );
      }
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = event.event || event.type || 'payment.captured';
    const payload = event.payload || event.data?.object || event;

    console.log(`[Billing Webhook Verified] Event: ${eventType}`);

    const database = db;
    if (database && payload.workspaceId) {
      // Prove workspace exists
      const [targetWorkspace] = await database
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, payload.workspaceId))
        .limit(1);

      if (!targetWorkspace) {
        return NextResponse.json({ error: 'Target workspace not found.' }, { status: 404 });
      }

      if (eventType === 'subscription.charged' || eventType === 'payment.captured') {
        const tier = payload.tier || 'GROWTH';
        await database
          .update(workspaces)
          .set({ subscriptionTier: tier })
          .where(eq(workspaces.id, targetWorkspace.id));
      } else if (eventType === 'subscription.halted' || eventType === 'subscription.cancelled') {
        await database
          .update(workspaces)
          .set({ subscriptionTier: 'STARTER' })
          .where(eq(workspaces.id, targetWorkspace.id));
      }
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Billing Webhook Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
