import { NextLayout, NextProvider } from '@/app/providers';

export default function RssLayout({ children }: { children: React.ReactNode }) {
    return <NextProvider>{children}</NextProvider>;
}
