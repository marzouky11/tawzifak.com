
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Bookmark, Frown } from 'lucide-react';
import { getSavedAds } from '@/lib/data';
import type { Job, Competition, ImmigrationPost } from '@/lib/types';
import { JobCard } from '@/components/job-card';
import { CompetitionCard } from '@/components/competition-card';
import { ImmigrationCard } from '@/components/immigration-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function isJob(item: Job | Competition | ImmigrationPost): item is Job {
  return 'postType' in item;
}

function isCompetition(item: Job | Competition | ImmigrationPost): item is Competition {
  return 'organizer' in item;
}

function isImmigration(item: Job | Competition | ImmigrationPost): item is ImmigrationPost {
  return 'programType' in item;
}

export default function SavedAdsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [savedItems, setSavedItems] = useState<(Job | Competition | ImmigrationPost)[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(true);
        getSavedAds(user.uid)
          .then(items => {
            setSavedItems(items);
          })
          .catch(err => {
            console.error("Failed to fetch saved ads:", err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [user, authLoading, router]);

  const renderContent = () => {
    if (authLoading || loading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (savedItems.length === 0) {
      return (
        <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
          <Frown className="w-16 h-16 text-muted-foreground/50" />
          <p>لم تقم بحفظ أي إعلانات بعد.</p>
          <div className="flex gap-4">
            <Button asChild>
                <Link href="/jobs">تصفح الوظائف</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/immigration">تصفح فرص الهجرة</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {savedItems.map(item => {
          if (isJob(item)) {
            return <JobCard key={`job-${item.id}`} job={item} />;
          }
          if (isCompetition(item)) {
            return <CompetitionCard key={`comp-${item.id}`} competition={item} />;
          }
          if (isImmigration(item)) {
            return <ImmigrationCard key={`imm-${item.id}`} post={item} />;
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <>
      <MobilePageHeader title="الإعلانات المحفوظة">
        <Bookmark className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Bookmark}
        title="الإعلانات المحفوظة"
        description="هنا تجد جميع الوظائف والمباريات التي قمت بحفظها للرجوع إليها لاحقًا."
      />
      <div className="flex-grow">
        <div className="container mx-auto max-w-7xl px-4 pb-12">
          <Card>
            <CardContent className="pt-6">
              {renderContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
