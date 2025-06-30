'use client';

import { NavermapsProvider } from 'react-naver-maps';
import dynamic from 'next/dynamic';

import AptHeaderSearch from '@/components/realestate/AptHeaderSearch';
import { RegionProvider } from '@/components/realestate/RegionContext'; // ✅ RegionProvider import
import RegionSelector from '@/components/realestate/RegionSelector';

const AptMapsMarkerCluster = dynamic(() => import('@/components/realestate/AptMapsMarkerCluster'), {
    ssr: false
});

export default function AptMapWrapper() {
    const naverKey = 'u7amr5n722';

    return (
        <RegionProvider>
            {' '}
            {/* ✅ 전역 상태 관리자 (Context)*/}
            <NavermapsProvider ncpKeyId={naverKey}>
                <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
                    <AptHeaderSearch />
                    {/* <RegionSelector /> */}
                    <AptMapsMarkerCluster />
                </div>
            </NavermapsProvider>
        </RegionProvider>
    );
}

// <AptMapWrapper>
//   ├─ <RegionProvider> ← ✅ 전역 상태 관리자 (Context)
//       ├─ <NavermapsProvider>
//           ├─ <AptHeaderSearch />
//           ├─ <RegionSelector /> ← 구/동 선택, API 호출 후 상태 저장
//           └─ <AptMapsMarkerCluster /> ← 상태 변경 감지 → 지도 마커 다시 그림

// <RegionProvider>  ← ✅ 여기서 상태들을 제공
//   ├─ <RegionSelector />        ← 상태를 "설정" (예: setAptDeals)
//   └─ <AptMapsMarkerCluster />  ← 상태를 "읽음" (예: aptDeals)
// RegionProvider 내부에는 상태와 이를 바꾸는 함수들이 있습니다:

// tsx
// 복사
// 편집
// const [aptDeals, setAptDeals] = useState<AptDeal[]>([]);
// useRegion() 훅으로 하위 컴포넌트에서 이 값들을 사용할 수 있습니다:

// tsx
// 복사
// 편집
// // RegionSelector.tsx
// const { setAptDeals } = useRegion(); // setter 사용

// // AptMapsMarkerCluster.tsx
// const { aptDeals } = useRegion(); // 상태를 구독
// 이렇게 연결되어 있으니, setAptDeals()가 호출되면, aptDeals를 구독하고 있던 AptMapsMarkerCluster가 자동으로 업데이트됩니다.

// useEffect(() => { ... }, [dependencies]) 는 **지정된 dependencies(의존성 값)**이 변할 때마다 실행되는 React의 리액티브(reactive) 메커니즘입니다.
// 이 구조는 **전역 상태(여기서는 Context로부터 가져온 값)**가 바뀔 때마다, 해당 효과(useEffect)가 반응하게 합니다.
