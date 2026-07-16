
'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Separator } from '@/components/ui/separator';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/turnstile-widget';
import { verifyTurnstileToken } from '@/lib/verify-turnstile-client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast({
        variant: 'destructive',
        title: 'التحقق الأمني غير مكتمل',
        description: 'يرجى الانتظار قليلاً حتى يكتمل التحقق ثم إعادة المحاولة.',
      });
      return;
    }

    setLoading(true);
    try {
      const isVerifiedHuman = await verifyTurnstileToken(turnstileToken);
      if (!isVerifiedHuman) {
        toast({
          variant: 'destructive',
          title: 'فشل التحقق الأمني',
          description: 'تعذر التحقق من أنك لست روبوتًا. يرجى إعادة المحاولة.',
        });
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: `أهلاً بك ${userCredential.user.displayName || 'مجدداً'}!`,
description: 'يمكنك الآن إدارة حسابك وإعلاناتك.',
});
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/');
    } catch (error: any) {
       let errorMessage = "الرجاء التحقق من البريد الإلكتروني أو كلمة المرور.";
       if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
           errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
       }
      toast({
        variant: 'destructive',
        title: 'خطأ في تسجيل الدخول',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  return (
    <>
      <MobilePageHeader title="تسجيل الدخول">
        <LogIn className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <div className="container mx-auto max-w-md pb-12">
        <Card className="shadow-lg">
          <CardHeader className="text-center md:hidden">
            <div className="mx-auto bg-primary/10 w-fit p-3 rounded-full mb-2">
                <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">أهلاً بك مجدداً!</CardTitle>
            <CardDescription>سجّل دخولك للوصول إلى حسابك وإدارة إعلاناتك.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 md:pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password"  className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  كلمة المرور
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                 <p className="text-xs text-muted-foreground pt-1">
                     كلمة المرور الخاصة بك مشفرة ومحمية بالكامل.
                </p>
              </div>

              <div className="flex justify-center">
                <TurnstileWidget
                  ref={turnstileRef}
                  onVerify={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                />
              </div>

              <Button type="submit" className="w-full active:scale-95 transition-transform" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              ليس لديك حساب؟{' '}
              <Link href={`/signup?${searchParams.toString()}`} className="text-primary hover:underline font-semibold">
                أنشئ حسابًا جديدًا
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
