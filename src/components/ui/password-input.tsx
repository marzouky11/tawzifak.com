'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * حقل إدخال كلمة مرور مع زر إظهار/إخفاء داخل الخانة، بنفس تصميم
 * حقول الإدخال المستخدمة في باقي الموقع.
 */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pl-10', className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
