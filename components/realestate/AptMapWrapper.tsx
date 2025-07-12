'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';
import AptHeaderSearch from '@/components/realestate/AptHeaderSearch';
import { RegionProvider, useRegion } from '@/components/realestate/RegionContext';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const AptMapsMarkerCluster = dynamic(() => import('@/components/realestate/AptMapsMarkerCluster'), {
    ssr: false
});

const naverKey = 'u7amr5n722';

// ✅ useSearchParams와 useEffect는 이 내부에서 사용
function MapWithSearchParams() {
    const { setTargetCoord, setKeyword } = useRegion();
    const searchParams = useSearchParams(); // ✅ 여기서 사용

    useEffect(() => {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const keyword = searchParams.get('keyword');

        if (lat && lng) {
            setTargetCoord({ latitude: parseFloat(lat), longitude: parseFloat(lng) });
            if (keyword) setKeyword(keyword);
        }
    }, [searchParams]); // ✅ 의존성에 searchParams 포함

    return (
        <NavermapsProvider ncpKeyId={naverKey}>
            <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
                <AptHeaderSearch />
                <AptMapsMarkerCluster />
            </div>
        </NavermapsProvider>
    );
}

// ✅ 외부에서 Provider로 감싸줌
export default function AptMapWrapper() {
    return (
        <RegionProvider>
            <MapWithSearchParams />
        </RegionProvider>
    );
}
