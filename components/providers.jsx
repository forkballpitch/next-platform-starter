// app/providers.jsx
'use client';
import { useState } from 'react';
import SearchContext from '@/components/SearchContext';

export default function Providers({ children }) {
    const [keyword, setKeyword] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);

    return (
        <SearchContext.Provider value={{ keyword, setKeyword, applyFilter, setApplyFilter }}>
            {children}
        </SearchContext.Provider>
    );
}
