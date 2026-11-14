import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users } from '@/db';
import { eq } from 'drizzle-orm';
import { getSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface CheckoutRequestBody {
  tier: 'STARTER' | 'GROWTH' | 'AGENCY';
  billingCycle: 'monthly' | 'annual';
  paymentMethod: 'upi' | 'card' | 'international';
  upiVpa?: string;
  gstin?: string;
  businessName?: string;
  gateway?: 'razorpay' | 'cashfree';
}

const TIER_PRICING = {
  STARTER: { monthly: 1199, annual: 999 * 12 },
  GROWTH: { monthly: 2799, annual: 2299 * 12 },
  AGENCY: { monthly: 11999, annual: 9999 * 12 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required. Active session required.' }, { status: 401 });
    }

    const body: CheckoutRequestBody = await req.json();
    const { tier, billingCycle, paymentMethod, upiVpa, gstin, businessName, gateway = 'razorpay' } = body;

    if (!tier || !TIER_PRICING[tier]) {
      return NextResponse.json({ error: 'Valid subscription tier is required.' }, { status: 400 });
    }

    const baseAmount = billingCycle === 'annual' ? TIER_PRICING[tier].annual : TIER_PRICING[tier].monthly;
    const gstRate = 0.18; // 18% GST (CGST 9% + SGST 9%)
    const gstAmount = Math.round(baseAmount * gstRate);
    const totalAmount = baseAmount + gstAmount;

    // Generate simulated Razorpay Order ID & Transaction ID
    const orderId = `order_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const invoiceNumber = `KUIRO/26-27/${Math.floor(1000 + Math.random() * 9000)}`;

    const database = db;
    const wsId = session.workspace.id;

    if (database) {
      const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);

      if (ws) {
        // Upgrade workspace tier in Neon PostgreSQL
        await database
          .update(workspaces)
          .set({ subscriptionTier: tier })
          .where(eq(workspaces.id, ws.id));
      }
    }

    // Dynamic UPI Payment Link (BHIM/PhonePe/GPay QR Compatible)
    const upiLink = `upi://pay?pa=kuiro@icici&pn=KUIRO%20Technologies&tr=${orderId}&am=${totalAmount}&cu=INR&tn=KUIRO%20${tier}%20Autopilot%20Subscription`;

    return NextResponse.json({
      success: true,
      order: {
        orderId,
        paymentId,
        invoiceNumber,
        tier,
        billingCycle,
        currency: 'INR',
        baseAmount,
        gstRate: '18%',
        cgst: Math.round(gstAmount / 2),
        sgst: Math.round(gstAmount / 2),
        gstAmount,
        totalAmount,
        status: 'PAID_ACTIVE',
        activatedAt: new Date().toISOString(),
        paymentMethod,
        gateway,
        upiLink,
        upiVpa: upiVpa || 'kuiro@icici',
        gstin: gstin || '19AAACS1429B1Z8',
        hsnCode: '998314', // Information technology and AI SaaS services
        businessName: businessName || 'Valued KUIRO Enterprise',
      },
      message: `Successfully upgraded to KUIRO ${tier} (${billingCycle.toUpperCase()}) tier!`,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}

