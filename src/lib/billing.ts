import crypto from 'crypto';

export type PlanTier = 'STARTER' | 'GROWTH' | 'AGENCY';
export type BillingCycle = 'monthly' | 'annual';

export interface PendingOrder {
  orderId: string;
  orderToken: string;
  workspaceId: string;
  tier: PlanTier;
  billingCycle: BillingCycle;
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID_ACTIVE' | 'EXPIRED' | 'FAILED';
  paymentMethod: string;
  gateway: string;
  businessName: string;
  gstin: string;
  createdAt: number;
  expiresAt: number;
}

export const TIER_PRICING: Record<PlanTier, { monthly: number; annual: number }> = {
  STARTER: { monthly: 1199, annual: 999 * 12 },
  GROWTH: { monthly: 2799, annual: 2299 * 12 },
  AGENCY: { monthly: 11999, annual: 9999 * 12 },
};

const BILLING_SECRET =
  process.env.RAZORPAY_KEY_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.BILLING_WEBHOOK_SECRET ||
  'kuiro_billing_master_secret_2026';

// Global cache of pending orders with 30-min TTL (attached to globalThis for Next.js singleton stability)
const globalForBilling = globalThis as unknown as {
  pendingOrdersStore?: Map<string, PendingOrder>;
  processedBillingEventsStore?: Map<string, number>;
};

const pendingOrdersStore =
  globalForBilling.pendingOrdersStore ?? new Map<string, PendingOrder>();
globalForBilling.pendingOrdersStore = pendingOrdersStore;

const processedBillingEventsStore =
  globalForBilling.processedBillingEventsStore ?? new Map<string, number>();
globalForBilling.processedBillingEventsStore = processedBillingEventsStore;

export function generateOrderToken(
  orderId: string,
  workspaceId: string,
  tier: string,
  amount: number,
  cycle: string
): string {
  return crypto
    .createHmac('sha256', BILLING_SECRET)
    .update(`${orderId}:${workspaceId}:${tier}:${amount}:${cycle}`)
    .digest('hex');
}

export function verifyOrderToken(
  orderToken: string,
  orderId: string,
  workspaceId: string,
  tier: string,
  amount: number,
  cycle: string
): boolean {
  if (!orderToken) return false;
  const expected = generateOrderToken(orderId, workspaceId, tier, amount, cycle);
  try {
    return crypto.timingSafeEqual(Buffer.from(orderToken), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createPendingOrder(data: {
  workspaceId: string;
  tier: PlanTier;
  billingCycle: BillingCycle;
  paymentMethod: string;
  gateway: string;
  businessName?: string;
  gstin?: string;
}): PendingOrder {
  const pricing = TIER_PRICING[data.tier];
  const baseAmount = data.billingCycle === 'annual' ? pricing.annual : pricing.monthly;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;

  const orderId = `order_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  const orderToken = generateOrderToken(orderId, data.workspaceId, data.tier, totalAmount, data.billingCycle);

  const now = Date.now();
  const pendingOrder: PendingOrder = {
    orderId,
    orderToken,
    workspaceId: data.workspaceId,
    tier: data.tier,
    billingCycle: data.billingCycle,
    baseAmount,
    gstAmount,
    totalAmount,
    currency: 'INR',
    status: 'PENDING',
    paymentMethod: data.paymentMethod,
    gateway: data.gateway,
    businessName: data.businessName || 'Valued KUIRO Enterprise',
    gstin: data.gstin || '19AAACS1429B1Z8',
    createdAt: now,
    expiresAt: now + 30 * 60 * 1000, // 30 minutes TTL
  };

  pendingOrdersStore.set(orderId, pendingOrder);
  return pendingOrder;
}

export function getPendingOrder(orderId: string): PendingOrder | undefined {
  const order = pendingOrdersStore.get(orderId);
  if (!order) return undefined;
  if (Date.now() > order.expiresAt) {
    pendingOrdersStore.delete(orderId);
    return undefined;
  }
  return order;
}

export function markOrderPaid(orderId: string): PendingOrder | undefined {
  const order = pendingOrdersStore.get(orderId);
  if (order) {
    order.status = 'PAID_ACTIVE';
    pendingOrdersStore.set(orderId, order);
  }
  return order;
}

export function isDuplicateBillingEvent(eventId: string, ttlMs = 24 * 60 * 60 * 1000): boolean {
  if (!eventId) return false;
  const now = Date.now();
  if (processedBillingEventsStore.size > 10000) {
    for (const [id, ts] of processedBillingEventsStore.entries()) {
      if (now - ts > ttlMs) {
        processedBillingEventsStore.delete(id);
      }
    }
  }
  if (processedBillingEventsStore.has(eventId)) {
    return true;
  }
  processedBillingEventsStore.set(eventId, now);
  return false;
}

export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  customSecret?: string
): { valid: boolean; status: number; error?: string } {
  const secret =
    customSecret ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.BILLING_WEBHOOK_SECRET ||
    (process.env.NODE_ENV !== 'production' ? 'kuiro_razorpay_webhook_secret_secure_32chars' : '');

  if (!secret) {
    console.error('[Razorpay Webhook Critical] RAZORPAY_WEBHOOK_SECRET not configured on server.');
    return {
      valid: false,
      status: 500,
      error: 'Server configuration error: Razorpay webhook secret missing.',
    };
  }

  if (!signatureHeader) {
    console.warn('[Razorpay Webhook Alert] Missing X-Razorpay-Signature header.');
    return {
      valid: false,
      status: 401,
      error: 'Unauthorized: Missing X-Razorpay-Signature header.',
    };
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');

  const sigBuf = Buffer.from(signatureHeader, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    console.warn('[Razorpay Webhook Security Alert] Cryptographic signature mismatch. Forged request rejected.');
    return {
      valid: false,
      status: 401,
      error: 'Unauthorized: Invalid signature.',
    };
  }

  return { valid: true, status: 200 };
}

export function validatePlanAmount(
  amount: number,
  tier: PlanTier,
  billingCycle: BillingCycle = 'monthly'
): { valid: boolean; expectedPaise: number; expectedRupees: number } {
  const pricing = TIER_PRICING[tier];
  if (!pricing) {
    return { valid: false, expectedPaise: 0, expectedRupees: 0 };
  }
  const baseRupees = billingCycle === 'annual' ? pricing.annual : pricing.monthly;
  const gstRupees = Math.round(baseRupees * 0.18);
  const totalRupees = baseRupees + gstRupees;

  const totalPaise = totalRupees * 100;
  const basePaise = baseRupees * 100;

  // Accept total amount in paise, total in rupees, or base (ex-tax) amount in paise/rupees
  const valid =
    amount === totalPaise ||
    amount === totalRupees ||
    amount === basePaise ||
    amount === baseRupees;

  return {
    valid,
    expectedPaise: totalPaise,
    expectedRupees: totalRupees,
  };
}
