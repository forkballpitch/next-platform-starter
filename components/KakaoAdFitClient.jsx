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
            ins.setAttribute('data-ad-height', '50');
            ins.setAttribute('data-ad-unit', 'DAN-MClCVgFQQJhZjEyO'); // ← 모바일용 광고 ID
        } else {
            ins.setAttribute('data-ad-width', '728');
            ins.setAttribute('data-ad-height', '90');
            ins.setAttribute('data-ad-unit', 'DAN-MClCVgFQQJhZjEyO'); // ← PC용 광고 ID
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

    return <aside className="aside__kakaoAdFit" style={{ marginTop: '5em', border: '1px solid rgb(232 232 232)' }} />;
}

export default React.memo(KakaoAdFitClient);
