export interface WhatsAppPreviewCardOptions {
  recipientPhone: string;
  campaignId: string;
  topicSummary: string;
  previewImageUrl: string;
  publishAtFormatted: string;
}

/**
 * Meta WhatsApp Business Cloud API Client
 */
export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string = 'v21.0';

  constructor() {
    this.phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID || 'mock_phone_id';
    this.accessToken = process.env.META_WA_ACCESS_TOKEN || 'mock_access_token';
  }

  /**
   * Dispatch 48-Hour Preview Notification with Interactive Action Buttons
   */
  async sendPreviewCard({
    recipientPhone,
    campaignId,
    topicSummary,
    previewImageUrl,
    publishAtFormatted,
  }: WhatsAppPreviewCardOptions) {
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'image',
          image: { link: previewImageUrl },
        },
        body: {
          text: `⚡ *KUIRO 48-Hour Post Preview*\n\n🎯 *Topic:* ${topicSummary}\n⏰ *Scheduled Publish:* ${publishAtFormatted}\n\n*Passive Auto-Commit:* If you do not reply or take action, this post will automatically publish at peak engagement.\n\nTo make any change, reply with a voice note or message!`,
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: `BTN_APPROVE_${campaignId}`,
                title: '✅ Approve Now',
              },
            },
            {
              type: 'reply',
              reply: {
                id: `BTN_SKIP_${campaignId}`,
                title: '🛑 Skip This Post',
              },
            },
          ],
        },
      },
    };

    if (process.env.NODE_ENV !== 'production' && !process.env.META_WA_ACCESS_TOKEN) {
      console.log('[Mock WhatsApp] Dispatching preview payload:', JSON.stringify(payload, null, 2));
      return { success: true, messageId: `mock_msg_${Date.now()}` };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  /**
   * Fetch audio media URL from WhatsApp Media API to pass to Whisper / Gemini transcription
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    if (!process.env.META_WA_ACCESS_TOKEN) {
      return 'https://mock-media.kuiro.local/voice_sample.ogg';
    }

    const res = await fetch(`https://graph.facebook.com/${this.apiVersion}/${mediaId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    const data = await res.json();
    return data.url;
  }
}

export const whatsappClient = new WhatsAppClient();
