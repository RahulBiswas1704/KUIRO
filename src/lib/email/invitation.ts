/**
 * KUIRO Workspace Team Member Invitation Email Dispatcher (Resend API)
 */

import crypto from 'crypto';

export interface TeamInviteTokenPayload {
  workspaceId: string;
  userId: string;
  email: string;
  role: string;
  exp: number;
}

function getInviteHmacSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    'kuiro_team_invite_hmac_secret_2026'
  );
}

/**
 * Generates a tamper-proof HMAC-SHA256 signed invitation token valid for 7 days.
 */
export function createTeamInviteToken(params: {
  workspaceId: string;
  userId: string;
  email: string;
  role: string;
  expiryDays?: number;
}): string {
  const expiryDays = params.expiryDays ?? 7;
  const payload: TeamInviteTokenPayload = {
    workspaceId: params.workspaceId,
    userId: params.userId,
    email: params.email.trim().toLowerCase(),
    role: params.role,
    exp: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getInviteHmacSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

/**
 * Verifies an HMAC-SHA256 team invitation token in constant time.
 */
export function verifyTeamInviteToken(token: string): {
  valid: boolean;
  payload?: TeamInviteTokenPayload;
  error?: string;
} {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Missing invitation token.' };
    }
    const parts = token.trim().split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed invitation token.' };
    }
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getInviteHmacSecret())
      .update(encoded)
      .digest('base64url');

    const sigBuf = Buffer.from(sig, 'utf8');
    const expBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid or tampered invitation signature.' };
    }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as TeamInviteTokenPayload;
    if (!payload.workspaceId || !payload.userId || !payload.email || !payload.exp) {
      return { valid: false, error: 'Incomplete invitation token payload.' };
    }
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'This invitation link has expired. Please ask your workspace admin to re-invite you.' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Failed to decode invitation token.' };
  }
}

export interface TeamInviteEmailParams {
  toEmail: string;
  inviteeName: string;
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  role: string;
  inviteToken?: string;
}

export async function sendTeamInvitationEmail(
  params: TeamInviteEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'KUIRO Updates <onboarding@resend.dev>';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kuiro.vercel.app';
  const joinUrl = params.inviteToken
    ? `${appUrl}/invite/accept?token=${encodeURIComponent(params.inviteToken)}`
    : `${appUrl}/login?email=${encodeURIComponent(params.toEmail)}&invited=true`;

  if (!apiKey || apiKey.startsWith('re_mock') || apiKey.includes('your_resend_api_key')) {
    console.log(`[Resend Mock Invite] Sent invitation to ${params.toEmail} for workspace "${params.workspaceName}" (${params.role})`);
    return { success: true, id: `mock_resend_${Date.now()}` };
  }

  const subject = `You've been invited to join ${params.workspaceName} on KUIRO`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #070B10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #070B10; padding: 32px 0; }
    .main { background-color: #0B0F14; margin: 0 auto; width: 100%; max-width: 580px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; }
    .btn { background: linear-gradient(135deg, #FF7A00 0%, #FF9E3D 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.2px; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table class="main" width="100%">
      <!-- Header -->
      <tr>
        <td style="padding: 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); background-color: #0B0F14;">
          <table width="100%">
            <tr>
              <td align="left">
                <span style="font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">KUIRO</span>
                <span style="font-size: 11px; color: #94A3B8; margin-left: 8px;">AUTONOMOUS AI MARKETING</span>
              </td>
              <td align="right">
                <span style="font-size: 10px; font-family: monospace; color: #FF7A00; background: rgba(255, 122, 0, 0.12); padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(255, 122, 0, 0.25);">TEAM INVITE</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 36px 32px 28px 32px;">
          <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
            Join ${params.workspaceName} on KUIRO
          </h1>
          <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94A3B8;">
            Hi <strong>${params.inviteeName}</strong>,
          </p>
          <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
            <strong>${params.inviterName}</strong> (${params.inviterEmail}) has invited you to collaborate in the <strong>${params.workspaceName}</strong> workspace on KUIRO with <strong>${params.role}</strong> privileges.
          </p>
          <p style="margin: 0 0 28px 0; font-size: 13px; line-height: 1.6; color: #94A3B8;">
            You will be able to review automated 48-hour social campaigns, monitor customer conversations in the Unified Omni-Channel Inbox, and manage Brand Brain guidelines.
          </p>

          <!-- CTA Button -->
          <table width="100%" style="margin-bottom: 28px;">
            <tr>
              <td align="left">
                <a href="${joinUrl}" class="btn" target="_blank">
                  Accept Invitation &amp; Open Workspace
                </a>
              </td>
            </tr>
          </table>

          <p style="margin: 0; font-size: 12px; color: #64748B; line-height: 1.5;">
            Or paste this link into your browser:<br/>
            <a href="${joinUrl}" style="color: #FF7A00; word-break: break-all;">${joinUrl}</a>
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 20px 32px; background-color: #06090E; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #64748B; line-height: 1.5;">
          <p style="margin: 0;">
            This invitation was sent by KUIRO Security on behalf of ${params.inviterEmail}. If you were not expecting this invitation, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.toEmail,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Resend Invite Error Response]', data);
      return { success: false, error: data.message || 'Failed to dispatch email via Resend' };
    }

    return { success: true, id: data.id };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Resend Invite Network Error]', errorMsg);
    return { success: false, error: errorMsg };
  }
}
