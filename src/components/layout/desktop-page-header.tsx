import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DesktopPageHeaderProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

export function DesktopPageHeader({ icon: Icon, title, description, className }: DesktopPageHeaderProps) {
    return (
        <div className={cn("hidden md:block container pt-4 pb-4", className)}>
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                           <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-grow">
                            <CardTitle className="text-2xl font-bold text-primary">
                                {title}
                            </CardTitle>
                            <CardDescription className="mt-1 text-base">
                                {description}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
}
