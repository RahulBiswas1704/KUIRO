import { NextRequest, NextResponse } from 'next/server';
import {
  AUTHORIZED_MANAGEMENT_EMAILS,
  BANNED_SECRETS,
  checkManagementSecretsHealth,
  getManagementPasskey,
  createManagementToken,
  verifyManagementAuth,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  recordAdminAuditLog,
  verifyTotpCode,
  verifyRecoveryCode,
  timingSafeCompare,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function GET(req: NextRequest) {
  const auth = await verifyManagementAuth(req);
  return NextResponse.json({
    authenticated: auth.authorized,
    email: auth.email || null,
    role: auth.authorized ? 'KUIRO Platform Operator' : null,
    clearanceLevel: auth.authorized ? 'LEVEL 5 (OPERATOR)' : null,
    errorCode: auth.errorCode || null,
    reason: auth.reason || null,
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  try {
    const body = await req.json();
    const { email, passkey, mfaCode, recoveryCode } = body;

    const cleanEmail = String(email || '').toLowerCase().trim();
    const cleanPasskey = String(passkey || '').trim();

    if (!cleanEmail || !cleanPasskey) {
      return NextResponse.json(
        {
          success: false,
          code: 'MISSING_CREDENTIALS',
          error: 'Platform operator email and master passkey are required.',
        },
        { status: 400 }
      );
    }

    // 1. FAIL-CLOSED CHECK: Validate server management secrets health
    const secretsHealth = checkManagementSecretsHealth();
    if (!secretsHealth.configured) {
      await recordAdminAuditLog({
        operatorEmail: cleanEmail,
        action: 'OPERATOR_LOGIN_BLOCKED_UNCONFIGURED',
        resource: '/api/admin/auth',
        status: 'BLOCKED',
        details: { error: secretsHealth.error, code: secretsHealth.code },
        req,
      });

      return NextResponse.json(
        {
          success: false,
          code: secretsHealth.code || 'ADMIN_SECRETS_NOT_CONFIGURED',
          error: 'Platform operator security is not configured or uses an insecure/banned secret. Access denied.',
        },
        { status: 503 }
      );
    }

    // 2. RATE LIMITING: Check IP and Email limits
    const rateLimitIp = checkRateLimit(`ip:${clientIp}`);
    const rateLimitEmail = checkRateLimit(`email:${cleanEmail}`);

    if (!rateLimitIp.allowed || !rateLimitEmail.allowed) {
      const retryAfter = Math.max(
        rateLimitIp.retryAfterSeconds || 0,
        rateLimitEmail.retryAfterSeconds || 0,
        60
      );

      await recordAdminAuditLog({
        operatorEmail: cleanEmail,
        action: 'OPERATOR_LOGIN_RATE_LIMITED',
        resource: '/api/admin/auth',
        status: 'RATE_LIMITED',
        details: { clientIp, retryAfter },
        req,
      });

      return NextResponse.json(
        {
          success: false,
          code: 'RATE_LIMITED',
          error: `Too many failed operator authentication attempts. Access throttled for ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfterSeconds: retryAfter,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    // 3. BANNED CREDENTIAL DEFENSE: Explicitly reject known default secrets
    if (BANNED_SECRETS.has(cleanPasskey.toLowerCase())) {
      recordFailedAttempt(`ip:${clientIp}`);
      recordFailedAttempt(`email:${cleanEmail}`);

      await recordAdminAuditLog({
        operatorEmail: cleanEmail,
        action: 'OPERATOR_LOGIN_BANNED_SECRET_ATTEMPT',
        resource: '/api/admin/auth',
        status: 'BLOCKED',
        details: { clientIp, attemptedPasskey: 'BANNED_DEFAULT_STRING' },
        req,
      });

      return NextResponse.json(
        {
          success: false,
          code: 'BANNED_SECRET_REJECTED',
          error: 'Access Denied: Known default or insecure credentials are permanently rejected.',
        },
        { status: 401 }
      );
    }

    // 4. VERIFY OPERATOR PASSKEY (timing-safe comparison)
    const expectedPasskey = getManagementPasskey();
    const isPasskeyValid = timingSafeCompare(cleanPasskey, expectedPasskey);

    // 5. VERIFY AUTHORIZED OPERATOR EMAIL
    const isEmailAuthorized =
      AUTHORIZED_MANAGEMENT_EMAILS.includes(cleanEmail) ||
      (cleanEmail.endsWith('@kuiro.in') && !cleanEmail.includes('customer'));

    if (!isPasskeyValid || !isEmailAuthorized) {
      const ipResult = recordFailedAttempt(`ip:${clientIp}`);
      const emailResult = recordFailedAttempt(`email:${cleanEmail}`);
      const remainingAttempts = Math.min(ipResult.remainingAttempts, emailResult.remainingAttempts);

      await recordAdminAuditLog({
        operatorEmail: cleanEmail,
        action: 'OPERATOR_LOGIN_FAILED',
        resource: '/api/admin/auth',
        status: 'FAILURE',
        details: {
          clientIp,
          reason: !isPasskeyValid ? 'Invalid passkey' : 'Unauthorized email',
          remainingAttempts,
        },
        req,
      });

      // Defensive timing delay mitigating timing probing
      await new Promise((r) => setTimeout(r, 300));

      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_CREDENTIALS',
          error: 'Access Denied: Invalid operator clearance credentials.',
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 6. OPERATOR MFA VERIFICATION (if MFA is enabled in environment or requested)
    const operatorMfaSecret = process.env.KUIRO_OPERATOR_MFA_SECRET;
    const isMfaEnforced = process.env.NODE_ENV === 'production' && !!operatorMfaSecret;

    if (isMfaEnforced || operatorMfaSecret) {
      if (!mfaCode && !recoveryCode) {
        return NextResponse.json(
          {
            success: false,
            code: 'MFA_REQUIRED',
            mfaRequired: true,
            error: 'Operator Multi-Factor Authentication (MFA) required.',
          },
          { status: 200 }
        );
      }

      let mfaPassed = false;
      if (mfaCode && operatorMfaSecret) {
        mfaPassed = verifyTotpCode(operatorMfaSecret, String(mfaCode));
      }

      if (!mfaPassed && recoveryCode) {
        mfaPassed = verifyRecoveryCode(String(recoveryCode));
      }

      if (!mfaPassed) {
        recordFailedAttempt(`ip:${clientIp}`);
        recordFailedAttempt(`email:${cleanEmail}`);

        await recordAdminAuditLog({
          operatorEmail: cleanEmail,
          action: 'OPERATOR_MFA_FAILED',
          resource: '/api/admin/auth',
          status: 'FAILURE',
          details: { clientIp },
          req,
        });

        return NextResponse.json(
          {
            success: false,
            code: 'INVALID_MFA_CODE',
            error: 'Access Denied: Invalid operator MFA code or recovery token.',
          },
          { status: 401 }
        );
      }
    }

    // 7. SUCCESS: Reset rate limit counters
    resetRateLimit(`ip:${clientIp}`);
    resetRateLimit(`email:${cleanEmail}`);

    // Generate signed 8-hour operator session token
    const token = createManagementToken(cleanEmail, { clientIp });

    // Record successful login audit log
    await recordAdminAuditLog({
      operatorEmail: cleanEmail,
      action: 'OPERATOR_LOGIN_SUCCESS',
      resource: '/api/admin/auth',
      status: 'SUCCESS',
      details: { clientIp, clearanceLevel: 'LEVEL 5 (OPERATOR)' },
      req,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Platform operator clearance granted.',
      token,
      user: {
        email: cleanEmail,
        role: 'KUIRO Platform Operator',
        clearanceLevel: 'LEVEL 5 (OPERATOR)',
      },
    });

    // Set secure HTTP-only cookie
    res.cookies.set('kuiro_mgmt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return res;
  } catch (error: any) {
    console.error('[Admin Auth POST Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyManagementAuth(req);
  if (auth.authorized && auth.email) {
    await recordAdminAuditLog({
      operatorEmail: auth.email,
      action: 'OPERATOR_LOGOUT',
      resource: '/api/admin/auth',
      status: 'SUCCESS',
      req,
    });
  }

  const res = NextResponse.json({
    success: true,
    message: 'KUIRO Operator terminal locked. Session terminated.',
  });

  // Clear cookie
  res.cookies.set('kuiro_mgmt_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return res;
}
