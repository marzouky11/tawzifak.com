'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Plus, Plane, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

const mainNavItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/jobs', label: 'الوظائف', icon: Briefcase },
  { href: '/immigration', label: 'الهجرة', icon: Plane },
  { href: '/competitions', label: 'المباريات', icon: Landmark },
];

const Fab = () => (
    <div className="relative -top-8 z-10">
        <Link href="/post-job/select-type" className="block">
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full shadow-lg border-4 border-background">
                <Plus className="w-8 h-8 text-primary-foreground" />
            </div>
        </Link>
    </div>
);


function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const pathname = usePathname();
    const isActive = (href === '/' && pathname === '/') || (href !== '/' && pathname.startsWith(href));

    return (
        <Link href={href} className="flex-1">
            <div className="flex flex-col items-center justify-center gap-1 relative">
                <Icon
                    className={cn(
                        'h-6 w-6 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                />
                <span
                    className={cn(
                        'text-xs font-medium transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                >
                    {label}
                </span>
            </div>
        </Link>
    );
}

function BottomNavContent() {
  return (
    <div className="relative flex items-center justify-around h-[68px] bg-card border-t shadow-lg rounded-t-3xl">
      <div className="flex w-full justify-around items-center">
        {/* Left side items */}
        <div className="flex-1 flex justify-around">
            <NavItem href={mainNavItems[0].href} label={mainNavItems[0].label} icon={mainNavItems[0].icon} />
            <NavItem href={mainNavItems[1].href} label={mainNavItems[1].label} icon={mainNavItems[1].icon} />
        </div>
        
        {/* Placeholder for the FAB button */}
        <div className="w-16" />

        {/* Right side items */}
        <div className="flex-1 flex justify-around">
            <NavItem href={mainNavItems[2].href} label={mainNavItems[2].label} icon={mainNavItems[2].icon} />
            <NavItem href={mainNavItems[3].href} label={mainNavItems[3].label} icon={mainNavItems[3].icon} />
        </div>
      </div>
      
      {/* Floating Action Button */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Fab />
      </div>
    </div>
  );
}

export function BottomNav() {
  return (
    <footer className="fixed bottom-0 left-0 z-40 w-full h-[84px] bg-transparent md:hidden flex flex-col justify-end">
      <BottomNavContent />
    </footer>
  );
}
