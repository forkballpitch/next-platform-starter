'use client';

import { useParams, useRouter } from 'next/navigation';

export default function AcademyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const academyName = decodeURIComponent(params.academyName);

    return (
        <div className="p-4 space-y-4">
            {/* 상단 */}
            {/* ✅ 뒤로가기 버튼 */}
            <button
                onClick={() => router.back()}
                className="mb-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 border text-sm"
            >
                ← 뒤로가기
            </button>

            <div className="bg-[#4B2EFF] text-white p-4 rounded-t-xl">
                <h1 className="text-2xl font-bold text-blue-700">🏫 학원 상세</h1>
                <p className="mt-4 text-lg">
                    선택한 학원명: <strong>{academyName}</strong>
                </p>
                <div className="text-sm">TEXT</div>
                <div className="text-xl font-bold">TEXT</div>
                <div className="mt-1 text-xs">TEXT</div>
            </div>

            {/* 현재 시세 정보 */}
            <div className="bg-white shadow-md rounded-b-xl p-4">
                <div className="flex justify-between">
                    <div>
                        <div className="text-sm text-gray-600">TEXT</div>
                        <div className="text-2xl font-bold text-[#4B2EFF]">TEXT</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">TEXT</div>
                        <div className="text-xl font-semibold">TEXT</div>
                    </div>
                </div>
            </div>

            {/* 그래프 예시 */}
            <div className="p-4 border rounded">
                <p className="text-sm text-gray-600 mb-2">TEXT</p>
                <div className="bg-gray-100 h-32 flex items-center justify-center text-gray-400">TEXT</div>
            </div>

            {/* 실거래 내역 */}
            <div>
                <p className="text-sm font-semibold mb-2">TEXT</p>
                <div className="border p-3 rounded mb-2 text-sm flex justify-between">
                    <div>
                        <div className="text-xs text-gray-500">TEXT</div>
                        <div className="font-bold">TEXT</div>
                    </div>
                    <button className="bg-[#4B2EFF] text-white px-3 py-1 text-xs rounded">TEXT</button>
                </div>
            </div>
        </div>
    );
}
