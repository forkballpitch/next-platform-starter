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
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: React.ReactNode }) {
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const [selectedGuCd, setSelectedGuCd] = useState('');
    const [selectedDongCd, setSelectedDongCd] = useState('');
    const [aptDeals, setAptDeals] = useState<AptDeal[]>([]);

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
                setAptDeals
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
