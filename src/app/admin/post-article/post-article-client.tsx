
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostArticleForm } from './post-article-form';
import { getArticleById } from '@/lib/data';
import { Loader2, Newspaper, Edit } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Article } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';

export default function PostArticleClient() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!!articleId);
  
  const isEditing = !!articleId;

  useEffect(() => {
    if (!authLoading) {
      if (!user || !userData?.isAdmin) {
        router.push('/login');
      }
    }
  }, [user, userData, authLoading, router]);

  useEffect(() => {
    if (isEditing && userData?.isAdmin) {
      const fetchArticle = async () => {
        setLoading(true);
        const articleData = await getArticleById(articleId!);
        if (!articleData) {
          router.push('/admin/post-article'); // Redirect if article not found
          return;
        }
        setArticle(articleData);
        setLoading(false);
      };
      fetchArticle();
    }
  }, [articleId, isEditing, userData, router]);

  if (authLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MobilePageHeader title={isEditing ? 'تعديل المقال' : 'نشر مقال جديد'}>
        <Newspaper className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={isEditing ? Edit : Newspaper}
        title={isEditing ? 'تعديل المقال' : 'نشر مقال جديد'}
        description={isEditing ? 'قم بتحديث محتوى المقال وتفاصيله.' : 'هذه الصفحة مخصصة للمشرفين فقط لنشر المقالات.'}
      />
      <div className="container mx-auto max-w-3xl px-4 pb-12">
        <Card>
          <CardContent className="p-6 md:p-8">
            <AnimatePresence>
                {isEditing ? (
                    article ? <PostArticleForm article={article} /> : <p>المقال غير موجود.</p>
                ) : (
                    <PostArticleForm />
                )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
