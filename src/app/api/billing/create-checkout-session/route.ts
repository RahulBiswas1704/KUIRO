import { NextRequest, NextResponse } from 'next/server';
import { authorizeWorkspace } from '@/lib/auth';
import { createPendingOrder, PlanTier, BillingCycle, TIER_PRICING } from '@/lib/billing';

export const dynamic = 'force-dynamic';

interface CheckoutRequestBody {
  workspaceId?: string;
  tier: PlanTier;
  billingCycle: BillingCycle;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'international';
  upiVpa?: string;
  gstin?: string;
  businessName?: string;
  gateway?: 'razorpay' | 'cashfree';
}

/**
 * Initiates a secure payment session and generates a cryptographically signed PENDING order.
 * 
 * CRITICAL SECURITY GUARDRAIL:
 * This endpoint strictly generates a PENDING order with server-calculated pricing.
 * It NEVER modifies workspaces.subscriptionTier in the database.
 * Upgrades only occur after cryptographic payment signature verification in /api/billing/verify-payment
 * or upon receiving an HMAC-verified webhook from Razorpay/Stripe.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequestBody = await req.json();
    const {
      tier,
      billingCycle = 'monthly',
      paymentMethod = 'upi',
      upiVpa,
      gstin,
      businessName,
      gateway = 'razorpay',
      workspaceId: customWsId,
    } = body;

    const auth = await authorizeWorkspace(req, customWsId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    if (!tier || !TIER_PRICING[tier]) {
      return NextResponse.json({ error: 'Valid subscription tier is required (STARTER, GROWTH, or AGENCY).' }, { status: 400 });
    }

    const wsId = auth.workspaceId!;

    // 1. Create a cryptographically signed pending order (No DB tier mutation)
    const pendingOrder = createPendingOrder({
      workspaceId: wsId,
      tier,
      billingCycle,
      paymentMethod,
      gateway,
      businessName,
      gstin,
    });

    // 2. Dynamic UPI Payment Link (BHIM / PhonePe / GPay QR Compatible)
    const upiLink = `upi://pay?pa=kuiro@icici&pn=KUIRO%20Technologies&tr=${pendingOrder.orderId}&am=${pendingOrder.totalAmount}&cu=INR&tn=KUIRO%20${tier}%20Autopilot%20Subscription`;

    // 3. Return session order payload for client-side gateway checkout or mandate approval
    return NextResponse.json({
      success: true,
      order: {
        orderId: pendingOrder.orderId,
        orderToken: pendingOrder.orderToken,
        status: pendingOrder.status, // Always 'PENDING'
        tier: pendingOrder.tier,
        billingCycle: pendingOrder.billingCycle,
        currency: pendingOrder.currency,
        baseAmount: pendingOrder.baseAmount,
        gstRate: '18%',
        cgst: Math.round(pendingOrder.gstAmount / 2),
        sgst: Math.round(pendingOrder.gstAmount / 2),
        gstAmount: pendingOrder.gstAmount,
        totalAmount: pendingOrder.totalAmount,
        paymentMethod: pendingOrder.paymentMethod,
        gateway: pendingOrder.gateway,
        upiLink,
        upiVpa: upiVpa || 'kuiro@icici',
        gstin: pendingOrder.gstin,
        businessName: pendingOrder.businessName,
        hsnCode: '998314',
        expiresAt: new Date(pendingOrder.expiresAt).toISOString(),
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_kuiro',
      },
      message: `Payment order ${pendingOrder.orderId} initialized. Complete payment to activate ${tier} subscription.`,
    });
  } catch (error: any) {
    console.error('[Checkout Session Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
