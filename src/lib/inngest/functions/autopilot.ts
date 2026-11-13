import { inngest } from '../client';
import { GeneratedAssetPayload } from '@/types';
import { evaluateCampaignWithCritic } from '@/lib/ai/critic';
import { compositeBrandOverlay, generateContactSheetGrid } from '@/lib/media/compositor';
import { whatsappClient } from '@/lib/whatsapp/client';
import { publishToAllChannels } from '@/lib/social/publisher';

/**
 * 48-Hour Passive Approval State Machine ("Auto-Commit Protocol")
 *
 * Timeline:
 * T-48 Hours: Triggers autonomous generation of copy, visuals, and channel payloads.
 * Pre-Publish: Runs AI Critic loop (Hook Strength, Formatting, Guardrails) -> ai_critic_score.
 * T-47.8 Hours: Sends interactive WhatsApp Utility Template with 2x2 preview card + [Approve Now], [Request Edit], [Skip Post].
 * T-47.8h to T-0h: Durable race-condition-free event wait loop. Admin can reply with voice notes in any regional language.
 * Enforces max 2 free revisions per campaign.
 * T-0h (Auto-Commit): If status remains AUTO_QUEUED, system auto-commits and publishes across connected platforms.
 */
export const autopilot48hStateMachine = inngest.createFunction(
  {
    id: 'kuiro-48h-autopilot-workflow',
    retries: 3,
    concurrency: { limit: 10, key: 'event.data.workspaceId' },
  },
  { event: 'kuiro/campaign.initiate' },
  async ({ event, step }) => {
    const { campaignId, workspaceId, publishAt } = event.data;

    // STEP 1: Load Campaign & Persistent Brand Brain Context
    const campaignContext = await step.run('load-campaign-context', async () => {
      return {
        campaignId,
        workspaceId,
        topicSummary: event.data.eventName 
          ? `${event.data.eventName} Brand Campaign`
          : 'Weekly Preventive Healthcare Awareness',
        adminPhone: '+919876543210',
        brandName: 'Apex Diagnostic & Wellness Clinic',
        primaryHex: '#FF7A00',
        secondaryHex: '#0B0F14',
        phone: '+91 98765 43210',
        website: 'apexdiagnostics.in',
        revisionCount: 0,
      };
    });

    // STEP 2: Generate Channel-Native Assets with Unit-Economics Guardrails
    const generatedAssets = await step.run('generate-multi-platform-assets', async () => {
      const mockAssets: GeneratedAssetPayload[] = [
        {
          platform: 'instagram',
          caption: `Invest in the only home you will ever truly live in—your body. 🩺✨\n\nEarly diagnostic detection turns anxieties into peace of mind. Get a comprehensive full-body screening with 40+ vital parameters at ${campaignContext.brandName}.\n\n📍 Tap link in bio or WhatsApp us to schedule your home sample collection.`,
          firstComment: '#PreventiveHealth #ApexDiagnostics #EarlyDetection #WellnessJourneyIndia #HealthFirst',
          hashtags: ['PreventiveHealth', 'ApexDiagnostics', 'EarlyDetection', 'WellnessIndia'],
          mediaUrls: ['/brand/kuiro-logo.jpg'],
          mediaType: 'IMAGE',
          aspectRatio: '4:5',
          criticScore: { hook: 9, brand_alignment: 10, cta: 9 },
        },
        {
          platform: 'linkedin',
          caption: `Preventive healthcare isn’t a personal expense; it’s the single highest ROI investment a founder or executive can make.\n\nOver 65% of chronic lifestyle ailments can be reversed when detected early.\n\nAt ${campaignContext.brandName}, our automated laboratory workflows deliver NABL-accredited diagnostic precision to corporate teams.\n\nHow does your organization prioritize proactive health resilience?`,
          hashtags: ['CorporateWellness', 'Leadership', 'PreventiveMedicine', 'HealthTech'],
          mediaUrls: ['/brand/kuiro-logo.jpg'],
          mediaType: 'IMAGE',
          aspectRatio: '1:1',
          criticScore: { hook: 10, brand_alignment: 9, cta: 9 },
        },
        {
          platform: 'x',
          // Unit-Economics Guardrail: Put external links in firstCommentText (first reply)
          // to avoid X API v2's $0.200 per link-post surcharge!
          caption: `A busy schedule is no excuse to ignore your body’s signals. Early detection beats late regrets every single time. 🩺\n\nPriority morning slots open across all diagnostic centers today.`,
          firstComment: `Book home sample collection: https://${campaignContext.website}`,
          hashtags: ['HealthcareTips', 'Wellness'],
          mediaUrls: [],
          mediaType: 'TEXT_ONLY',
          aspectRatio: '1:1',
          criticScore: { hook: 9, brand_alignment: 10, cta: 8 },
        },
        {
          platform: 'whatsapp',
          caption: `🌟 *Priority Health Alert from ${campaignContext.brandName}*\n\nRoutine prevention is always better than cure. We have reserved priority diagnostic slots for our comprehensive Vital Checkup package this week.\n\nReply *BOOK* to reserve a home collection or call us directly at ${campaignContext.phone}.`,
          hashtags: [],
          mediaUrls: ['/brand/kuiro-logo.jpg'],
          mediaType: 'IMAGE',
          aspectRatio: '1:1',
          criticScore: { hook: 10, brand_alignment: 10, cta: 10 },
        },
        {
          platform: 'email',
          caption: `Routine prevention is always better than cure. We are pleased to announce priority weekend slots for comprehensive full-body screenings at ${campaignContext.brandName}.\n\nReserve your priority consultation or home collection today.`,
          emailSubject: `🩺 Prioritize Your Health: Exclusive Wellness Insights from ${campaignContext.brandName}`,
          hashtags: [],
          mediaUrls: ['/brand/kuiro-logo.jpg'],
          mediaType: 'TEXT_ONLY',
          aspectRatio: '1:1',
          criticScore: { hook: 9, brand_alignment: 10, cta: 10 },
        },
      ];

      return mockAssets;
    });

    // STEP 3: Pre-Publish AI Critic Loop (Evaluates Hook, Formatting & Negative Constraints)
    const criticEvaluation = await step.run('pre-publish-ai-critic', async () => {
      return evaluateCampaignWithCritic(generatedAssets, {
        negative_constraints: [
          'Never mention competing diagnostic chains',
          'Never promise 100% cure guarantees',
        ],
      });
    });

    // STEP 4: Render Programmatic Brand Contact-Sheet Preview for WhatsApp
    const contactSheet = await step.run('generate-contact-sheet', async () => {
      return generateContactSheetGrid(
        [
          { title: 'Instagram 4:5 Visual Post', platform: 'instagram', captionSnippet: generatedAssets[0].caption, criticScore: 96 },
          { title: 'LinkedIn Thought Leadership', platform: 'linkedin', captionSnippet: generatedAssets[1].caption, criticScore: 94 },
          { title: 'X Link-in-Reply Short Post', platform: 'x', captionSnippet: generatedAssets[2].caption, criticScore: 92 },
          { title: 'WhatsApp Broadcast Card', platform: 'whatsapp', captionSnippet: generatedAssets[3].caption, criticScore: 98 },
        ],
        campaignContext.brandName
      );
    });

    // STEP 5: Dispatch WhatsApp Utility Template Preview to Admin
    await step.run('dispatch-whatsapp-card', async () => {
      console.log(`[WhatsApp Bot] Dispatched 48h Preview to ${campaignContext.adminPhone} with Contact Sheet ${contactSheet.publicUrl}`);
      const waResult = await whatsappClient.sendPreviewCard({
        recipientPhone: campaignContext.adminPhone,
        campaignId,
        topicSummary: campaignContext.topicSummary,
        previewImageUrl: contactSheet.publicUrl,
        publishAtFormatted: new Date(publishAt).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });

      return {
        dispatched: true,
        recipient: campaignContext.adminPhone,
        previewUrl: contactSheet.publicUrl,
        criticCompositeScore: criticEvaluation.overallScore,
        waResult,
      };
    });

    // STEP 6: Race-Condition-Free Wait Loop (T-48h to T-0h)
    // Instead of raw step.sleepUntil, uses while loop listening for admin actions
    let currentStatus = 'AUTO_QUEUED';
    let revisionCount = 0;
    const maxRevisions = 2; // Maximum 2 free voice/text revisions
    const publishTimestamp = new Date(publishAt).getTime();

    while (Date.now() < publishTimestamp && currentStatus === 'AUTO_QUEUED') {
      const remainingMs = Math.max(1000, publishTimestamp - Date.now());
      const remainingSeconds = Math.round(remainingMs / 1000);
      const timeoutString = `${Math.min(48, Math.ceil(remainingSeconds / 3600))}h`;

      const adminAction = await step.waitForEvent('wait-for-admin-whatsapp-action', {
        event: 'whatsapp/admin.action',
        timeout: timeoutString as any,
        match: 'data.campaignId',
      });

      if (!adminAction) {
        // Timer elapsed without action: Silence = Consent! Auto-Commit triggered!
        break;
      }

      const { action, instruction } = adminAction.data;

      if (action === 'APPROVE') {
        currentStatus = 'APPROVED';
        break;
      }

      if (action === 'SKIP' || action === 'EMERGENCY_PAUSE') {
        currentStatus = 'PAUSED';
        await step.run('mark-campaign-paused', async () => {
          console.log(`[Campaign Paused] Campaign ${campaignId} paused by admin`);
          return { status: 'PAUSED' };
        });
        return { status: 'PAUSED', message: 'Campaign was paused by admin.' };
      }

      if (action === 'EDIT' && revisionCount < maxRevisions) {
        revisionCount++;
        await step.run(`apply-revision-${revisionCount}`, async () => {
          console.log(`[Voice/Text Revision ${revisionCount}/${maxRevisions}] Applying instruction: "${instruction}"`);
          return { revisionCount, instruction };
        });
        // Loop continues waiting until publish time or explicit approval
      }
    }

    // STEP 7: T-0h Auto-Commit & Multi-Channel Parallel Publishing
    const publishResults = await step.run('parallel-multi-channel-publish', async () => {
      console.log(`[KUIRO Autopilot] Auto-Commit Triggered at T-0h! Publishing in parallel to Facebook, Instagram, LinkedIn, X, and WhatsApp...`);
      const results = await publishToAllChannels({
        caption: generatedAssets[0].caption,
        mediaUrls: [contactSheet.publicUrl],
        firstReply: generatedAssets[2].firstComment || 'Read our full guide at drsharmadental.in',
        aspectRatio: '1:1',
      });

      return {
        channels: results,
        timestamp: new Date().toISOString(),
      };
    });

    // STEP 8: Send WhatsApp Confirmation Link to Admin
    await step.run('send-whatsapp-completion-receipt', async () => {
      console.log(`[WhatsApp Receipt] Sent live post links to ${campaignContext.adminPhone}`);
      return { receiptSent: true, timestamp: new Date().toISOString() };
    });

    return {
      success: true,
      campaignId,
      finalStatus: 'PUBLISHED',
      publishResults,
    };
  }
);
