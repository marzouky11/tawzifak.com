'use client';

import React, { useEffect, useRef, CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from './ui/card';

interface AdsenseAdProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  fullWidthResponsive?: boolean;
  style?: CSSProperties;
}

const AdsenseAd: React.FC<AdsenseAdProps> = ({
  adClient,
  adSlot,
  adFormat = 'auto',
  adLayout,
  fullWidthResponsive = true,
  style = { display: 'block', width: '100%' },
}) => {
  const pathname = usePathname();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current || typeof window === 'undefined') return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.warn('Adsense error', e);
    }
  }, [pathname]);

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ ...style, marginBottom: '12px' }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-ad-layout={adLayout}
          data-full-width-responsive={fullWidthResponsive}
        />
      </div>
    </Card>
  );
};

export default AdsenseAd;
