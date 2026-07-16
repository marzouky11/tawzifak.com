/**
 * يرسل رمز التحقق (token) الصادر عن أداة Cloudflare Turnstile إلى الخادم
 * للتحقق منه عبر واجهة Cloudflare الرسمية، قبل تنفيذ أي منطق خاص بالنموذج.
 */
export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data?.success === true;
  } catch (error) {
    console.error('Turnstile verification request failed:', error);
    return false;
  }
}
