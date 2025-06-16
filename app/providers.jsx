// 'use client';
// import { useState } from 'react';
// import SearchContext from './components/SearchContext';
// import HeaderSearch from './components/HeaderSearch';

// export default function Providers({ children }) {
//     const [keyword, setKeyword] = useState('');

//     return (
//         <SearchContext.Provider value={{ keyword, setKeyword }}>
//             <div className="flex flex-col min-h-screen pb-16">
//                 <HeaderSearch />
//                 <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
//                 <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t py-2 text-sm text-gray-700 shadow">
//                     {[
//                         { label: '홈', icon: 'home' },
//                         { label: '분양', icon: 'event_note' },
//                         { label: '관심', icon: 'favorite' },
//                         { label: '전체', icon: 'menu' }
//                     ].map(({ label, icon }) => (
//                         <button key={label} className="flex flex-col items-center justify-center">
//                             <span className="material-symbols-outlined text-xl">{icon}</span>
//                             <span>{label}</span>
//                         </button>
//                     ))}
//                 </nav>
//             </div>
//         </SearchContext.Provider>
//     );
// }

// app/providers.jsx
'use client';
import { useState } from 'react';
import SearchContext from './components/SearchContext';

export default function Providers({ children }) {
    const [keyword, setKeyword] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);

    return (
        <SearchContext.Provider value={{ keyword, setKeyword, applyFilter, setApplyFilter }}>
            {children}
        </SearchContext.Provider>
    );
}
