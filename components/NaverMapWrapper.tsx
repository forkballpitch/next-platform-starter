// components/NaverMapWrapper.tsx
'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';

const NaverMapsMarkerCluster = dynamic(() => import('@/components/NaverMapsMarkerCluster'), { ssr: false });

export default function NaverMapWrapper() {
    const naverKey = 'u7amr5n722';

    return (
        <NavermapsProvider ncpKeyId={naverKey}>
            <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
                <NaverMapsMarkerCluster />
            </div>
        </NavermapsProvider>
    );
}
