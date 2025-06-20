'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RssDetail({ params }) {
    const router = useRouter();
    const slug = params.slug;
    const [item, setItem] = useState(null);

    useEffect(() => {
        if (!slug) return;

        const fetchRss = async () => {
            const res = await fetch('/api/rss');
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'application/xml');
            const found = Array.from(xml.querySelectorAll('item')).find((item) =>
                item.querySelector('link')?.textContent.endsWith(slug)
            );
            if (found) {
                setItem({
                    title: found.querySelector('title')?.textContent ?? '',
                    content: found.querySelector('description')?.textContent ?? '',
                    link: found.querySelector('link')?.textContent ?? ''
                });
            }
        };

        fetchRss();
    }, [slug]);

    if (!item) return <p>Loading...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            {/* ✅ 뒤로가기 버튼 */}
            <button
                onClick={() => router.push('/')}
                style={{
                    background: '#3498db',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                ← 목록으로 돌아가기
            </button>
            <h2>{item.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
            <p style={{ marginTop: '2rem' }}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                    원문 보기 ↗
                </a>
            </p>
        </div>
    );
}
