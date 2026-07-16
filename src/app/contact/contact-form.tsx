
'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, User, MessageSquare } from 'lucide-react';
import { addContactMessage } from '@/lib/data';
import { revalidateAll } from '@/lib/revalidate';
import { TurnstileWidget, type TurnstileWidgetRef } from '@/components/turnstile-widget';
import { verifyTurnstileToken } from '@/lib/verify-turnstile-client';

const formSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل.' }),
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صحيح.' }),
  message: z.string().min(10, { message: 'الرسالة يجب أن تكون 10 أحرف على الأقل.' }),
});

export function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!turnstileToken) {
      toast({
        variant: 'destructive',
        title: 'التحقق الأمني غير مكتمل',
        description: 'يرجى الانتظار قليلاً حتى يكتمل التحقق ثم إعادة المحاولة.',
      });
      return;
    }

    setIsSubmitting(true);
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

      await addContactMessage(values);
      await revalidateAll();
      toast({
        title: 'تم إرسال رسالتك بنجاح!',
        description: 'شكرًا لتواصلك معنا. سنقوم بالرد في أقرب وقت ممكن.',
      });
      form.reset();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الإرسال',
        description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.',
      });
    } finally {
      setIsSubmitting(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><User className="h-4 w-4" /> الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسمك الكامل" {...field} />
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
              <FormLabel className="flex items-center gap-2"><Mail className="h-4 w-4" /> البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input type="email" placeholder="example@mail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> رسالتك</FormLabel>
              <FormControl>
                <Textarea placeholder="اكتب رسالتك هنا..." rows={6} {...field} />
              </FormControl>
              <FormMessage />
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
        <Button type="submit" size="lg" className="w-full active:scale-95 transition-transform" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          إرسال الرسالة
        </Button>
      </form>
    </Form>
  );
}
