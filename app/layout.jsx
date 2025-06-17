// import '../styles/globals.css';
// import { Footer } from '../components/footer';
import { Header } from '../components/header';
import HeaderSearch from './components/HeaderSearch';
import SearchContext from './components/SearchContext'; // ✅ 추가
import Providers from './providers'; // ✅ Client 부분은 여기서 import
import GoogleAd from './components/GoogleAd';
import '../styles/globals.css';
import Link from 'next/link'; // ✅ 추가

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
                <Providers>
                    <div className="flex flex-col min-h-screen pb-16">
                        {/* ✅ 상단 검색 헤더 삽입 */}
                        <HeaderSearch />
                        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
                        {/* 👇 하단 탭바는 그대로 유지 */}
                        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t py-2 text-sm text-gray-700 shadow">
                            {[
                                { label: '홈', icon: 'home', path: '/' },
                                { label: '분양', icon: 'event_note', path: '/분양' },
                                { label: '관심', icon: 'favorite', path: '/screen/interest' },
                                { label: '전체', icon: 'menu', path: '/전체' }
                            ].map(({ label, icon, path }) => (
                                <Link
                                    href={path}
                                    key={label}
                                    className="flex flex-col items-center justify-center no-underline text-inherit"
                                >
                                    <span className="material-symbols-outlined text-xl">{icon}</span>
                                    <span>{label}</span>
                                </Link>
                            ))}
                        </nav>
                        <GoogleAd /> {/* ✅ 여기에 위치해야 합니다 */}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
