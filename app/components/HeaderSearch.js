'use client';
import { useContext, useState } from 'react';
import SearchContext from './SearchContext';

export default function HeaderSearch() {
    const { setKeyword, setApplyFilter } = useContext(SearchContext);
    const [localInput, setLocalInput] = useState(''); // 입력 전용 상태

    return (
        <header className="bg-[#4B2EFF] text-white px-4 py-3 flex items-center space-x-3">
            <span className="material-symbols-outlined text-2xl">home</span>
            <input
                className="flex-1 p-2 rounded-md text-black"
                placeholder="학원명을 입력하세요"
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
            />
            <button
                onClick={() => {
                    setKeyword(localInput); // 🔍 이 때만 필터 키워드 반영
                    setApplyFilter(true); // 필터 적용 트리거
                }}
                className="bg-white text-[#4B2EFF] px-2 py-1 rounded"
            >
                <span className="material-symbols-outlined">search</span>
            </button>
        </header>
    );
}
