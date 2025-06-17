'use client';
import { useContext, useState, useEffect, useRef } from 'react';
import SearchContext from './SearchContext';
import 학원DATA from '../../data/seoulAcademy.json';

export default function HeaderSearch() {
    const { setKeyword, setApplyFilter } = useContext(SearchContext);
    const [localInput, setLocalInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const wrapperRef = useRef(null); // 👈 외부 클릭 감지용 ref

    // 🔍 자동완성 필터링
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

    // 👂 외부 클릭 시 목록 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative z-50">
            <header className="bg-[#4B2EFF] text-white px-4 py-3 flex items-center space-x-3">
                <span className="material-symbols-outlined text-2xl">home</span>
                <div className="flex-1 relative">
                    <input
                        className="w-full p-2 rounded-md text-black"
                        placeholder="학원명을 입력하세요"
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <ul className="absolute w-full bg-white border text-black rounded shadow mt-1 max-h-40 overflow-y-auto">
                            {suggestions.map((name, idx) => (
                                <li
                                    key={idx}
                                    className="p-2 hover:bg-blue-100 cursor-pointer"
                                    onMouseDown={() => {
                                        setLocalInput(name);
                                        setKeyword(name);
                                        setApplyFilter(true);
                                        setSuggestions([]); // ✅ 드롭다운 닫기
                                    }}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    onClick={() => {
                        setKeyword(localInput);
                        setApplyFilter(true);
                        setSuggestions([]); // ✅ 검색 시 닫기
                    }}
                    className="bg-white text-[#4B2EFF] px-2 py-1 rounded"
                >
                    <span className="material-symbols-outlined">search</span>
                </button>
            </header>
        </div>
    );
}
