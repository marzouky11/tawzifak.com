import { NextResponse } from 'next/server';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const token = body?.token;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'missing-token' },
        { status: 400 }
      );
    }

    // يتم قراءة المفتاح السري من متغيرات البيئة فقط، ولا يوجد أي مفتاح
    // سري مكتوب داخل الكود.
    const secret = process.env.TURNSTILE_SECRET;

    if (!secret) {
      console.error('TURNSTILE_SECRET environment variable is not set.');
      return NextResponse.json(
        { success: false, error: 'server-misconfigured' },
        { status: 500 }
      );
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    const remoteIp = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined;

    const verifyParams = new URLSearchParams();
    verifyParams.append('secret', secret);
    verifyParams.append('response', token);
    if (remoteIp) {
      verifyParams.append('remoteip', remoteIp);
    }

    const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams.toString(),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'verification-failed',
          codes: verifyData['error-codes'] || [],
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return NextResponse.json(
      { success: false, error: 'unexpected-error' },
      { status: 500 }
    );
  }
}
