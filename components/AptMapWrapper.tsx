// components/NaverMapWrapper.tsx
'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';

import AptHeaderSearch from '@/components/AptHeaderSearch';
import Providers from '@/components/providers';

const AptMapsMarkerCluster = dynamic(() => import('@/components/AptMapsMarkerCluster'), {
    ssr: false
});

export default function AptMapWrapper() {
    const naverKey = 'u7amr5n722';

    return (
        <Providers>
            <NavermapsProvider ncpKeyId={naverKey}>
                <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
                    <AptHeaderSearch /> {/* 🔍 검색바 추가 */}
                    <AptMapsMarkerCluster />
                </div>
            </NavermapsProvider>
        </Providers>
    );
}
