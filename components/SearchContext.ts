// app/components/SearchContext.js
'use client';
import { createContext } from 'react';

const SearchContext = createContext({
    keyword: '',
    setKeyword: (k: string) => {},
    applyFilter: false,
    setApplyFilter: (v: boolean) => {} // ✅ boolean 인자 받도록 명시
});

export default SearchContext;
