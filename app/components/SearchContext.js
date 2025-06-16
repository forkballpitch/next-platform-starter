// app/components/SearchContext.js
'use client';
import { createContext } from 'react';

const SearchContext = createContext({
    keyword: '',
    setKeyword: () => {},
    applyFilter: false,
    setApplyFilter: () => {}
});

export default SearchContext;
