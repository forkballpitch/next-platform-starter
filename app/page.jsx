// 'use client';
// // src/App.js
// import { NavermapsProvider } from 'react-naver-maps';

// import dynamic from 'next/dynamic';
// const NaverMapsMarkerCluster = dynamic(() => import('./components/NaverMapsMarkerCluster'), { ssr: false });

// function App() {
//     // ncpClientId에 네이버 지도 API 클라이언트 키를 넣으면 된다.
//     // npx create-react-app으로 프로젝트를 생성했다면-별도의 의존성 설치 없이-프로젝트 최상위 폴더에 .env 파일을 생성하고 키를 기입하면 된다.
//     // .env에는 REACT_APP_NAVER_KEY의 값으로 키를 기입하면 되는데, REACT_APP_라는 prefix에 유의 하자!
//     const naverKey = 'u7amr5n722';

//     return (
//         <NavermapsProvider
//             ncpKeyId={naverKey} // 지도서비스 Client ID
//             error={<p>error</p>}
//             loading={<p>Maps Loading</p>}
//         >
//             <div style={{ display: 'flex', width: '100dvw', height: '100dvh' }}>
//                 <NaverMapsMarkerCluster />
//             </div>
//         </NavermapsProvider>
//     );
// }

// export default App;

'use client';

import { useState, useEffect, useRef } from 'react';
import useChatHistory from './hooks/useChatHistory';

export default function AcademyQA() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const { history, addToHistory, clearHistory } = useChatHistory('academy-qa'); // ✅ clearHistory 추가
    const endRef = useRef(null);

    const askLLM = async () => {
        if (!query.trim()) return;
        setLoading(true);

        try {
            const messages = [...history, { role: 'user', content: query }];
            const res = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: 'completion', data: messages })
            });

            const json = await res.json();
            addToHistory('user', query);
            addToHistory('assistant', json.text || '❌ 응답 없음');
            setQuery('');
        } catch (e) {
            addToHistory('user', query);
            addToHistory('assistant', '❌ 오류가 발생했습니다.');
            setQuery('');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [history]);

    return (
        <div className="flex flex-col h-[calc(100vh-56px-64px)] relative">
            {/* Q&A 영역 */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-36">
                {history.length === 0 ? (
                    <p className="text-gray-500">아직 질문이 없습니다.</p>
                ) : (
                    history.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`mb-3 p-3 rounded border bg-gray-50 whitespace-pre-wrap ${
                                msg.role === 'user' ? 'text-gray-700' : 'text-black'
                            }`}
                        >
                            <strong>{msg.role === 'user' ? 'Q:' : 'A:'}</strong> {msg.content}
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>

            {/* 입력창 (고정) */}
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t z-50">
                <div className="flex gap-2">
                    {/* 🔄 새 채팅 버튼 */}
                    <button
                        onClick={() => {
                            clearHistory(); // ✅ 대화 기록 초기화
                            setQuery(''); // ✅ 입력 필드 초기화
                        }}
                        className="material-symbols-outlined text-[#4B2EFF] text-2xl px-2"
                        title="새 채팅"
                    >
                        refresh
                    </button>

                    <input
                        type="text"
                        className="flex-1 p-2 border rounded"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && askLLM()}
                        placeholder="대치동 유치부 학원 추천해줘"
                    />

                    <button
                        onClick={askLLM}
                        disabled={loading}
                        className="bg-[#4B2EFF] text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? '생성중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
}
