'use client';

import { useContext, useState, useEffect, useRef } from 'react';
import SearchContext from './SearchContext';
import academyData from '@/data/academy/seoulAcademyWithCoords.json';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MapPin, Search } from 'lucide-react';
import { getCoordinates } from '@/app/lib/getCoordinates';
import { fetchPlaceByName } from '@/app/lib/fetchPlaceByName';
const data = academyData as Array<{ ACA_NM: string; [key: string]: any }>;

export default function HeaderSearch() {
    const pathname = usePathname();
    const router = useRouter();
    const { setKeyword, setApplyFilter, setTargetCoord } = useContext(SearchContext);
    const [localInput, setLocalInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (localInput.trim()) {
            const filtered = data.filter((item) => item.ACA_NM.includes(localInput)).map((item) => item.ACA_NM);

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

    const handleSelectPlace = (place: any) => {
        const { latitude, longitude } = place;
        setTargetCoord({ latitude, longitude });
        setShowPopup(false);
        setLocalInput(place.name);
    };

    const handleSearch = async () => {
        setSuggestions([]);
        const trimmed = localInput.trim();
        if (!trimmed) return;

        const matched = data.find((item) => item.aca_nm === trimmed);

        if (matched) {
            setKeyword(trimmed);
            setApplyFilter(true);
            setTargetCoord({ latitude: matched.latitude, longitude: matched.longitude });
        } else {
            try {
                const coord = await getCoordinates(trimmed);
                if (coord) {
                    setTargetCoord(coord);
                }
                const place = await fetchPlaceByName(localInput);
                if (place.places.length > 0) {
                    setSearchResults(place.places);
                    setShowPopup(true);
                } else {
                    alert('❌ 장소를 찾을 수 없습니다.');
                }
            } catch (e) {
                console.error('검색 오류', e);
                alert('검색 중 오류가 발생했습니다');
            }
        }
    };

    if (pathname === '/') {
        return (
            <header className="bg-white text-gray-800 px-4 py-5 text-lg font-semibold text-center shadow">
                코딩학습
            </header>
        );
    }

    return (
        <div
            ref={wrapperRef}
            className="fixed top-0 left-0 right-0 z-50 bg-orange-500 px-4 py-1 shadow-md border-b border-orange-600"
        >
            <header className="flex items-center gap-3">
                {/* 홈 아이콘 */}
                <button
                    onClick={() => router.push('/')}
                    className="text-white hover:text-orange-100 transition-colors p-1"
                >
                    <Home className="w-6 h-6" />
                </button>

                {/* 검색 입력창 */}
                <div className="flex-1 relative">
                    <input
                        className="
                    w-full
                    h-9
                    pl-4
                    pr-10
                    rounded-md
                    text-base
                    text-gray-800
                    placeholder-gray-400
                    border
                    border-orange-300
                    bg-white
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-600
                "
                        placeholder="학원명을 입력하세요"
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-700 hover:text-orange-900"
                        aria-label="검색"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* 추천목록 */}
                    {suggestions.length > 0 && (
                        <ul className="absolute w-full bg-white border text-gray-800 rounded shadow mt-1 max-h-40 overflow-y-auto z-50">
                            {suggestions.map((name, idx) => (
                                <li
                                    key={idx}
                                    className="p-2 hover:bg-orange-100 cursor-pointer"
                                    onMouseDown={() => {
                                        setLocalInput(name);
                                        setKeyword(name);
                                        setApplyFilter(true);
                                        setSuggestions([]);

                                        const matched = data.find((item) => item.aca_nm === name);
                                        if (matched) {
                                            setTargetCoord({
                                                latitude: matched.latitude,
                                                longitude: matched.longitude
                                            });
                                        }
                                    }}
                                >
                                    {name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* 팝업 */}
                    {showPopup && searchResults.length > 0 && (
                        <ul className="absolute w-full bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto z-50 text-gray-800">
                            {searchResults.map((place, idx) => (
                                <li
                                    key={idx}
                                    className="p-2 border-b hover:bg-orange-100 cursor-pointer"
                                    onClick={() => handleSelectPlace(place)}
                                >
                                    <div className="font-semibold text-sm">{place.name}</div>
                                    <div className="text-xs text-gray-600">{place.address}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 학원지도 버튼 */}
                <button
                    onClick={() => router.push('/screen/aptMap')}
                    className="text-white hover:text-yellow-200 transition-colors p-1"
                    aria-label="학원 지도"
                >
                    <MapPin className="w-6 h-6" />
                </button>
            </header>
        </div>
    );
}
