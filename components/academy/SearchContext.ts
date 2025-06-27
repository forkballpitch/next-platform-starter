'use client';

import { createContext } from 'react';

interface Coord {
    latitude: number;
    longitude: number;
}

interface SearchContextType {
    keyword: string;
    setKeyword: (k: string) => void;
    applyFilter: boolean;
    setApplyFilter: (b: boolean) => void;
    targetCoord: Coord;
    setTargetCoord: (c: Coord) => void;

    // 👇 추가한 구/동 관련 상태
    selectedGu: string;
    setSelectedGu: (gu: string) => void;
    selectedRegionCode: string;
    setSelectedRegionCode: (code: string) => void;
}

const SearchContext = createContext<SearchContextType>({} as SearchContextType);
export default SearchContext;
