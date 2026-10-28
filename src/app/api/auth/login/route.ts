import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // REQ-001 & TEST-001: Strict @aiesec.net domain validation
    if (!normalizedEmail.endsWith('@aiesec.net')) {
      return NextResponse.json(
        {
          error:
            'Statutory Policy Violation (REQ-001): Access to the AIESEC iCX ERP is strictly restricted to authenticated @aiesec.net email accounts.',
        },
        { status: 403 }
      );
    }

    const sessionPayload = {
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      role: role || 'MEMBER',
      authenticatedAt: new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    // Set a secure session cookie
    response.cookies.set({
      name: 'aiesec_dev_session',
      value: encodeURIComponent(JSON.stringify(sessionPayload)),
      path: '/',
      httpOnly: false, // Accessible to client components for user profile display
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal authentication error' },
      { status: 500 }
    );
  }
}
