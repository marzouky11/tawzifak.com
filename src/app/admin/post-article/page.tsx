
import { Suspense } from 'react';
import PostArticleClient from './post-article-client';
import { Loader2 } from 'lucide-react';

function PostArticlePageFallback() {
  return (
    <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function PostArticlePage() {
  return (
    <Suspense fallback={<PostArticlePageFallback />}>
      <PostArticleClient />
    </Suspense>
  );
}
