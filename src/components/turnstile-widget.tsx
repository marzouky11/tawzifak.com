'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// مفتاح الموقع (Site Key) الخاص بـ Cloudflare Turnstile.
// هذا المفتاح عام وليس سريًا، ويُستخدم في جانب المتصفح فقط.
const TURNSTILE_SITE_KEY = '0x4AAAAAAD2ufI-67Qz-u3gy';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, any>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    __turnstileScriptLoadingPromise?: Promise<void>;
  }
}

// تحميل سكريبت Turnstile مرة واحدة فقط، حتى لو تم استخدام الأداة في أكثر من نموذج.
function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (window.__turnstileScriptLoadingPromise) {
    return window.__turnstileScriptLoadingPromise;
  }

  window.__turnstileScriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('تعذر تحميل سكريبت Cloudflare Turnstile.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('تعذر تحميل سكريبت Cloudflare Turnstile.'));
    document.head.appendChild(script);
  });

  return window.__turnstileScriptLoadingPromise;
}

export interface TurnstileWidgetRef {
  /** إعادة ضبط الأداة للحصول على رمز تحقق جديد (مطلوبة بعد كل محاولة إرسال). */
  reset: () => void;
}

interface TurnstileWidgetProps {
  /** يُستدعى عند نجاح التحقق مع تمرير رمز (token) يجب إرساله للتحقق من جانب الخادم. */
  onVerify: (token: string) => void;
  /** يُستدعى عند انتهاء صلاحية الرمز. */
  onExpire?: () => void;
  /** يُستدعى عند حدوث خطأ أثناء التحقق. */
  onError?: () => void;
  className?: string;
}

/**
 * أداة Cloudflare Turnstile المشتركة، تُستخدم في جميع نماذج الموقع
 * (بدلاً من إنشاء أداة/Widget جديدة في كل نموذج على حدة).
 */
export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  ({ onVerify, onExpire, onError, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch (error) {
            console.error('Failed to reset Turnstile widget:', error);
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      loadTurnstileScript()
        .then(() => {
          if (!isMounted || !containerRef.current || !window.turnstile) return;
          if (widgetIdRef.current) return;

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => onVerify(token),
            'expired-callback': () => {
              onExpire?.();
            },
            'error-callback': () => {
              onError?.();
            },
          });
        })
        .catch((error) => {
          console.error('Turnstile script failed to load:', error);
          onError?.();
        });

      return () => {
        isMounted = false;
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // تجاهل أي خطأ عند إزالة الأداة أثناء إلغاء تركيب المكوّن
          }
          widgetIdRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} className={className} />;
  }
);

TurnstileWidget.displayName = 'TurnstileWidget';
