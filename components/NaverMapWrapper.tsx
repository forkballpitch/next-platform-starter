// components/NaverMapWrapper.tsx
'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';

import HeaderSearch from '@/components/HeaderSearch';
import Providers from '@/components/providers';

const NaverMapsMarkerCluster = dynamic(() => import('@/components/NaverMapsMarkerCluster'), { ssr: false });

export default function NaverMapWrapper() {
    const naverKey = 'u7amr5n722';

    return (
        <Providers>
            <NavermapsProvider ncpKeyId={naverKey}>
                <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
                    <HeaderSearch /> {/* 🔍 검색바 추가 */}
                    <NaverMapsMarkerCluster />
                </div>
            </NavermapsProvider>
        </Providers>
    );
}
