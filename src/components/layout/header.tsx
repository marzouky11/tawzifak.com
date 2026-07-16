'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  LogOut,
  User as UserIcon,
  Settings,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ThemeToggleButton } from '../theme-toggle';
import { Skeleton } from '@/components/ui/skeleton';

const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/jobs', label: 'الوظائف' },
    { href: '/immigration', label: 'الهجرة' },
    { href: '/competitions', label: 'المباريات' },
    { href: '/workers', label: 'العمال' },
];

function AuthSection() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'تم تسجيل الخروج بنجاح.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تسجيل الخروج.' });
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  if (user && userData) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <UserAvatar name={userData.name} color={userData.avatarColor} photoURL={userData.photoURL} className="h-8 w-8" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={16}>
          <div dir="rtl">
            <DropdownMenuLabel>
              <p>{userData.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{userData.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
              <Link href="/profile" className="flex-row">
                <Settings className="h-4 w-4" />
                <span>الإعدادات</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex-row text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild className="active:scale-95 transition-transform">
        <Link href="/login">تسجيل الدخول</Link>
      </Button>
      <Button asChild className="hidden sm:inline-flex active:scale-95 transition-transform">
        <Link href="/signup">إنشاء حساب</Link>
      </Button>
    </div>
  );
}


export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="hidden md:block bg-card border-b sticky top-0 z-50">
      <nav className="container relative flex items-center justify-between h-20">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/LOGO2.png" alt="شعار توظيفك" width={140} height={38} priority />
          </Link>
          <div className="flex items-center gap-1 xl:gap-6">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-base lg:text-lg font-medium transition-colors hover:text-primary px-2 py-1 lg:px-0 lg:py-0 rounded-md',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggleButton />
          <Button asChild className="shrink-0 active:scale-95 transition-transform">
            <Link href="/post-job/select-type">
              <Plus className="ml-2 h-4 w-4" />
              <span className="hidden lg:inline">نشر إعلان</span>
               <span className="lg:hidden">إعلان</span>
            </Link>
          </Button>

          <AuthSection />
        </div>
      </nav>
    </header>
  );
    }
