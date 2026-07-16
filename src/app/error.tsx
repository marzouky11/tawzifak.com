'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RotateCw, ArrowLeft } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled page error:', error);
  }, [error]);

  return (
    <>
      <MobilePageHeader title="حدث خطأ">
        <AlertTriangle className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={AlertTriangle}
        title="حدث خطأ مؤقت"
        description="واجهنا مشكلة أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى."
      />
      <div className="container mx-auto max-w-2xl px-4 pb-12">
        <Card className="text-center shadow-lg">
          <CardContent className="p-8 md:p-12">
            <AlertTriangle className="mx-auto h-24 w-24 text-primary/50" />
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              عذرًا، حدث خطأ غير متوقع
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              قد يكون هذا خللاً مؤقتًا في الاتصال بالخادم. يرجى إعادة المحاولة، فقد يعمل هذا الرابط بشكل طبيعي عند تحديث الصفحة.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => reset()}>
                <RotateCw className="ml-2 h-5 w-5" />
                إعادة المحاولة
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">
                  <ArrowLeft className="ml-2 h-5 w-5" />
                  العودة إلى الصفحة الرئيسية
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
