'use client';

import { useRouter } from 'next/navigation';

export default function PreschoolLevelSelect() {
    const router = useRouter();

    const handleSelect = (age: number) => {
        // age에 따라 다른 경로를 만들어 연결할 수도 있습니다
        // 예를 들어 age === 5 이면 /wordgame?level=5 로 이동
        router.push(`/screen/interest?level=${age}`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-yellow-100 to-pink-100 relative">
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                ← 뒤로가기
            </button>

            <h1 className="text-2xl font-bold mb-8">🧒 유치부 단어 학습</h1>
            <p className="mb-4 text-gray-600">나이를 선택해주세요</p>
            <div className="flex gap-4">
                <button
                    onClick={() => handleSelect(5)}
                    className="bg-green-400 text-white px-6 py-3 rounded shadow hover:bg-green-500"
                >
                    5세
                </button>
                <button
                    onClick={() => handleSelect(6)}
                    className="bg-blue-400 text-white px-6 py-3 rounded shadow hover:bg-blue-500"
                >
                    6세
                </button>
                <button
                    onClick={() => handleSelect(7)}
                    className="bg-purple-400 text-white px-6 py-3 rounded shadow hover:bg-purple-500"
                >
                    7세
                </button>
            </div>
        </div>
    );
}
