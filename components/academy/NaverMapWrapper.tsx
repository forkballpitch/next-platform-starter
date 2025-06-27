// components/NaverMapWrapper.tsx
'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';

import HeaderSearch from '@/components/academy/HeaderSearch';
import Providers from '@/components/academy/providers';

const NaverMapsMarkerCluster = dynamic(() => import('@/components/academy/NaverMapsMarkerCluster'), { ssr: false });

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
