'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  X,
  Zap,
  DollarSign,
  ShieldCheck,
  Send,
  Copy
} from 'lucide-react';

export interface GeneratedPaymentData {
  invoiceId: string;
  customerName: string;
  itemDescription: string;
  amount: number;
  formattedMessage: string;
  paymentUrl: string;
}

interface InChatPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerHandle: string;
  channel: string;
  onInsertPaymentLink: (data: GeneratedPaymentData) => void;
}

export default function InChatPaymentModal({
  isOpen,
  onClose,
  customerName,
  customerHandle,
  channel,
  onInsertPaymentLink,
}: InChatPaymentModalProps) {
  const [itemDescription, setItemDescription] = useState('2x Pure Silk Banarasi Dupattas (Crimson & Gold)');
  const [amount, setAmount] = useState('14500');
  const [paymentType, setPaymentType] = useState<'upi' | 'all'>('upi');
  const [expiryHours, setExpiryHours] = useState('24');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const numericAmount = Math.max(1, parseInt(amount.replace(/[^0-9]/g, '') || '0', 10));
  const invoiceId = `inv_${Date.now().toString().slice(-6)}`;
  const paymentUrl = `https://pay.kuiro.in/upi/${invoiceId}`;

  // Formatted Commercial Message for In-Chat WhatsApp / DM Dispatch
  const formattedPaymentMessage = `🛍️ *Order Confirmation & Payment Link*
Customer: ${customerName}
Item: ${itemDescription}
Amount Due: ₹${numericAmount.toLocaleString('en-IN')} (incl. GST & Insured Dispatch)

👉 *Click to Pay via UPI / Cards:*
${paymentUrl}
(Supports Google Pay, PhonePe, Paytm, BHIM & NetBanking)

⏱️ *Link Valid For:* ${expiryHours} Hours
Your order will be packed and dispatched upon confirmation!`;

  const handleInsert = () => {
    onInsertPaymentLink({
      invoiceId,
      customerName,
      itemDescription,
      amount: numericAmount,
      formattedMessage: formattedPaymentMessage,
      paymentUrl,
    });
    onClose();
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText?.(formattedPaymentMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-inter text-[#0B0F14]">
      <div className="bg-white rounded-[20px] max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CreditCard size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sora text-sm font-bold text-gray-900">
                  Generate Instant UPI / Payment Link
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                  Instant Close
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Create a trackable checkout link for {customerName} ({channel})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <label className="text-[10px] font-mono uppercase text-gray-400 font-bold block mb-1.5">
              Quick Item Presets:
            </label>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { name: 'Bridal Silk Set', amt: 28000 },
                { name: '2x Festive Dupattas', amt: 14500 },
                { name: 'Consultation Deposit', amt: 5000 },
                { name: 'Corporate Hamper (Qty 10)', amt: 35000 },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setItemDescription(p.name);
                    setAmount(String(p.amt));
                  }}
                  className="px-2.5 py-1 rounded-[6px] bg-gray-100 hover:bg-orange-50 hover:text-[#FF7A00] text-gray-700 text-[11px] font-medium transition border border-gray-200"
                >
                  {p.name} (₹{(p.amt / 1000).toFixed(0)}k)
                </button>
              ))}
            </div>
          </div>

          {/* Item Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Order / Item Description
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] border border-gray-300 text-xs focus:outline-none focus:border-emerald-600 font-medium"
              placeholder="e.g. 2x Pure Silk Banarasi Dupattas (Crimson & Gold)"
            />
          </div>

          {/* Amount & Expiry Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Order Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-400 font-mono text-xs">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-[10px] border border-gray-300 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                  placeholder="14500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Link Expiry Window
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                className="w-full px-3 py-2 rounded-[10px] border border-gray-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
              >
                <option value="12">12 Hours (Urgent Reserve)</option>
                <option value="24">24 Hours (Standard)</option>
                <option value="48">48 Hours (Weekend Promo)</option>
                <option value="168">7 Days (Wholesale PO)</option>
              </select>
            </div>
          </div>

          {/* Live In-Chat Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold block">
                Formatted WhatsApp Message Preview:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium"
              >
                {copied ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3 rounded-[12px] bg-emerald-50/60 border border-emerald-200 text-emerald-950 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {formattedPaymentMessage}
            </div>
          </div>

          {/* Trust strip */}
          <div className="p-2.5 rounded-[10px] bg-gray-50 border border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Razorpay &amp; UPI Verified</span>
            </span>
            <span>Zero Manual Followup</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[10px] bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleInsert}
            className="px-5 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold font-sora shadow-sm transition flex items-center gap-1.5"
          >
            <span>Insert Pay Link into Chat</span>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
