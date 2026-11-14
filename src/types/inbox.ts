import type { SocialPlatform } from './campaign';

export type ConversationChannel = 'whatsapp' | 'instagram' | 'messenger' | 'email';

export type ConversationStatus = 'open' | 'waiting' | 'resolved' | 'snoozed';

export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'specialist' | 'receptionist' | 'sales' | 'ai_bot';
  avatar?: string;
  isOnline: boolean;
  activeChatsCount: number;
}

export interface InboxMessage {
  id: string;
  conversationId: string;
  channel: ConversationChannel;
  sender: 'customer' | 'agent' | 'ai_bot';
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isInternalNote?: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: {
    type: 'image' | 'document' | 'audio';
    url: string;
    title?: string;
  }[];
  aiGenerated?: boolean;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  customerName: string;
  customerHandle: string; // Phone number, @handle, or email
  customerAvatar?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  priority: ConversationPriority;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  assignedTo?: string; // TeamMember id
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'urgent';
  campaignAttribution?: {
    campaignId?: string;
    campaignName: string;
    triggerDate: string;
    channel: SocialPlatform;
  };
  crmData: {
    phone?: string;
    email?: string;
    city?: string;
    totalSpend?: string;
    patientOrClientType?: string;
    lastVisitDate?: string;
    notes?: string;
  };
  messages: InboxMessage[];
}

export interface AutomationFlowRule {
  id: string;
  name: string;
  description: string;
  triggerType: 'KEYWORD' | 'OFF_HOURS' | 'NEW_CONVERSATION' | 'CAMPAIGN_REPLY';
  channel: ConversationChannel | 'all';
  keywords?: string[];
  conditions: string;
  actions: {
    type: 'AUTO_REPLY' | 'ASSIGN_AGENT' | 'APPLY_TAG' | 'ROUTE_SPECIALIST';
    payload: string;
  }[];
  enabled: boolean;
  triggerCount: number;
}

export interface InboxAnalyticsSummary {
  totalConversations: number;
  averageFirstResponseMinutes: number;
  resolutionRatePercent: number;
  aiHandledPercent: number;
  csatScore: number;
  channelDistribution: {
    whatsapp: number;
    instagram: number;
    messenger: number;
    email: number;
  };
}
