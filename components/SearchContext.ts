// app/components/SearchContext.js
'use client';

import { createContext } from 'react';

type Coord = { latitude: number; longitude: number } | null;

const SearchContext = createContext({
    keyword: '',
    setKeyword: (k: string) => {},
    applyFilter: false,
    setApplyFilter: (b: boolean) => {},
    targetCoord: null as Coord,
    setTargetCoord: (c: Coord) => {}
});

export default SearchContext;
