

import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import PostJobClientPage from './post-job-client-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'أنشئ إعلانك الشخصي وشارك مؤهلاتك وخبراتك',
  description: 'أنشئ إعلانك الشخصي الآن وشارك مهاراتك وخبراتك ومؤهلاتك لتظهر أمام أرباب العمل الباحثين عن الكفاءات.',
};

function PostJobPageFallback() {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
}

export default function PostJobPage() {
    const categories = getCategories();
    return (
        <Suspense fallback={<PostJobPageFallback />}>
            <PostJobClientPage categories={categories} />
        </Suspense>
    );
}
