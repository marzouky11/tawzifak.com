
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { EditImmigrationForm } from './edit-immigration-form';
import { getImmigrationPostById } from '@/lib/data';
import { Loader2, Edit } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { ImmigrationPost } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';

export default function EditImmigrationPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<ImmigrationPost | null>(null);
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
    const fetchPost = async () => {
      if (params.id) {
        const postData = await getImmigrationPostById(params.id as string);
        if (!postData) {
          router.push('/profile/my-ads');
          return;
        }
        setPost(postData);
      }
      setLoading(false);
    };

    if (userData?.isAdmin) {
        fetchPost();
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
      <MobilePageHeader title="تعديل إعلان الهجرة">
        <Edit className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Edit}
        title="تعديل إعلان الهجرة"
        description="قم بتحديث معلومات فرصة الهجرة لضمان دقتها."
      />
      <div className="flex-grow">
        <div className="container mx-auto max-w-3xl px-4 pb-12">
          <Card>
            <CardContent className="p-6 md:p-8">
              <AnimatePresence>
                {post ? (
                  <EditImmigrationForm post={post} />
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
