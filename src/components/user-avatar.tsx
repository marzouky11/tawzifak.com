
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  photoURL?: string | null;
  color?: string;
  className?: string;
}

export function UserAvatar({ name, photoURL, color, className }: UserAvatarProps) {
  const initials = getInitials(name);
  const fallbackStyle = color && !photoURL ? { backgroundColor: color } : {};

  return (
    <Avatar className={cn('bg-muted', className)}>
      {photoURL && (
        <AvatarImage src={photoURL} alt={name || 'User Avatar'} />
      )}
      <AvatarFallback 
        style={fallbackStyle} 
        className={cn(
          "font-bold text-white", // Always apply white color for text
          !color && "bg-muted", // Use muted background if no color is provided
           // Center content perfectly
          "flex items-center justify-center"
        )}
      >
        {initials ? (
          <span>{initials}</span>
        ) : (
          <User className="h-[60%] w-[60%] text-muted-foreground" /> // Icon color for when there's no name
        )}
      </AvatarFallback>
    </Avatar>
  );
}
