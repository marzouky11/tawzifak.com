
'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateAll() {
  const tags = [
    'stats',
    'jobs-home', 'jobs-list',
    'seekers-home', 'seekers-list',
    'competitions-home', 'competitions-list',
    'immigration-home', 'immigration-list',
    'articles-list', 'articles-home',
    'testimonials', 'testimonials-list', 'testimonials-home',
    'profile',
  ];
  
  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }
}
