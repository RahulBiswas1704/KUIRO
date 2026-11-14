import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, scheduledCampaigns, conversations, users } from '@/db';
import { eq, desc, and } from 'drizzle-orm';
import { getSessionFromRequest, authorizeWorkspace } from '@/lib/auth';
import { WorkspaceRoiSummary, CampaignRoiMetric, AttributedLeadItem } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Helper to parse currency strings like "₹14,500", "₹1,20,000", "₹85000" into numeric values
 */
function parseRupeeAmount(val?: string | null): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Estimates commercial deal/order value in INR based on customer tags and profile type
 */
function estimateLeadCommercialValue(c: {
  tags?: string[] | null;
  crmData?: any;
  customerName?: string;
}): number {
  // 1. Check if totalSpend is already set
  const recorded = parseRupeeAmount(c.crmData?.totalSpend);
  if (recorded > 0) return recorded;

  const tags = (c.tags || []).map((t) => t.toLowerCase());
  const type = (c.crmData?.patientOrClientType || '').toLowerCase();
  const notes = (c.crmData?.notes || '').toLowerCase();
  const text = `${tags.join(' ')} ${type} ${notes}`;

  // 2. High ticket / B2B Corporate Wholesale Deals & Group Orders
  if (text.includes('corporate') || text.includes('wholesale') || text.includes('bulk') || text.includes('b2b') || text.includes('deal') || text.includes('group')) {
    return 85000;
  }

  // 3. Premium Artisanal / Bespoke Wardrobe / Executive Advisory
  if (text.includes('bespoke') || text.includes('silk') || text.includes('bridal') || text.includes('advisory') || text.includes('sprint') || text.includes('retainer')) {
    return 28000;
  }

  // 4. Repeat Orders / VIP Retail / Direct Purchases
  if (text.includes('vip') || text.includes('repeat') || text.includes('order') || text.includes('buyer') || text.includes('pickup')) {
    return 6500;
  }

  // 5. Standard Inbound Lead / First Inquiry
  return 2500;
}

/**
 * Checks if a conversation counts as a confirmed booked appointment
 */
function isAppointmentBooked(c: {
  status: string;
  tags?: string[] | null;
  crmData?: any;
}): boolean {
  const status = c.status.toLowerCase();
  const tags = (c.tags || []).map((t) => t.toLowerCase());
  const notes = (c.crmData?.notes || '').toLowerCase();

  return (
    status === 'resolved' ||
    tags.some((t) => t.includes('booked') || t.includes('appointment') || t.includes('walk-in') || t.includes('consultation')) ||
    notes.includes('booked') ||
    notes.includes('scheduled') ||
    notes.includes('first visit')
  );
}

export async function GET(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    // Authorize workspace access (Strict Multi-Tenant Isolation)
    const workspaceIdParam = req.nextUrl.searchParams.get('workspaceId');
    const auth = await authorizeWorkspace(req, workspaceIdParam);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const wsId = auth.workspaceId!;
    const [ws] = await database.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'No active workspace found' }, { status: 404 });
    }

    // 1. Fetch campaigns for workspace
    const campaignsList = await database
      .select()
      .from(scheduledCampaigns)
      .where(eq(scheduledCampaigns.workspaceId, ws.id))
      .orderBy(desc(scheduledCampaigns.createdAt));

    // 2. Fetch conversations for workspace
    const conversationsList = await database
      .select()
      .from(conversations)
      .where(eq(conversations.workspaceId, ws.id))
      .orderBy(desc(conversations.updatedAt));

    // 3. Map conversations into attributed lead items
    const allAttributedLeads: AttributedLeadItem[] = conversationsList.map((c) => {
      const estimatedValue = estimateLeadCommercialValue(c);
      const booked = isAppointmentBooked(c);

      return {
        id: c.id,
        customerName: c.customerName,
        customerHandle: c.customerHandle,
        customerAvatar: c.customerAvatar || undefined,
        channel: c.channel as any,
        campaignSource: c.campaignSource || 'Autonomous Brand Health Campaign',
        lastMessageText: c.lastMessageText,
        status: c.status.toLowerCase() as any,
        priority: c.priority.toLowerCase() as any,
        tags: c.tags || [],
        patientOrClientType: c.crmData?.patientOrClientType || undefined,
        estimatedValue,
        isBooked: booked,
        createdAt: c.createdAt.toISOString(),
      };
    });

    // 4. Calculate channel breakdown
    const channelBreakdown = {
      whatsapp: { leads: 0, value: 0 },
      instagram: { leads: 0, value: 0 },
      email: { leads: 0, value: 0 },
      messenger: { leads: 0, value: 0 },
    };

    allAttributedLeads.forEach((lead) => {
      const ch = lead.channel.toLowerCase() as keyof typeof channelBreakdown;
      if (channelBreakdown[ch]) {
        channelBreakdown[ch].leads += 1;
        channelBreakdown[ch].value += lead.estimatedValue;
      }
    });

    // 5. Compute per-campaign ROI metrics
    const campaignBreakdown: CampaignRoiMetric[] = campaignsList.map((camp, idx) => {
      // Find matching leads where campaignSource matches or contains the campaign topic
      const matchingLeads = allAttributedLeads.filter((lead) => {
        const leadSrc = lead.campaignSource.toLowerCase();
        const campTopic = camp.topicSummary.toLowerCase();
        return (
          leadSrc.includes(campTopic) ||
          campTopic.includes(leadSrc) ||
          leadSrc.split(' ').some((word) => word.length > 4 && campTopic.includes(word))
        );
      });

      // If no exact match found, distribute unassigned leads to published/active campaigns
      const assignedLeads = matchingLeads.length > 0
        ? matchingLeads
        : idx === 0 && allAttributedLeads.length > 0
        ? allAttributedLeads.slice(0, 2)
        : [];

      const inquiriesCount = assignedLeads.length;
      const bookedLeads = assignedLeads.filter((l) => l.isBooked);
      const appointmentsBookedCount = bookedLeads.length;

      const estimatedPipelineValue = assignedLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
      const realizedRevenue = bookedLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

      // KUIRO Growth monthly tier fee is ₹2,799
      const kuiroMonthlyFee = 2799;
      const roiMultiplier = estimatedPipelineValue > 0
        ? Number((estimatedPipelineValue / kuiroMonthlyFee).toFixed(1))
        : 1.0;

      const leadConversionRate = inquiriesCount > 0
        ? Math.round((appointmentsBookedCount / inquiriesCount) * 100)
        : 0;

      // Identify dominant channel
      const channelCounts: Record<string, number> = {};
      assignedLeads.forEach((l) => {
        channelCounts[l.channel] = (channelCounts[l.channel] || 0) + 1;
      });
      const topInboundChannel = Object.keys(channelCounts).sort(
        (a, b) => channelCounts[b] - channelCounts[a]
      )[0] || 'whatsapp';

      return {
        campaignId: camp.id,
        topicSummary: camp.topicSummary,
        triggerType: camp.triggerType,
        publishAt: camp.publishAt.toISOString(),
        status: camp.status,
        inquiriesCount,
        appointmentsBookedCount,
        channels: ['whatsapp', 'instagram', 'linkedin', 'x', 'email'],
        estimatedPipelineValue,
        realizedRevenue,
        roiMultiplier,
        leadConversionRate,
        topInboundChannel,
        recentLeads: assignedLeads,
      };
    });

    // 6. Aggregate Workspace Totals
    const totalAttributedLeads = allAttributedLeads.length;
    const totalAppointmentsBooked = allAttributedLeads.filter((l) => l.isBooked).length;
    const totalPipelineValue = allAttributedLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
    const totalRealizedRevenue = allAttributedLeads
      .filter((l) => l.isBooked)
      .reduce((sum, l) => sum + l.estimatedValue, 0);

    const monthlySubscriptionCost = 2799; // Growth Plan
    const netRoiMultiplier = Number((totalPipelineValue / monthlySubscriptionCost).toFixed(1));
    const overallConversionRate = totalAttributedLeads > 0
      ? Math.round((totalAppointmentsBooked / totalAttributedLeads) * 100)
      : 0;

    const summary: WorkspaceRoiSummary = {
      workspaceId: ws.id,
      workspaceName: ws.name,
      totalAttributedLeads,
      totalAppointmentsBooked,
      totalPipelineValue,
      totalRealizedRevenue,
      monthlySubscriptionCost,
      netRoiMultiplier,
      overallConversionRate,
      channelBreakdown,
      campaignBreakdown,
    };

    return NextResponse.json({
      success: true,
      source: 'neon_postgres',
      roi: summary,
    });
  } catch (error: any) {
    console.error('[API /api/campaigns/roi GET Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate campaign ROI' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler: Allows clinic staff to mark a lead as a booked appointment with confirmed treatment value
 */
export async function POST(req: NextRequest) {
  try {
    const database = db;
    if (!database) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    const body = await req.json();
    const { conversationId, bookedValue, notes } = body;

    if (!conversationId) {
      return NextResponse.json({ success: false, error: 'Missing conversationId' }, { status: 400 });
    }

    const [conv] = await database
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conv) {
      return NextResponse.json({ success: false, error: 'Conversation not found' }, { status: 404 });
    }

    const existingCrm = conv.crmData || {};
    const updatedTags = Array.from(new Set([...(conv.tags || []), 'Appointment Booked', 'Confirmed']));

    const valueFormatted = bookedValue ? `₹${Number(bookedValue).toLocaleString('en-IN')}` : existingCrm.totalSpend || '₹3,500';

    const updatedCrm = {
      ...existingCrm,
      totalSpend: valueFormatted,
      lastVisitDate: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      notes: notes || existingCrm.notes || 'Appointment booked via KUIRO Inbound Attributed Campaign',
    };

    const [updatedConv] = await database
      .update(conversations)
      .set({
        status: 'RESOLVED',
        tags: updatedTags,
        crmData: updatedCrm,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Appointment confirmed for ${conv.customerName}! Pipeline value recorded as ${valueFormatted}.`,
      conversation: updatedConv,
    });
  } catch (error: any) {
    console.error('[API /api/campaigns/roi POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update appointment booking' },
      { status: 500 }
    );
  }
}

