'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import GoogleAd from '@/components/GoogleAd';
import { RecoilRoot } from 'recoil';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import GoogleAnalytics from './googleAnalytics';
import KakaoAd from '@/components/ads/KakaoAdFitClient';
interface Props {
    children?: React.ReactNode;
}

const queryClient = new QueryClient();

export const NextProvider = ({ children }: Props) => {
    return (
        <RecoilRoot>
            <QueryClientProvider client={queryClient}>
                <SessionProvider>
                    <GoogleAnalytics />
                    {children}
                    <Toaster />
                </SessionProvider>
                <ReactQueryDevtools />
            </QueryClientProvider>
        </RecoilRoot>
    );
};

export const NextLayout = ({ children }: Props) => {
    return (
        <div className="flex flex-col h-full">
            <div className="shrink-0">
                <Navbar />
                <KakaoAd />

                {/* 광고 */}
                {/* <GoogleAd /> */}
            </div>
            <main className="flex-1 overflow-y-auto">{children}</main>
            <div className="shrink-0">{/* <Footer /> */}</div>
        </div>
    );
};
