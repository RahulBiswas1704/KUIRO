import type { ConversationChannel, ConversationStatus, ConversationPriority } from './inbox';

export interface AttributedLeadItem {
  id: string;
  customerName: string;
  customerHandle: string;
  customerAvatar?: string;
  channel: ConversationChannel;
  campaignSource: string;
  lastMessageText: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  tags: string[];
  patientOrClientType?: string;
  estimatedValue: number; // in INR
  isBooked: boolean;
  createdAt: string;
}

export interface CampaignRoiMetric {
  campaignId: string;
  topicSummary: string;
  triggerType: string;
  publishAt: string;
  status: string;
  inquiriesCount: number;
  appointmentsBookedCount: number;
  channels: string[];
  estimatedPipelineValue: number; // in INR
  realizedRevenue: number; // in INR
  roiMultiplier: number; // e.g. 15.4x
  leadConversionRate: number; // e.g. 66%
  topInboundChannel: string;
  recentLeads: AttributedLeadItem[];
}

export interface WorkspaceRoiSummary {
  workspaceId: string;
  workspaceName: string;
  totalAttributedLeads: number;
  totalAppointmentsBooked: number;
  totalPipelineValue: number; // in INR
  totalRealizedRevenue: number; // in INR
  monthlySubscriptionCost: number; // in INR (e.g. 2799)
  netRoiMultiplier: number; // e.g. 52.3x
  overallConversionRate: number; // e.g. 61%
  channelBreakdown: {
    whatsapp: { leads: number; value: number };
    instagram: { leads: number; value: number };
    email: { leads: number; value: number };
    messenger: { leads: number; value: number };
  };
  campaignBreakdown: CampaignRoiMetric[];
}

export interface ExecutiveReportData {
  totalPipelineValue: number;
  totalRealizedRevenue: number;
  totalAttributedLeads: number;
  totalAppointmentsBooked: number;
  estimatedAgencySavings?: number;
  netRoiMultiplier?: number;
  campaignBreakdown?: Array<{
    campaignId: string;
    topicSummary: string;
    triggerType?: string;
    publishAt: string;
    inquiriesCount: number;
    appointmentsBookedCount: number;
    realizedRevenue: number;
    estimatedPipelineValue?: number;
    status: string;
  }>;
}
