import type { Metadata } from 'next';
import { noto_sans } from './fonts';
import './globals.css';
import { NextLayout, NextProvider } from './providers';

export const metadata: Metadata = {
    metadataBase: new URL('https://piggymom.vercel.app'),
    alternates: {
        canonical: '/'
    },
    title: '실거래지도',
    description: '실거래지도',
    keywords: ['piggymom', '여행', '숙소', '호텔', '펜션', '최저가'],
    openGraph: {
        title: '실거래지도',
        description: '실거래지도',
        url: 'https://piggymom.vercel.app',
        siteName: '실거래지도',
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
