import { Inngest } from 'inngest';

export type KuiroEvents = {
  'kuiro/campaign.initiate': {
    data: {
      campaignId: string;
      workspaceId: string;
      publishAt: string;
      triggerType?: 'FESTIVAL' | 'EVERGREEN' | 'TREND' | 'MANUAL';
      eventName?: string;
    };
  };
  'whatsapp/admin.action': {
    data: {
      campaignId: string;
      action: 'APPROVE' | 'EDIT' | 'SKIP' | 'EMERGENCY_PAUSE';
      instruction?: string;
      audioUrl?: string;
      timestamp: string;
    };
  };
  'kuiro/campaign.revise': {
    data: {
      campaignId: string;
      workspaceId: string;
      instruction: string;
      source: 'WHATSAPP_VOICE' | 'WHATSAPP_TEXT' | 'DASHBOARD';
    };
  };
};

export const inngest = new Inngest({
  id: 'kuiro-autopilot-engine',
  eventKey: process.env.INNGEST_EVENT_KEY || 'local_kuiro_event_key',
});
