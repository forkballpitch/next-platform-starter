'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getCoordinates } from '@/app/lib/getCoordinates';

export default function AptSearchPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [message, setMessage] = useState('');

    const handleSearch = async () => {
        if (!keyword.trim()) return;

        const coord = await getCoordinates(keyword);
        if (coord) {
            // 🧭 좌표를 쿼리로 넘기면서 이전 페이지로 이동
            router.push(`/screen/aptMap?lat=${coord.latitude}&lng=${coord.longitude}&keyword=${keyword}`);
        } else {
            setMessage('❌ 해당 위치를 찾을 수 없습니다.');
        }
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="아파트, 지역, 학교명"
                    className="flex-1 border p-2 rounded"
                />
                <button onClick={handleSearch} className="bg-purple-600 text-white px-4 py-2 rounded">
                    검색
                </button>
            </div>
            {message && <p className="text-red-500 mt-2">{message}</p>}
        </div>
    );
}
