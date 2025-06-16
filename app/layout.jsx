// import '../styles/globals.css';
// import { Footer } from '../components/footer';
import { Header } from '../components/header';

// export const metadata = {
//     title: {
//         template: '%s | Netlify',
//         default: 'Netlify Starter'
//     }
// };

// export default function RootLayout({ children }) {
//     return (
//         <html lang="en" data-theme="lofi">
//             <head>
//                 <link rel="icon" href="/favicon.svg" sizes="any" />
//                 <meta name="google-adsense-account" content="ca-pub-8042920644832260"></meta>
//                 <script
//                     async
//                     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8042920644832260"
//                     crossOrigin="anonymous"
//                 ></script>
//             </head>
//             <body className="antialiased text-white bg-blue-900">
//                 <div className="flex flex-col min-h-screen px-6 bg-grid-pattern sm:px-12">
//                     <div className="flex flex-col w-full max-w-5xl mx-auto grow">
//                         <Header />
//                         <div className="grow">{children}</div>
//                         <Footer />
//                     </div>
//                 </div>
//             </body>
//         </html>
//     );
// }

import '../styles/globals.css';

export const metadata = {
    title: {
        template: '%s | Netlify',
        default: 'Netlify Starter'
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="ko" data-theme="lofi">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <meta name="google-adsense-account" content="ca-pub-8042920644832260" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8042920644832260"
                    crossOrigin="anonymous"
                ></script>
            </head>
            <body className="antialiased bg-white text-black">
                <div className="flex flex-col min-h-screen pb-16">
                    {' '}
                    {/* 👈 bottom 공간 확보 */}
                    {/* 상단 헤더 */}
                    <header className="bg-[#4B2EFF] text-white px-4 py-3 flex items-center space-x-3">
                        <span className="material-symbols-outlined text-2xl">home</span>
                        <input className="flex-1 p-2 rounded-md text-black" placeholder="8. 올림픽파크포레온" />
                        <span className="material-symbols-outlined text-2xl">notifications</span>
                    </header>
                    {/* 본문 콘텐츠 */}
                    <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
                    {/* 하단 탭바 (고정) */}
                    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t py-2 text-sm text-gray-700 shadow">
                        {[
                            { label: '홈', icon: 'home' },
                            { label: '분양', icon: 'event_note' },
                            { label: '관심', icon: 'favorite' },
                            { label: '전체', icon: 'menu' }
                        ].map(({ label, icon }) => (
                            <button key={label} className="flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-xl">{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </body>
        </html>
    );
}
