'use client';

import Link from 'next/link';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Card } from '@/components/ui/card';
import { PlusCircle, Users, LogIn } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ActionCard = ({ icon: Icon, title, description, color, href, onClick }: { icon: React.ElementType, title: string, description: string, color: string, href: string, onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) => (
  <Link href={href} onClick={onClick}>
    <Card 
      className="p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center"
      style={{
          '--card-color': color,
          backgroundColor: `${color}1A`,
          borderColor: `${color}4D`
      } as React.CSSProperties}
    >
      <Icon className="h-16 w-16 mb-4" style={{ color }}/>
      <h3 className="text-xl font-semibold" style={{ color }}>{title}</h3>
      <p className="text-muted-foreground mt-2">
        {description}
      </p>
    </Card>
  </Link>
);

export default function SelectPostTypePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/post-job/select-type`);
      return;
    }

    router.push('/post-job?type=seeking_job');
  };

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="نشر إعلان جديد">
        <PlusCircle className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={PlusCircle}
        title="نشر إعلان جديد"
        description="اضغط على البطاقة أدناه لإنشاء إعلانك كباحث عن عمل."
      />
      <div className="container mx-auto max-w-7xl px-4 pb-12">
        {!user && (
          <Alert className="mb-6 border-primary/50 text-primary">
            <LogIn className="h-4 w-4" />
            <AlertTitle className="font-bold">مطلوب تسجيل الدخول</AlertTitle>
            <AlertDescription>
              يجب عليك <Link href="/login?redirect=/post-job/select-type" className="font-bold underline">تسجيل الدخول</Link> أو <Link href="/signup?redirect=/post-job/select-type" className="font-bold underline">إنشاء حساب جديد</Link> أولاً لتتمكن من نشر إعلان.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard 
             icon={Users}
             title="أبحث عن عمل"
             description="أنشئ ملفك الشخصي كباحث عن عمل واعرض مهاراتك وخبراتك لأصحاب العمل."
             color="#424242"
             href="/post-job?type=seeking_job"
             onClick={handleLinkClick}
          />
        </div>
      </div>
    </>
  );
}
