'use client';

import { useState } from 'react';

export default function DownloadButton() {
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        const res = await fetch('/api/downloadAptData', { method: 'GET' });
        const data = await res.json();
        setUrl(data.url);
        setLoading(false);
    };

    return (
        <div>
            <button onClick={handleClick} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
                {loading ? '다운로드 중...' : '서울 실거래가 CSV 다운로드'}
            </button>
            {url && (
                <div className="mt-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        CSV 파일 다운로드 링크
                    </a>
                </div>
            )}
        </div>
    );
}
