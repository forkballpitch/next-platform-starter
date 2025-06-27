'use client';
import { useContext, useState, useEffect, useRef } from 'react';
import SearchContext from '../academy/SearchContext';
import academyData from '@/data/academy/seoulAcademyWithCoords.json';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search } from 'lucide-react';
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
    const [searchResults, setSearchResults] = useState([]); // ✅ 여러 장소 검색 결과용
    const [showPopup, setShowPopup] = useState(false); // ✅ 팝업 표시 여부

    useEffect(() => {
        if (localInput.trim()) {
            const filtered = data.filter((item) => item.aca_nm.includes(localInput)).map((item) => item.aca_nm);
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

    // const handleSearch = async () => {
    //     setKeyword(localInput);
    //     setApplyFilter(true);

    //     const matched = 학원DATA.DATA.find((item) => item.aca_nm.includes(localInput));
    //     if (!matched) {
    //         const place = await fetchPlaceByName(localInput);
    //         if (place) {
    //             setTargetCoord({ latitude: parseFloat(place.y), longitude: parseFloat(place.x) });
    //         }
    //     }
    // };

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

        // 1️⃣ 학원 데이터에서 정확히 일치하는 이름 찾기
        const matched = data.find((item) => item.aca_nm === trimmed);

        if (matched) {
            console.log('🎯 학원명 일치:', matched.aca_nm);
            setKeyword(trimmed);
            setApplyFilter(true);
            setTargetCoord({ latitude: matched.latitude, longitude: matched.longitude }); // ✅ 위치 이동 추가
        } else {
            console.log('📍 학원명 없음, 주소 기반 검색');
            try {
                const coord = await getCoordinates(trimmed);
                if (coord) {
                    console.log('📍 주소 검색 좌표:', coord);
                    setTargetCoord(coord);
                } else {
                    console.log('❌ 해당 장소를 찾을 수 없습니다');
                }

                const place = await fetchPlaceByName(localInput);
                if (place.places.length > 0) {
                    console.log('🛑 팝업보이기');
                    setSearchResults(place.places); // 🔍 여러 결과 저장
                    setShowPopup(true); // 🔔 팝업 표시
                } else {
                    alert('❌ 장소를 찾을 수 없습니다.');
                }
            } catch (e) {
                console.error('🛑 주소 검색 오류:', e);
                alert('검색 중 오류가 발생했습니다');
            }
        }
    };

    if (pathname === '/') {
        return (
            <header className="bg-orange-500 text-white px-4 py-1 text-lg font-semibold text-center">코딩학습</header>
        );
    }

    return (
        <div ref={wrapperRef} className="fixed top-0 left-0 right-0 z-50 bg-orange-500 px-4 py-1 shadow-md">
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
                        className="w-full h-9 pl-4 pr-10 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder=""
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                    />
                    {/* 🔍 input 내부 아이콘 */}
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-700"
                        aria-label="검색"
                    >
                        <Search className="w-4 h-4" />
                    </button>

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

                    {/* ✅ 장소 선택 팝업 */}
                    {showPopup && searchResults.length > 0 && (
                        <ul className="absolute w-full bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto z-50">
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
            </header>
        </div>
    );
}
