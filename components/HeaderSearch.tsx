'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import SearchContext from './SearchContext';
import 학원DATA from '@/data/seoulAcademyWithCoords.json';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search } from 'lucide-react';

export default function HeaderSearch() {
    const pathname = usePathname();
    const router = useRouter();
    const { setKeyword, setApplyFilter } = useContext(SearchContext);
    const [localInput, setLocalInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (localInput.trim()) {
            const filtered = 학원DATA.DATA.filter((item) => item.aca_nm.includes(localInput)).map(
                (item) => item.aca_nm
            );
            setSuggestions(filtered.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    }, [localInput]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (pathname === '/') {
        return (
            <header className="bg-orange-500 text-white px-4 py-5 text-lg font-semibold text-center">코딩학습</header>
        );
    }

    return (
        <div ref={wrapperRef} className="fixed top-0 left-0 right-0 z-50 bg-orange-500 px-4 py-5 shadow-md">
            <header className="flex items-center gap-3">
                {/* 홈 아이콘 */}
                <button
                    onClick={() => router.push('/')}
                    className="text-white hover:text-yellow-200 transition-colors p-1"
                >
                    <Home className="w-6 h-6" />
                </button>

                {/* 검색 입력창 */}
                <div className="flex-1 relative">
                    <input
                        className="w-full p-2 pl-4 pr-4 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="학원명을 입력하세요"
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute w-full bg-white border text-black rounded shadow mt-1 max-h-40 overflow-y-auto z-50">
                            {suggestions.map((name, idx) => (
                                <li
                                    key={idx}
                                    className="p-2 hover:bg-blue-100 cursor-pointer"
                                    onMouseDown={() => {
                                        setLocalInput(name);
                                        setKeyword(name);
                                        setApplyFilter(true);
                                        setSuggestions([]);
                                    }}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 검색 아이콘 버튼 */}
                <button
                    onClick={() => {
                        setKeyword(localInput);
                        setApplyFilter(true);
                        setSuggestions([]);
                    }}
                    className="bg-white text-orange-500 p-2 rounded-md hover:bg-orange-100 transition-colors"
                    aria-label="검색"
                >
                    <Search className="w-5 h-5" />
                </button>
            </header>
        </div>
    );
}
