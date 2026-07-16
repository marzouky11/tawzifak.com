

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, Loader2 } from 'lucide-react';
import { toggleSaveAd, getSavedAdIds } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { revalidateAll } from '@/lib/revalidate';

interface SaveAdButtonProps {
  adId: string;
  adType: 'job' | 'competition' | 'immigration';
}

export function SaveAdButton({ adId, adType }: SaveAdButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getSavedAdIds(user.uid).then(savedIds => {
        setIsSaved(savedIds.includes(adId));
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [user, adId]);

  const handleSaveToggle = async () => {
    buttonRef.current?.blur();
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'مطلوب تسجيل الدخول',
        description: 'يجب عليك تسجيل الدخول أولاً لحفظ الإعلانات.',
      });
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    setIsLoading(true);
    try {
      const newSaveStatus = await toggleSaveAd(user.uid, adId, adType);
      await revalidateAll();
      setIsSaved(newSaveStatus);
      toast({
        title: newSaveStatus ? 'تم الحفظ بنجاح!' : 'تمت إزالة الحفظ',
        description: newSaveStatus ? 'يمكنك العثور على الإعلان في صفحة الإعلانات المحفوظة.' : 'تمت إزالة الإعلان من قائمتك المحفوظة.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ أثناء محاولة حفظ الإعلان. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="default"
      className={cn(
        "h-10 px-4 active:scale-95 transition-transform",
        isSaved && "bg-primary/10 border-primary/20 text-primary"
      )}
      onClick={handleSaveToggle}
      disabled={authLoading || isLoading}
    >
      {isLoading || authLoading ? (
        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
      ) : (
        <Bookmark
          className={cn(
            "ml-2 h-4 w-4 transition-colors",
            isSaved && "fill-current"
          )}
        />
      )}
      <span>{isSaved ? 'تم الحفظ' : 'حفظ الإعلان'}</span>
    </Button>
  );
}
