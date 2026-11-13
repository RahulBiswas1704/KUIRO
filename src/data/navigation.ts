export interface NavItem {
  label: string;
  href: string;
  id: 'home' | 'services' | 'pricing' | 'contact' | 'get-started';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', id: 'home' },
  { label: 'Services', href: '/services', id: 'services' },
  { label: 'Pricing', href: '/pricing', id: 'pricing' },
  { label: 'Contact Us', href: '/contact', id: 'contact' },
];

export const SITE_CONFIG = {
  name: 'KUIRO',
  tagline: 'Create / Approve / Grow.',
  headline: 'Your marketing. On autopilot.',
  description: 'Zero-click AI social media and messaging SaaS platform for Indian SMBs, clinics, and marketing agencies.',
  supportWhatsApp: '+91 98765 43210',
  supportWhatsAppLink: 'https://wa.me/919876543210?text=Hi%20KUIRO%20Team%2C%20I%20would%20like%20to%20learn%20more',
  supportEmail: 'hello@kuiro.in',
  copyright: '© 2026 KUIRO Technologies Inc. All rights reserved.',
};

