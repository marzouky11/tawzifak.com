
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function HomePageFilters() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      // Default to searching jobs, user can switch on the results page
      router.push(`/jobs?${params.toString()}`);
    } else {
       router.push(`/jobs`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 items-center">
      <div className="relative w-full flex-grow">
        <Input
          placeholder="ابحث عن وظيفة أو فرصة الهجرة..."
          className="h-16 text-lg rounded-2xl pl-4 pr-16 border-2 border-primary/20 bg-background shadow-lg focus-visible:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button type="submit" size="icon" className="rounded-full h-10 w-10">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
