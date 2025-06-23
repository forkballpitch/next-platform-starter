'use client';

import React, { useEffect, useRef } from 'react';

function KakaoAdFitClient() {
    const adRef = useRef(false);

    useEffect(() => {
        if (adRef.current) return;

        const ins = document.createElement('ins');
        const script = document.createElement('script');

        ins.className = 'kakao_ad_area';
        ins.style.display = 'block';

        const windowSize = window.innerWidth;
        if (windowSize < 1024) {
            ins.setAttribute('data-ad-width', '320');
            ins.setAttribute('data-ad-height', '100');
            ins.setAttribute('data-ad-unit', 'DAN-vVsrSbDLKoi7xYo6'); // ← 모바일용 광고 ID
        } else {
            ins.setAttribute('data-ad-width', '728');
            ins.setAttribute('data-ad-height', '90');
            ins.setAttribute('data-ad-unit', 'DAN-vVsrSbDLKoi7xYo6'); // ← PC용 광고 ID
        }

        script.async = true;
        script.type = 'text/javascript';
        script.src = '//t1.daumcdn.net/kas/static/ba.min.js';

        const container = document.querySelector('.aside__kakaoAdFit');
        if (container) {
            container.appendChild(ins);
            container.appendChild(script);
        }

        adRef.current = true;
    }, []);

    return (
        <aside
            className="aside__kakaoAdFit"
            style={{ marginTop: '5em', marginBottom: '2em', border: '1px solid rgb(232 232 232)', padding: '20px' }}
        />
    );
}

export default React.memo(KakaoAdFitClient);
