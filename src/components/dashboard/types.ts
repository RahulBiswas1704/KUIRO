export type DashboardPlatformTab = 'instagram' | 'whatsapp' | 'linkedin' | 'x' | 'email';

export type ComposerTriggerType =
  | 'FLASH_SALE'
  | 'PRODUCT_DROP'
  | 'SEASONAL'
  | 'THOUGHT_LEADERSHIP';

export interface PlatformPost {
  id: string;
  campaignId: string;
  platform: DashboardPlatformTab;
  captionText: string;
  firstCommentText?: string | null;
  emailSubject?: string | null;
  emailHtml?: string | null;
  mediaUrls?: string[] | string;
  aspectRatio?: string;
  aiCriticScore?: number;
}

export interface ScheduledCampaign {
  id: string;
  workspaceId: string;
  triggerType: string;
  topicSummary: string;
  status: 'AUTO_QUEUED' | 'APPROVED' | 'PUBLISHED' | 'PAUSED' | 'FAILED';
  revisionCount: number;
  generateAt: string;
  publishAt: string;
  posts: PlatformPost[];
}

export const COMPOSER_PRESETS: Record<ComposerTriggerType, string[]> = {
  FLASH_SALE: [
    'Weekend Flash Sale: 30% Off Storewide for Next 48 Hours',
    'Midnight Clearance: Final 25 Limited Edition Units at Special Pricing',
    'Flash Promo: Free Premium Gift with Every Order Above ₹1,999',
    'Urgent Weekend Special: Priority Client Slots with 20% Cashback',
  ],
  PRODUCT_DROP: [
    'New Collection Drop: Handcrafted Pure Silk & Zari Weaves for Spring',
    'Product Launch: Next-Gen Natural Formulation Crafted for Daily Wear',
    'Introducing Our Private Advisory Studio: 1-on-1 Growth Consultations',
    'Exclusive Menu Reveal: Chef Special Seasonal Artisanal Tasting Series',
  ],
  SEASONAL: [
    'Diwali Gifting Guide: Bespoke Corporate & Family Gift Boxes',
    'Holi Festival Color & Style Celebration: Modern Indian Festive Wear',
    'Independence Day Pride Sale: Made In India Craftsmanship Spotlight',
    'New Year New Horizons: Refresh Your Brand & Strategy for 2026',
  ],
  THOUGHT_LEADERSHIP: [
    '3 Hard-Learned Lessons from 10 Years of Running an Independent Business',
    'Why True Brand Authenticity Always Outperforms Discount Chasing',
    'The Shift to Autonomous Workflows: How Small Teams Compete with Giants',
    'Behind the Scenes: The Real Supply Chain and Craft of Made-in-India Goods',
  ],
};
