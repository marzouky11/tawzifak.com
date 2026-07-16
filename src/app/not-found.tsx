
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Frown, ArrowLeft } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';

export default function NotFoundPage() {
  return (
    <>
      <MobilePageHeader title="الصفحة غير موجودة">
        <Frown className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Frown}
        title="خطأ 404 - الصفحة غير موجودة"
        description="عذرًا، يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو لم تعد موجودة."
      />
      <div className="container mx-auto max-w-2xl px-4 pb-12">
        <Card className="text-center shadow-lg">
          <CardContent className="p-8 md:p-12">
            <Frown className="mx-auto h-24 w-24 text-primary/50" />
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              أوه! الصفحة غير موجودة
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              لا يمكننا العثور على الصفحة التي تبحث عنها. قد يكون الرابط الذي اتبعته قديمًا أو غير صحيح.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/">
                <ArrowLeft className="ml-2 h-5 w-5" />
                العودة إلى الصفحة الرئيسية
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
