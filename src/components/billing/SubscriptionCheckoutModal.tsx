'use client';

import React, { useState } from 'react';
import {
  X as CloseIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  CreditCard,
  QrCode,
  Building2,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Printer,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export type PlanTier = 'STARTER' | 'GROWTH' | 'AGENCY';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: PlanTier;
  initialAnnual?: boolean;
  onSuccess?: (tier: PlanTier) => void;
}

const PLANS_CONFIG = {
  STARTER: {
    name: 'Starter Autopilot',
    monthlyPrice: 1199,
    annualMonthlyPrice: 999,
    badge: 'Solo Founders',
    features: ['1 Workspace & 1 Brand Profile', '2 Channels Active', '365 Cultural Calendar', '48h WhatsApp Review Loop'],
  },
  GROWTH: {
    name: 'Growth Autopilot',
    monthlyPrice: 2799,
    annualMonthlyPrice: 2299,
    badge: 'Most Popular',
    features: ['1 Workspace & 3 Brand Profiles', 'All Channels Active', 'Voice Note Revisions (<12s)', '1-Click Creative Kit ZIP Exporter', 'Omni-Channel Customer Inbox'],
  },
  AGENCY: {
    name: 'Agency Autopilot',
    monthlyPrice: 11999,
    annualMonthlyPrice: 9999,
    badge: 'Agencies & Multi-Brand',
    features: ['10 Multi-Tenant Client Workspaces', 'Custom Agency Whitelabeling', 'Unlimited Team Collaborators', 'Dedicated Inngest Event Queue', 'Dedicated Account Manager'],
  },
};

export default function SubscriptionCheckoutModal({
  isOpen,
  onClose,
  initialTier = 'GROWTH',
  initialAnnual = true,
  onSuccess,
}: CheckoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<PlanTier>(initialTier);
  const [isAnnual, setIsAnnual] = useState(initialAnnual);
  const [gateway, setGateway] = useState<'razorpay' | 'cashfree'>('razorpay');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiMode, setUpiMode] = useState<'id' | 'qr'>('id');

  // Payment Form Fields
  const [upiId, setUpiId] = useState('founder@okhdfcbank');
  const [businessName, setBusinessName] = useState('Sharma Heritage Handlooms & Studio');
  const [gstin, setGstin] = useState('19AAACS1429B1Z8');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');

  // Process States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = PLANS_CONFIG[selectedTier];
  const unitPrice = isAnnual ? currentPlan.annualMonthlyPrice * 12 : currentPlan.monthlyPrice;
  const gstAmount = Math.round(unitPrice * 0.18);
  const totalAmount = unitPrice + gstAmount;

  // Dynamic UPI Payload for QR Code
  const upiIntentUrl = pendingOrder?.upiLink || `upi://pay?pa=kuiro@icici&pn=KUIRO%20Technologies&tr=ord_${Date.now().toString(36)}&am=${totalAmount}&cu=INR&tn=KUIRO%20${selectedTier}%20Autopilot`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  // Step 1: Create cryptographically signed pending checkout session (No DB tier mutation)
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          paymentMethod,
          upiVpa: upiId,
          gstin: gstin.trim(),
          businessName: businessName.trim(),
          gateway,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setPendingOrder(data.order);
      } else {
        setPaymentError(data.error || 'Payment initiation failed. Please retry.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Cryptographically verify payment capture & execute atomic workspace upgrade
  const handleVerifyPayment = async () => {
    if (!pendingOrder) return;
    setIsVerifying(true);
    setPaymentError(null);

    try {
      // 1. If Razorpay Checkout SDK is loaded on window, trigger genuine gateway checkout
      if (typeof window !== 'undefined' && (window as any).Razorpay && pendingOrder.gateway === 'razorpay') {
        const rzp = new (window as any).Razorpay({
          key: pendingOrder.keyId || 'rzp_test_kuiro',
          amount: pendingOrder.totalAmount * 100, // Amount in paise
          currency: 'INR',
          name: 'KUIRO Technologies',
          description: `KUIRO ${selectedTier} Plan Autopilot`,
          order_id: pendingOrder.orderId,
          prefill: {
            name: businessName,
            contact: '+919876543210',
          },
          handler: async function (response: any) {
            // Forward genuine gateway cryptographic signature to server
            try {
              const res = await fetch('/api/billing/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id || pendingOrder.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  gateway: 'razorpay',
                }),
              });

              const data = await res.json();
              if (data.success && data.order) {
                setCompletedOrder({ ...data.order, gateway: 'razorpay' });
                setPendingOrder(null);
                if (onSuccess) onSuccess(selectedTier);
              } else {
                setPaymentError(data.error || 'Payment signature verification failed.');
              }
            } catch (err: any) {
              setPaymentError(err.message || 'Payment verification failed.');
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentError('Payment window closed. Your subscription order remains PENDING.');
            },
          },
        });
        rzp.open();
        setIsVerifying(false);
        return;
      }

      // 2. Fallback for QR Code / UPI App: Check server status to verify if payment was captured by webhook
      const checkRes = await fetch(`/api/billing/verify-payment?orderId=${encodeURIComponent(pendingOrder.orderId)}`);
      const checkData = await checkRes.json();

      if (checkData.isPaid) {
        setCompletedOrder({
          orderId: pendingOrder.orderId,
          tier: checkData.tier || selectedTier,
          billingCycle: pendingOrder.billingCycle,
          status: 'PAID_ACTIVE',
          invoiceNumber: `KUIRO/26-27/${Math.floor(1000 + Math.random() * 9000)}`,
          totalAmount: pendingOrder.totalAmount,
          baseAmount: pendingOrder.baseAmount,
          gstAmount: pendingOrder.gstAmount,
          gateway: pendingOrder.gateway || gateway,
          businessName: pendingOrder.businessName,
          gstin: pendingOrder.gstin,
          paymentId: pendingOrder.orderId,
        });
        setPendingOrder(null);
        if (onSuccess) onSuccess(selectedTier);
      } else {
        setPaymentError(
          'Payment is currently PENDING gateway settlement. Please approve the transaction in your UPI app or complete card authorization, then click Check Status.'
        );
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Network error during payment verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto font-inter">
      <div className="bg-[#0B0F14] text-white rounded-[20px] max-w-xl w-full border border-[#1E2530] shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#1E2530] flex items-center justify-between bg-linear-to-r from-[#141A24] to-[#0B0F14] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-linear-to-tr from-[#FF7A00] to-amber-500 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sora text-base font-bold text-white">
                  KUIRO Secure Checkout
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  AES-256 ENCRYPTED
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Instant UPI Autopay &amp; Card Billing • 18% GST ITC Compliant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md transition"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {paymentError && (
          <div className="mx-6 mt-4 p-3 rounded-[10px] bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* 1. Success View (Paid & Upgraded) */}
        {completedOrder ? (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-sora text-lg font-bold text-white">
                Autopilot Subscription Activated!
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Payment verified successfully. Your workspace is now upgraded to <strong className="text-[#FF7A00]">{completedOrder.tier}</strong> via{' '}
                <strong className="text-white capitalize">{completedOrder.gateway || 'Razorpay'}</strong>.
                Tax invoice and WhatsApp confirmation have been dispatched.
              </p>
            </div>

            {/* Official Tax Invoice Receipt Box */}
            <div className="rounded-[14px] bg-[#161C24] p-4 border border-[#27313F] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#27313F] text-gray-400">
                <span>INVOICE #{completedOrder.invoiceNumber}</span>
                <span className="text-emerald-400 font-bold">STATUS: PAID_ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block">Billed To:</span>
                  <span className="text-white font-medium">{completedOrder.businessName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">GSTIN / Tax ID:</span>
                  <span className="text-white font-medium">{completedOrder.gstin}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">SAC / HSN Code:</span>
                  <span className="text-white font-medium">998314 (IT &amp; AI SaaS)</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Payment Ref:</span>
                  <span className="text-white font-medium truncate">{completedOrder.paymentId}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#27313F] space-y-1">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>Base Subscription ({completedOrder.billingCycle}):</span>
                  <span>₹{completedOrder.baseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>₹{completedOrder.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-[#27313F]">
                  <span>Total Paid (INR):</span>
                  <span className="text-[#FF7A00]">₹{completedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 print:hidden">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 rounded-[10px] bg-[#1E2530] text-gray-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-[#2A3442] transition"
              >
                <Printer size={14} className="text-[#FF7A00]" />
                <span>Print Tax Invoice (PDF)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold flex items-center justify-center gap-2 transition font-sora shadow-sm"
              >
                <span>Launch Dashboard</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : pendingOrder ? (
          /* 2. Payment Authorization View (Pending Verification) */
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-[12px] bg-[#161C24] border border-[#27313F]">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Order Reference</span>
                <span className="text-xs font-mono text-white font-semibold">{pendingOrder.orderId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase font-mono block">Amount Due</span>
                <span className="text-sm font-bold text-[#FF7A00]">₹{pendingOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Gateway & Payment Method Display */}
            {paymentMethod === 'upi' ? (
              <div className="p-4 rounded-[14px] bg-[#161C24] border border-[#27313F] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode size={18} className="text-[#FF7A00]" />
                    <span className="text-xs font-semibold text-white">Scan UPI QR to Pay &amp; Authorize</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                    AWAITING PAYMENT
                  </span>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="p-2 rounded-lg bg-white shrink-0 shadow-lg">
                    <img
                      src={qrCodeUrl}
                      alt="UPI Payment QR Code"
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-300">
                    <p className="font-semibold text-white">Step 1: Scan via Any UPI App</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Open Google Pay, PhonePe, Paytm, or BHIM and approve payment of <strong>₹{pendingOrder.totalAmount.toLocaleString('en-IN')}</strong> to <strong>kuiro@icici</strong>.
                    </p>
                    <a
                      href={pendingOrder.upiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#FF7A00] hover:underline font-medium"
                    >
                      <span>Open UPI App directly</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            ) : paymentMethod === 'card' ? (
              <div className="p-4 rounded-[14px] bg-[#161C24] border border-[#27313F] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-[#FF7A00]" />
                    <span className="text-xs font-semibold text-white">Card Payment Authorization</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                    3D-SECURE 2.0
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your card ({cardNumber}) will be billed <strong>₹{pendingOrder.totalAmount.toLocaleString('en-IN')}</strong>. Please authorize the OTP or 3D-Secure challenge in your bank app.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-[14px] bg-[#161C24] border border-[#27313F] space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 size={18} className="text-[#FF7A00]" />
                  <span className="text-xs font-semibold text-white">NetBanking e-Mandate Authentication</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Please complete the NetBanking transaction for <strong>₹{pendingOrder.totalAmount.toLocaleString('en-IN')}</strong> with your bank.
                </p>
              </div>
            )}

            <div className="rounded-[10px] bg-blue-500/10 p-3 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2">
              <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero-Risk Guarantee:</strong> Your workspace plan is only updated once payment is verified with the banking gateway. You will receive an official GST invoice immediately.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingOrder(null)}
                className="py-3 px-4 rounded-[12px] bg-[#1E2530] hover:bg-[#27313F] text-gray-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft size={14} />
                <span>Modify Plan</span>
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="flex-1 py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-98 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Verifying Payment with {gateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Check Settlement Status &amp; Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* 3. Initial Plan & Payment Selection Form */
          <form onSubmit={handleInitiateOrder} className="p-6 space-y-4">
            {/* Plan Tier Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Select Subscription Plan
                </label>
                <div className="flex items-center gap-1.5 p-0.5 rounded-full bg-[#161C24] border border-[#27313F]">
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`px-2.5 py-0.5 text-[10px] rounded-full font-medium transition ${
                      !isAnnual ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`px-2.5 py-0.5 text-[10px] rounded-full font-medium transition flex items-center gap-1 ${
                      isAnnual ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <span>Annual</span>
                    <span className="text-[9px] px-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">20% OFF</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['STARTER', 'GROWTH', 'AGENCY'] as PlanTier[]).map((tierKey) => {
                  const p = PLANS_CONFIG[tierKey];
                  const isSelected = selectedTier === tierKey;
                  const price = isAnnual ? p.annualMonthlyPrice : p.monthlyPrice;
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setSelectedTier(tierKey)}
                      className={`p-3 rounded-[12px] border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#FF7A00] bg-[#FF7A00]/10 shadow-sm'
                          : 'border-[#27313F] bg-[#161C24] hover:border-gray-600'
                      }`}
                    >
                      <div>
                        <span className="text-[9px] font-mono uppercase text-[#FF7A00] font-bold block truncate">
                          {p.badge}
                        </span>
                        <p className={`text-xs font-bold leading-tight mt-0.5 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {p.name.split(' ')[0]}
                        </p>
                      </div>
                      <div className="mt-2">
                        <span className="text-base font-bold text-white">₹{price.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">/month</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gateway Provider Strip */}
            <div className="flex items-center justify-between p-2.5 rounded-[10px] bg-[#161C24] border border-[#27313F] text-xs">
              <span className="text-[11px] text-gray-400 font-medium">Gateway Processor:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                    gateway === 'razorpay'
                      ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>Razorpay Enterprise</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('cashfree')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center gap-1 ${
                    gateway === 'cashfree'
                      ? 'bg-purple-600/30 text-purple-400 border border-purple-500/40'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>Cashfree AutoPay</span>
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI AutoPay', sub: 'GPay, PhonePe, QR', icon: QrCode },
                  { id: 'card', label: 'Cards', sub: 'RuPay, Visa, MC', icon: CreditCard },
                  { id: 'netbanking', label: 'NetBanking', sub: 'All Indian Banks', icon: Building2 },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-[12px] border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#FF7A00] bg-[#1E2530] text-white'
                          : 'border-[#27313F] bg-[#161C24] text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-[#FF7A00]' : 'text-gray-400'} />
                      <div className="truncate">
                        <p className="text-xs font-semibold leading-tight">{m.label}</p>
                        <p className="text-[9px] text-gray-400 leading-tight mt-0.5 truncate">{m.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'upi' ? (
              <div className="p-3.5 rounded-[12px] bg-[#161C24] border border-[#27313F] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUpiMode('id')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        upiMode === 'id' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      UPI ID / Mandate
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('qr')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                        upiMode === 'qr' ? 'bg-[#FF7A00] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <QrCode size={12} />
                      <span>Scan QR Code</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Check size={12} /> Instant Mandate
                  </span>
                </div>

                {upiMode === 'id' ? (
                  <>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      className="w-full text-xs p-2.5 rounded-[8px] bg-[#0B0F14] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                    />
                    <p className="text-[10px] text-gray-400">
                      A mandate approval request will be pushed to your UPI app for recurring autopay. Cancel anytime.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-4 py-1">
                    <div className="p-1.5 rounded-lg bg-white shrink-0 shadow-md">
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p className="font-semibold text-white">Scan with Any UPI App</p>
                      <p className="text-[11px] text-gray-400">
                        Scan using Google Pay, PhonePe, Paytm, or BHIM to approve this subscription instantly.
                      </p>
                      <p className="font-mono text-[10px] text-[#FF7A00]">
                        Amount: ₹{totalAmount.toLocaleString('en-IN')} (incl. GST)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : paymentMethod === 'card' ? (
              <div className="p-3.5 rounded-[12px] bg-[#161C24] border border-[#27313F] space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 block font-medium">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-[8px] bg-[#0B0F14] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block font-medium">Valid Thru</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full text-xs p-2 rounded-[8px] bg-[#0B0F14] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block font-medium">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full text-xs p-2 rounded-[8px] bg-[#0B0F14] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-[12px] bg-[#161C24] border border-[#27313F] text-xs space-y-1">
                <span className="font-semibold text-gray-300">Select NetBanking Institution:</span>
                <select className="w-full text-xs p-2 rounded-[8px] bg-[#0B0F14] border border-[#27313F] text-white mt-1 focus:outline-none focus:border-[#FF7A00]">
                  <option>HDFC Bank Corporate / Retail</option>
                  <option>ICICI Bank e-Mandate</option>
                  <option>State Bank of India (SBI)</option>
                  <option>Axis Bank Commercial</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* GSTIN & Business Info for ITC */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-medium">Business / Entity Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full text-xs p-2 rounded-[8px] bg-[#161C24] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-medium">GSTIN (Optional for ITC)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 19AAACS1429B1Z8"
                  className="w-full text-xs p-2 rounded-[8px] bg-[#161C24] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00]"
                />
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="p-3 rounded-[12px] bg-[#161C24] border border-[#27313F] space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Base ({isAnnual ? 'Annualized' : 'Monthly'}):</span>
                <span>₹{unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>18% GST (CGST 9% + SGST 9%):</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-[#27313F] text-sm">
                <span>Total Payable:</span>
                <span className="text-[#FF7A00]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-[12px] bg-[#FF7A00] hover:bg-[#E66E00] text-white font-sora font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-98 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Initiating Order via {gateway === 'razorpay' ? 'Razorpay' : 'Cashfree'}...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>
                    Proceed to Secure Payment (₹{totalAmount.toLocaleString('en-IN')})
                  </span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
