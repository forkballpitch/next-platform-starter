import { Suspense } from 'react';
import AptMapWrapper from '@/components/realestate/AptMapWrapper';

export default function HomePage() {
    return (
        <main>
            <Suspense fallback={<div>지도를 불러오는 중입니다...</div>}>
                <AptMapWrapper />
            </Suspense>
        </main>
    );
}
