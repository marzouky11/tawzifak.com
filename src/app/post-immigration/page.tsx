
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostImmigrationForm } from './post-immigration-form';
import { Loader2, Plane } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';

export default function PostImmigrationPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/post-immigration');
      } else if (!userData?.isAdmin) {
        alert("ليس لديك صلاحية الوصول لهذه الصفحة.");
        router.push('/');
      }
    }
  }, [user, userData, loading, router]);
  
  if (loading || !userData?.isAdmin) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="نشر إعلان هجرة">
        <Plane className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Plane}
        title="نشر فرصة هجرة جديدة"
        description="هذه الصفحة مخصصة للمشرفين فقط لنشر إعلانات الهجرة والعمل بالخارج."
      />
      <div className="container mx-auto max-w-3xl px-4 pb-12">
        <Card>
          <CardContent className="p-0">
            <PostImmigrationForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
