import type { Metadata } from 'next';
import { noto_sans } from './fonts';
import './globals.css';
import { NextLayout, NextProvider } from './providers';

export const metadata: Metadata = {
    metadataBase: new URL('https://fastcampus-nextbnb.vercel.app'),
    alternates: {
        canonical: '/'
    },
    title: '단어공부',
    description: '단어공부',
    keywords: ['Nextbnb', '여행', '숙소', '호텔', '펜션', '최저가'],
    openGraph: {
        title: '단어공부',
        description: '단어공부',
        url: 'https://fastcampus-nextbnb.vercel.app',
        siteName: '단어공부',
        locale: 'ko_KR',
        type: 'website'
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true
        }
    }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <meta name="google-adsense-account" content="ca-pub-3543954618628961" />
            <body className={`${noto_sans.className} h-screen flex flex-col overflow-hidden`}>
                <NextProvider>
                    <NextLayout>{children}</NextLayout>
                </NextProvider>
            </body>
        </html>
    );
}
