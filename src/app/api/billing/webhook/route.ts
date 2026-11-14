import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces } from '@/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Handles incoming payment & subscription webhooks from Razorpay / Stripe
 * Events: subscription.charged, payment.captured, subscription.cancelled
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = event.event || event.type || 'payment.captured';
    const payload = event.payload || event.data?.object || event;

    console.log(`[Billing Webhook] Received event: ${eventType}`);

    const database = db;
    if (database && payload.workspaceId) {
      if (eventType === 'subscription.charged' || eventType === 'payment.captured') {
        const tier = payload.tier || 'GROWTH';
        await database
          .update(workspaces)
          .set({ subscriptionTier: tier })
          .where(eq(workspaces.id, payload.workspaceId));
      } else if (eventType === 'subscription.halted' || eventType === 'subscription.cancelled') {
        await database
          .update(workspaces)
          .set({ subscriptionTier: 'STARTER' })
          .where(eq(workspaces.id, payload.workspaceId));
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

