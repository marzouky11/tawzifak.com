
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostJobForm } from './post-job-form';
import { Loader2, PlusCircle } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Category, Job, PostType } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getJobsByUserId } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PostJobClientPageProps {
    categories: Category[];
}

export default function PostJobClientPage({ categories }: PostJobClientPageProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const postType = searchParams.get('type') as PostType | null;
  const [checkingExistingAd, setCheckingExistingAd] = useState(true);
  const [existingSeekerAd, setExistingSeekerAd] = useState<Job | null>(null);

  useEffect(() => {
    if (!loading) {
        if (!user) {
          router.push(`/login?redirect=/post-job?${searchParams.toString()}`);
          return;
        }

        if (!postType && !window.location.pathname.includes('edit-job')) {
            router.push('/post-job/select-type');
            return;
        }

        if (postType === 'seeking_worker' && !userData?.isAdmin) {
             toast({
                variant: "destructive",
                title: "صلاحية غير كافية",
                description: "نشر عروض العمل متاح للمشرفين فقط.",
            });
            router.push('/');
        }
    }
  }, [user, userData, loading, router, postType, searchParams, toast]);

  // التحقق مما إذا كان المستخدم قد نشر بالفعل إعلان "باحث عن عمل"
  // لمنع نشر أكثر من إعلان واحد لنفس المستخدم
  useEffect(() => {
    let isCancelled = false;

    async function checkExistingSeekerAd() {
      if (loading || !user || postType !== 'seeking_job') {
        setCheckingExistingAd(false);
        return;
      }

      setCheckingExistingAd(true);
      try {
        const userAds = await getJobsByUserId(user.uid);
        const existingAd = userAds.find((ad) => ad.postType === 'seeking_job') ?? null;
        if (!isCancelled) {
          setExistingSeekerAd(existingAd);
        }
      } catch (error) {
        console.error('Error checking existing job seeker ad:', error);
      } finally {
        if (!isCancelled) {
          setCheckingExistingAd(false);
        }
      }
    }

    checkExistingSeekerAd();

    return () => {
      isCancelled = true;
    };
  }, [user, loading, postType]);

  const pageTitle = postType === 'seeking_job' ? 'نشر طلب عمل' : 'نشر عرض عمل';
  const pageDescription = postType === 'seeking_job' 
    ? "املأ الحقول التالية لعرض مهاراتك وخبراتك للشركات." 
    : "املأ الحقول التالية لنشر فرصة عمل جديدة في المنصة.";

  return (
    <>
      <MobilePageHeader title={pageTitle}>
        <PlusCircle className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={PlusCircle}
        title={pageTitle}
        description={pageDescription}
      />
      <div className="flex-grow">
        {(loading || !user || (postType === 'seeking_job' && checkingExistingAd)) ? (
            <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : postType === 'seeking_job' && existingSeekerAd ? (
            <div className="container mx-auto max-w-3xl px-4 pb-12">
                <Alert className="border-primary/50 text-primary text-center">
                    <AlertTitle className="font-bold text-center">لديك إعلان بحث عن عمل منشور بالفعل</AlertTitle>
                    <AlertDescription className="mt-2 space-y-4 text-center">
                        <p>
                            يُسمح بنشر إعلان واحد فقط كباحث عن عمل. يمكنك تعديل إعلانك الحالي،
                            أو الذهاب إلى صفحة إعلاناتي لإدارته.
                        </p>
                        <div className="flex flex-row flex-nowrap gap-3 justify-center">
                            <Button asChild>
                                <Link href={`/edit-job/${existingSeekerAd.id}`}>تعديل إعلاني الحالي</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/profile/my-ads">الذهاب إلى إعلاناتي</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        ) : (
            <div className="container mx-auto max-w-3xl px-4 pb-12">
                <Card>
                  <CardContent className="p-0">
                    <AnimatePresence>
                        {postType && <PostJobForm categories={categories} preselectedType={postType} />}
                    </AnimatePresence>
                  </CardContent>
                </Card>
            </div>
        )}
      </div>
    </>
  );
}
