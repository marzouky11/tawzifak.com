
import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { SignupForm } from './signup-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';


export const metadata: Metadata = {
  title: 'إنشاء حساب جديد - الوصول إلى وظائف المغرب',
  description: 'أنشئ حسابك مجانًا للوصول إلى فرص العمل في المغرب وابدأ بإنشاء ملفك كباحث عن عمل بسهولة وسرعة.',
};

function SignupFormFallback() {
  return (
    <div className="flex justify-center items-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <>
      <DesktopPageHeader
  icon={UserPlus}
  title="ابدأ رحلتك المهنية"
  description="سجّل مجانًا للعثور على فرص عمل في المغرب، وعرض مهاراتك وخبراتك أمام أصحاب العمل والمشاريع."
/>
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>
    </>
  );
}
