'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function RssList() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        const fetchRss = async () => {
            try {
                const res = await fetch('/api/rss');
                const text = await res.text();
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, 'application/xml');
                const parsedItems = Array.from(xml.querySelectorAll('item')).map((item) => ({
                    title: item.querySelector('title')?.textContent ?? '',
                    link: item.querySelector('link')?.textContent ?? '',
                    slug: item.querySelector('link')?.textContent.split('/').pop() ?? '',
                    pubDate: item.querySelector('pubDate')?.textContent ?? ''
                }));
                setItems(parsedItems);
            } catch (err) {
                console.error('RSS fetch error:', err);
            } finally {
                setLoading(false); // 완료 시 로딩 false
            }
        };

        fetchRss();
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>📰 코딩학습(Backend)</h2>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner" />
                    <p>로딩 중입니다...</p>
                </div>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.slug} style={{ margin: '1rem 0' }}>
                            <Link href={`/screen/rss/${item.slug}`}>
                                <span style={{ cursor: 'pointer', fontSize: '1.1rem', color: 'blue' }}>
                                    {item.title}
                                </span>
                            </Link>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.pubDate}</div>
                        </li>
                    ))}
                </ul>
            )}

            {/* 간단한 CSS */}
            <style jsx>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto;
                    border: 5px solid lightgray;
                    border-top: 5px solid #3498db;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
