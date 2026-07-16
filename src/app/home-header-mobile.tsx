'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn, Settings } from 'lucide-react';
import { ThemeToggleButton } from '@/components/theme-toggle';
import { Separator } from '@/components/ui/separator';

export function HomeHeaderMobile() {
  const { user, userData, loading } = useAuth();

  const renderAuthButton = () => {
    if (user && userData) {
      return (
        <Button asChild variant="outline" className="h-10 w-auto px-3 rounded-full border-primary/50 text-primary bg-primary/10 active:scale-95 transition-transform">
            <Link href="/profile">
                <Settings className="h-4 w-4" />
                <span className="mr-1.5 font-semibold text-sm">حسابي</span>
            </Link>
        </Button>
      );
    }
    return (
      <Button asChild variant="outline" className="h-10 w-auto px-3 rounded-full border-primary/50 text-primary bg-primary/10 active:scale-95 transition-transform">
        <Link href="/login">
          <LogIn className="h-4 w-4" />
          <span className="mr-1.5 font-semibold text-sm">دخول</span>
        </Link>
      </Button>
    );
  };

  return (
    <>
      {/* الهيدر الثابت مع z-index مرتفع */}
      <div 
        className="md:hidden bg-card text-card-foreground py-3.4 px-4 shadow-md fixed top-0 left-0 right-0 z-[100] rounded-b-2xl border-b-2 border-primary"
      >
        <div className="container mx-auto px-0">
          <div className="flex justify-between items-center">
            <Link href="/">
              <Image src="/LOGO2.png" alt="شعار توظيفك" width={130} height={32} priority />
            </Link>
            <div className="flex items-center gap-2">
                <ThemeToggleButton className="text-primary bg-background/50 hover:bg-background/70 h-10 w-10 rounded-full border border-primary/20" />
                <Separator orientation="vertical" className="h-6" />
                {loading ? <Skeleton className="h-10 w-24 rounded-full" /> : renderAuthButton()}
            </div>
          </div>
        </div>
      </div>
      
      {/* فراغ أقل أسفل الهيدر لتجنب تداخل المحتوى */}
      <div className="md:hidden h-[75px]"></div>
    </>
  );
}
