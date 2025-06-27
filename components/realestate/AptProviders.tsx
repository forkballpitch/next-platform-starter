'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
    setSelectedGu: (gu: string) => void;
    selectedDong: string;
    setSelectedDong: (dong: string) => void;
    aptDeals: AptDeal[];
    setAptDeals: (deals: AptDeal[]) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function AptProviders({ children }: { children: ReactNode }) {
    const [selectedGu, setSelectedGu] = useState('');
    const [selectedDong, setSelectedDong] = useState('');
    const [aptDeals, setAptDeals] = useState<AptDeal[]>([]);

    return (
        <RegionContext.Provider
            value={{ selectedGu, setSelectedGu, selectedDong, setSelectedDong, aptDeals, setAptDeals }}
        >
            {children}
        </RegionContext.Provider>
    );
}

export function useRegion() {
    const context = useContext(RegionContext);
    if (!context) {
        throw new Error('useRegion must be used within an AptProviders');
    }
    return context;
}
