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

// Global cache of pending orders with 30-min TTL
const pendingOrdersStore = new Map<string, PendingOrder>();

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
