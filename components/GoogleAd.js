'use client';
import { useEffect } from 'react';

export default function GoogleAd() {
    useEffect(() => {
        // 스크립트가 이미 있는지 확인
        const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src =
                'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8042920644832260';
            script.async = true;
            script.crossOrigin = 'anonymous';
            document.head.appendChild(script);
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client="ca-pub-8042920644832260"
            data-ad-format="auto"
            data-full-width-responsive="true"
        ></ins>
    );
}
