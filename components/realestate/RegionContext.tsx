'use client';

import React, { createContext, useContext, useState } from 'react';

interface AptDeal {
    apt: string;
    date: string;
    amount: string;
    gu?: string;
    dong?: string;
    jibeon?: string;
    latitude?: number;
    longitude?: number;
}

interface RegionContextType {
    selectedGu: string;
    setSelectedGu: (value: string) => void;
    selectedDong: string;
    setSelectedDong: (value: string) => void;
    selectedGuCd: string;
    setSelectedGuCd: (value: string) => void;
    selectedDongCd: string;
    setSelectedDongCd: (value: string) => void;
    aptDeals: AptDeal[];
    setAptDeals: (deals: AptDeal[]) => void;
    // ✅ 추가
    targetCoord: Coordinate | null;
    setTargetCoord: (coord: Coordinate) => void;
    keyword: string;
    setKeyword: (value: string) => void;
}

interface Coordinate {
    latitude: number;
    longitude: number;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const [selectedGuCd, setSelectedGuCd] = useState('');
    const [selectedDongCd, setSelectedDongCd] = useState('');
    const [aptDeals, setAptDeals] = useState<AptDeal[]>([]);

    // ✅ 추가된 상태들
    const [targetCoord, setTargetCoord] = useState<Coordinate | null>(null);
    const [keyword, setKeyword] = useState('');

    return (
        <RegionContext.Provider
            value={{
                selectedGu,
                setSelectedGu,
                selectedDong,
                setSelectedDong,
                selectedGuCd,
                setSelectedGuCd,
                selectedDongCd,
                setSelectedDongCd,
                aptDeals,
                setAptDeals,
                // ✅ 추가된 값들
                targetCoord,
                setTargetCoord,
                keyword,
                setKeyword
            }}
        >
            {children}
        </RegionContext.Provider>
    );
}

export function useRegion(): RegionContextType {
    const context = useContext(RegionContext);
    if (!context) {
        throw new Error('useRegion must be used within a RegionProvider');
    }
    return context;
}
