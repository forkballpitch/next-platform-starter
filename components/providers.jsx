'use client';

import { useState } from 'react';
import SearchContext from '@/components/SearchContext';

export default function Providers({ children }) {
    const [keyword, setKeyword] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);
    const [targetCoord, setTargetCoord] = useState(null); // ✅ 추가

    return (
        <SearchContext.Provider
            value={{
                keyword,
                setKeyword,
                applyFilter,
                setApplyFilter,
                targetCoord, // ✅ 포함
                setTargetCoord // ✅ 포함
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}
