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
                    <div className="relative h-screen overflow-hidden">
                        {/* ✅ HeaderSearch 고정 */}
                        <div className="fixed top-0 left-0 right-0 z-50 bg-[#4B2EFF]">
                            <HeaderSearch />
                        </div>

                        {/* ✅ 가운데 main에 padding-top 추가 (헤더 높이만큼 여유 줘야 가리지 않음) */}
                        {/* ✅ 가운데 스크롤 가능한 콘텐츠 */}
                        <main className="pt-[60px] pb-[140px] h-full overflow-y-auto">{children}</main>

                        {/* ✅ 하단 탭바 고정 */}
                        <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around bg-white border-t py-2 text-sm text-gray-700 shadow">
                            {[
                                { label: 'AI 교육상담', icon: 'ask', path: '/screen/ask' },
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

                        {/* 광고 */}
                        <GoogleAd />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
