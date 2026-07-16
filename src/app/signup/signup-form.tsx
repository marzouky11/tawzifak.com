
'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { createUserDocument } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2, UserPlus, Mail, Lock, User } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { revalidateAll } from '@/lib/revalidate';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/turnstile-widget';
import { verifyTurnstileToken } from '@/lib/verify-turnstile-client';


const signupSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل.' }),
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
  password: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' }),
  terms: z.boolean().refine(val => val === true, { message: 'يجب الموافقة على الشروط.' }),
});

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const handleSignup = async (values: z.infer<typeof signupSchema>) => {
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

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.name });

      const colors = [
        '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', 
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      await createUserDocument(user.uid, {
        name: values.name,
        email: values.email,
        avatarColor: randomColor,
        photoURL: null,
        createdAt: serverTimestamp(),
      });
      
      await revalidateAll();

      toast({ title: 'تم إنشاء الحساب بنجاح!' });
      const redirectUrl = searchParams.get('redirect');
      router.push(redirectUrl || '/');
    } catch (error: any) {
      let errorMessage = "حدث خطأ غير متوقع.";
       if (error.code === 'auth/email-already-in-use') {
           errorMessage = "هذا البريد الإلكتروني مستخدم بالفعل.";
       }
      toast({
        variant: 'destructive',
        title: 'خطأ في إنشاء الحساب',
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
      <MobilePageHeader title="إنشاء حساب جديد">
        <UserPlus className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <div className="container mx-auto max-w-md pb-12">
        <Card className="shadow-lg">
          <CardHeader className="text-center md:hidden">
             <div className="mx-auto bg-primary/10 w-fit p-3 rounded-full mb-2">
                <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl"> أهلاً بك في توظيفك!</CardTitle>
            <CardDescription>
              سجّل مجانًا للعثور على فرص عمل في المغرب، وعرض مهاراتك وخبراتك أمام أصحاب العمل والمشاريع.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 md:pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        الاسم الكامل
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="اسمك الكامل" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        البريد الإلكتروني
                      </FormLabel>
                      <FormControl>
                         <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          كلمة المرور
                        </FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
               <FormItem className="flex items-center space-x-2 space-x-reverse pt-2">
                       <FormControl>
                         <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="grid gap-1.5 leading-none">
                        <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           أوافق على <Link href="/terms" target="_blank" className="text-primary hover:underline">شروط الاستخدام</Link> و <Link href="/privacy" target="_blank" className="text-primary hover:underline">سياسة الخصوصية</Link>.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

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
                  {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                </Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              لديك حساب بالفعل؟{' '}
              <Link href={`/login?${searchParams.toString()}`} className="text-primary hover:underline font-semibold">
                سجل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
              }
