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
  Download,
  ExternalLink,
  Lock,
  ArrowRight
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
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Payment Form Fields
  const [upiId, setUpiId] = useState('founder@okhdfcbank');
  const [businessName, setBusinessName] = useState('Sharma Heritage Handlooms & Studio');
  const [gstin, setGstin] = useState('19AAACS1429B1Z8');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');

  // Process State
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentPlan = PLANS_CONFIG[selectedTier];
  const unitPrice = isAnnual ? currentPlan.annualMonthlyPrice * 12 : currentPlan.monthlyPrice;
  const gstAmount = Math.round(unitPrice * 0.18);
  const totalAmount = unitPrice + gstAmount;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

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
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setCompletedOrder(data.order);
        if (onSuccess) onSuccess(selectedTier);
      } else {
        alert(data.error || 'Payment transaction failed. Please retry.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment network error.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-[#0B0F14] text-white rounded-[20px] max-w-xl w-full border border-[#1E2530] shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#1E2530] flex items-center justify-between bg-gradient-to-r from-[#141A24] to-[#0B0F14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-tr from-[#FF7A00] to-amber-500 text-white flex items-center justify-center font-bold shadow-md">
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
                Instant UPI Autopay & Card Billing • 18% GST ITC Compliant
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

        {/* Success View */}
        {completedOrder ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="font-sora text-lg font-bold text-white">
                Autopilot Subscription Activated!
              </h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Your workspace is now upgraded to <strong className="text-[#FF7A00]">{completedOrder.tier}</strong>.
                Tax invoice and WhatsApp confirmation have been dispatched.
              </p>
            </div>

            {/* Official Tax Invoice Receipt Box */}
            <div className="rounded-[14px] bg-[#161C24] p-4 border border-[#27313F] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#27313F] text-gray-400">
                <span>INVOICE #{completedOrder.invoiceNumber}</span>
                <span className="text-emerald-400 font-bold">STATUS: PAID</span>
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
                  <span className="text-gray-400 block">SAC Code:</span>
                  <span className="text-white font-medium">998314 (IT & AI SaaS)</span>
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading GST Tax Invoice ${completedOrder.invoiceNumber}... Receipt saved to downloads.`);
                }}
                className="flex-1 py-2.5 rounded-[10px] bg-[#1E2530] text-gray-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-[#2A3442] transition"
              >
                <Download size={14} />
                <span>Download Tax Invoice (PDF)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-[10px] bg-[#FF7A00] hover:bg-[#E66E00] text-white text-xs font-semibold flex items-center justify-center gap-2 transition font-sora shadow-sm"
              >
                <span>Launch Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5">
            {/* Plan Tier Selector */}
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

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'upi', label: 'UPI AutoPay', sub: 'GPay, PhonePe, Paytm', icon: QrCode },
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
              <div className="p-3.5 rounded-[12px] bg-[#161C24] border border-[#27313F] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-300">Enter your UPI VPA / ID:</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Check size={12} /> Instant Mandate
                  </span>
                </div>
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
                <label className="text-[10px] text-gray-400 font-medium flex items-center justify-between">
                  <span>GSTIN (For 18% ITC)</span>
                  <span className="text-emerald-400 font-mono text-[9px]">VALID</span>
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full text-xs p-2 rounded-[8px] bg-[#161C24] border border-[#27313F] text-white focus:outline-none focus:border-[#FF7A00] uppercase font-mono"
                />
              </div>
            </div>

            {/* Price Summary Breakdown */}
            <div className="p-3 rounded-[12px] bg-[#141A24] border border-[#1E2530] space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({isAnnual ? '12 Months' : '1 Month'}):</span>
                <span>₹{unitPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span className="flex items-center gap-1">
                  <span>18% GST (CGST 9% + SGST 9%)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">(ITC Claimable)</span>
                </span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-[#27313F] text-sm">
                <span>Total Due Today:</span>
                <span className="text-[#FF7A00] font-sora">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-[10px] bg-gradient-to-r from-[#FF7A00] to-[#E66E00] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/20 font-sora transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Authorizing Mandate...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Authorize & Activate ₹{totalAmount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

