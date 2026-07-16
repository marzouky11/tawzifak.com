'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostJobForm } from '@/app/post-job/post-job-form';
import { getCategories, getJobById } from '@/lib/data';
import { Loader2, Edit } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Job } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';

export default function EditJobPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchJob = async () => {
      if (params.id) {
        const jobData = await getJobById(params.id as string);
        
        // Ownership check
        if (!jobData || jobData.userId !== user?.uid) {
          // Instead of notFound(), we redirect on the client side.
          router.push('/profile/my-ads');
          return;
        }

        setJob({ 
          ...jobData, 
          ownerPhotoURL: jobData.ownerPhotoURL || null,
        });
      }
      setLoading(false);
    };

    if (user) {
        fetchJob();
    }
  }, [params.id, user, router]);

  const categories = getCategories();

  if (authLoading || loading) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="تعديل الإعلان">
        <Edit className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Edit}
        title="تعديل الإعلان"
        description="قم بتحديث معلومات إعلانك لضمان وصوله للشخص المناسب."
      />
      <div className="flex-grow">
        <div className="container mx-auto max-w-3xl px-4 pb-12">
          <Card>
            <CardContent className="p-0">
              <AnimatePresence>
                {job ? (
                  <PostJobForm
                    categories={categories}
                    job={job}
                  />
                ) : (
                   <div className="flex justify-center p-8">
                    <p>الإعلان غير موجود.</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
