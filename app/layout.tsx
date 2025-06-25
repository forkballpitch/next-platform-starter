import type { Metadata } from 'next';
import { noto_sans } from './fonts';
import './globals.css';
import { NextLayout, NextProvider } from './providers';

export const metadata: Metadata = {
    metadataBase: new URL('https://fastcampus-nextbnb.vercel.app'),
    alternates: {
        canonical: '/'
    },
    title: 'Fastcampus Nextbnb로 여행하기',
    description: 'Fastcampus Nextbnb로 여행을 계획해보세요.',
    keywords: ['Nextbnb', '여행', '숙소', '호텔', '펜션', '최저가'],
    openGraph: {
        title: 'nextbnb로 여행하기',
        description: 'nextbnb로 여행을 계획해보세요',
        url: 'https://fastcampus-nextbnb.vercel.app',
        siteName: 'Fastcampus Nextbnb',
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
