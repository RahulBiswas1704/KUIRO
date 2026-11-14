export type PlatformKey = 'instagram' | 'linkedin' | 'x' | 'whatsapp' | 'email';

export interface ChannelConfig {
  platform: PlatformKey;
  name: string;
  handle: string;
  platformAccountId: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'REVOKED';
  scopes: string[];
  expiresInDays: number;
  isConfigured: boolean;
  color: string;
  badge: string;
  description: string;
}

export const DEFAULT_CHANNELS: ChannelConfig[] = [
  {
    platform: 'instagram',
    name: 'Instagram Graph API',
    handle: '@sharmaheritage',
    platformAccountId: 'act_ig_948271',
    status: 'CONNECTED',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
    expiresInDays: 58,
    isConfigured: true,
    color: 'text-pink-500',
    badge: 'Active',
    description: 'Publishes 4:5 visual carousels, reels, and captions to your Instagram Professional account.',
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn Company Page',
    handle: 'Sharma Heritage Retail & Studio',
    platformAccountId: 'urn:li:organization:8472910',
    status: 'CONNECTED',
    scopes: ['w_organization_social', 'r_organization_social'],
    expiresInDays: 365,
    isConfigured: true,
    color: 'text-blue-500',
    badge: 'Active',
    description: 'Publishes thought-leadership editorial posts and 1:1 banners directly to your Organization Page.',
  },
  {
    platform: 'x',
    name: 'X (Twitter) Developer App',
    handle: '@sharmaheritage_in',
    platformAccountId: 'x_app_2984102',
    status: 'CONNECTED',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'zero_link_surcharge_guard'],
    expiresInDays: 180,
    isConfigured: true,
    color: 'text-sky-400',
    badge: 'Active',
    description: 'Autonomous 240-char tweets with automatic first-comment link placement to avoid X API link surcharges.',
  },
  {
    platform: 'whatsapp',
    name: 'Meta WhatsApp Cloud API',
    handle: '+91 98301 24589',
    platformAccountId: 'waba_948102948',
    status: 'CONNECTED',
    scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
    expiresInDays: 365,
    isConfigured: true,
    color: 'text-emerald-400',
    badge: 'Verified',
    description: 'Sends interactive campaign contact-sheet previews 48 hours early for passive approval or voice revisions.',
  },
  {
    platform: 'email',
    name: 'Transactional & Campaign ESP (DKIM)',
    handle: 'hello@kuiro.in',
    platformAccountId: 'esp_ses_verified',
    status: 'CONNECTED',
    scopes: ['email_send', 'domain_dkim_verified'],
    expiresInDays: 730,
    isConfigured: true,
    color: 'text-amber-400',
    badge: 'DKIM Pass',
    description: 'Sends branded newsletters, customer product drops, and announcement updates using authenticated domain credentials.',
  },
];

