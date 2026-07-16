
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { EditCompetitionForm } from './edit-competition-form';
import { getCompetitionById } from '@/lib/data';
import { Loader2, Edit } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Competition } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';

export default function EditCompetitionPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!userData?.isAdmin) {
        router.push('/');
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    const fetchCompetition = async () => {
      if (params.id) {
        const competitionData = await getCompetitionById(params.id as string);
        if (!competitionData) {
          router.push('/profile/my-ads');
          return;
        }
        setCompetition({ ...competitionData, positionsAvailable: competitionData.positionsAvailable || null });
      }
      setLoading(false);
    };

    if (userData?.isAdmin) {
        fetchCompetition();
    }
  }, [params.id, userData, router]);

  if (authLoading || loading || !userData?.isAdmin) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="تعديل المباراة">
        <Edit className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Edit}
        title="تعديل المباراة العمومية"
        description="قم بتحديث معلومات المباراة لضمان دقتها."
      />
      <div className="flex-grow">
        <div className="container mx-auto max-w-3xl px-4 pb-12">
          <Card>
            <CardContent className="p-6 md:p-8">
              <AnimatePresence>
                {competition ? (
                  <EditCompetitionForm competition={competition} />
                ) : (
                  <div className="flex justify-center p-8">
                    <p>المباراة غير موجودة.</p>
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
