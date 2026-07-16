'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React from 'react';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {

  const handleMouseUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.blur();
  };
  
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg h-full">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative h-48 w-full">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      <CardHeader>
        <h3 className="text-xl font-bold leading-snug">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {article.summary}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end items-center text-xs text-muted-foreground pt-4 border-t mt-auto">
        <Button asChild variant="link" size="sm" className="p-0 h-auto">
            <Link href={`/articles/${article.slug}`} onMouseUp={handleMouseUp}>
                اقرأ المزيد &gt;
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
