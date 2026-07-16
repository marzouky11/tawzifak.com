'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { CategoryIcon } from '@/components/icons';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const cardStyle = {
    backgroundColor: `${category.color}1A`, // ~10% opacity
    borderColor: category.color,
  };

  const iconStyle = {
    color: category.color,
  };

  return (
    <Link href={`/category/${category.id}`} className="group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl block h-full">
      <Card
        className="flex flex-col items-center justify-center text-center p-3 h-full transition-all duration-300 ease-in-out border group-hover:shadow-md"
        style={cardStyle}
      >
        <CategoryIcon name={category.iconName} className="w-6 h-6 transition-transform group-hover:scale-110" style={iconStyle} />
        <p
          className="mt-2 font-semibold text-xs leading-tight"
          style={{ color: category.color }}
        >
          {category.name}
        </p>
      </Card>
    </Link>
  );
}
