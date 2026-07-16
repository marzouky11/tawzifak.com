
import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedJobById } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { User as UserIcon } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { WorkerDesktopDetails } from './worker-desktop-details';
import { WorkerMobileDetails } from './worker-mobile-details';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getCachedJobById(id);
  
  if (!job) {
    return {
      title: 'الإعلان غير موجود',
    };
  }

  // Allow indexing of job seeker profiles
  return {
    title: job.title,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function WorkerDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params;
    const job = await getCachedJobById(id);

    if (!job || job.postType !== 'seeking_job') {
        notFound();
    }
    
    return (
        <>
            <MobilePageHeader title="ملف باحث عن عمل">
                <UserIcon className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={UserIcon}
                title="ملف باحث عن عمل"
                description="استعرض مهارات وخبرات هذا المرشح وتواصل معه مباشرة."
            />
            <div className="container flex justify-center">
              
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <WorkerMobileDetails job={job} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <WorkerDesktopDetails job={job} />
            </div>
        </>
    );
}
