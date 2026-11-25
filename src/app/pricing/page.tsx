'use client';

import React, { useState } from 'react';
import { Navbar, Footer } from '@/components/layout';
import SubscriptionCheckoutModal, { PlanTier } from '@/components/billing/SubscriptionCheckoutModal';
import CampaignRoiCalculator from '@/components/marketing/CampaignRoiCalculator';
import { PricingHeroAndPlans, PricingComparisonAndFaq } from '@/components/pricing';

/**
 * Clean, light-editorial KUIRO Pricing Page aligned with the redesigned Homepage & Services experience.
 */
export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutTier, setSelectedCheckoutTier] = useState<PlanTier>('GROWTH');

  const handleOpenCheckout = (tier: PlanTier) => {
    setSelectedCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFD] text-[#0B0F14] flex flex-col font-sans selection:bg-[#FF7A00] selection:text-white relative overflow-x-clip">
      {/* Sticky Frosted-White Floating Pill Navbar */}
      <Navbar activeRoute="pricing" theme="light" floating />

      <main className="flex-1">
        {/* 1. Framed Dusk Hero + 3 Light Editorial Pricing Cards */}
        <PricingHeroAndPlans
          annualBilling={annualBilling}
          onChangeBilling={setAnnualBilling}
          onSelectTier={handleOpenCheckout}
        />

        {/* 2. Light Editorial Interactive Campaign ROI Calculator */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F9FAFD]">
          <div className="max-w-6xl mx-auto p-px rounded-[28px] bg-gradient-to-b from-[#FF8E3C]/55 via-[#FF8E3C]/15 to-transparent">
            <CampaignRoiCalculator theme="light" />
          </div>
        </section>

        {/* 3. Side-by-Side Matrix + Warm Cream FAQ Accordion + Editorial Closing CTA */}
        <PricingComparisonAndFaq onStartTrial={handleOpenCheckout} />
      </main>

      {/* Secure Checkout & Subscription Modal */}
      <SubscriptionCheckoutModal
        key={`${selectedCheckoutTier}-${annualBilling}`}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialTier={selectedCheckoutTier}
        initialAnnual={annualBilling}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          window.location.href = '/dashboard';
        }}
      />

      <Footer theme="light" />
    </div>
  );
}
