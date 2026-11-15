import { NextRequest, NextResponse } from 'next/server';
import { authorizeWorkspace } from '@/lib/auth';
import { dispatchOutboundReply } from '@/lib/inbox/dispatchService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      conversationId, 
      content, 
      isInternalNote = false,
      templateName,
      templateParams,
      attachments = []
    } = body;

    if (!conversationId || (!content?.trim() && !templateName)) {
      return NextResponse.json({ error: 'conversationId and content (or templateName) are required' }, { status: 400 });
    }

    // 1. Authorize workspace access (Strict Multi-Tenant Isolation)
    const auth = await authorizeWorkspace(req, body.workspaceId);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const wsId = auth.workspaceId!;
    const session = auth.session!;
    const senderName = body.senderName || session.user.name || 'Agent';

    // 2. Dispatch through genuine outbound messaging engine
    const dispatchResult = await dispatchOutboundReply({
      conversationId,
      workspaceId: wsId,
      content: content?.trim() || `[Template: ${templateName}]`,
      senderName,
      isInternalNote,
      templateName,
      templateParams,
      attachments,
    });

    if (!dispatchResult.success) {
      const statusCode = dispatchResult.windowStatus && !dispatchResult.windowStatus.isOpen ? 403 : 500;
      return NextResponse.json({
        success: false,
        error: dispatchResult.error || 'Failed to dispatch outbound message',
        windowStatus: dispatchResult.windowStatus,
      }, { status: statusCode });
    }

    return NextResponse.json({
      success: true,
      messageId: dispatchResult.messageId,
      providerMessageId: dispatchResult.providerMessageId,
      deliveryStatus: dispatchResult.deliveryStatus,
      channel: dispatchResult.channel,
      message: dispatchResult.message,
    });
  } catch (error: any) {
    console.error('[Inbox Reply API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to send reply' }, { status: 500 });
  }
}
