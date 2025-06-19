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
    const { history, addToHistory, clearHistory } = useChatHistory('academy-qa');
    const endRef = useRef(null);

    const askLLM = async () => {
        if (!query.trim()) return;

        const currentQuery = query.trim();
        setQuery(''); // 입력 필드 먼저 초기화

        // ✅ 질문을 먼저 화면에 표시
        addToHistory('user', currentQuery);
        setLoading(true);

        try {
            // ✅ API 호출용 메시지 배열 구성 (현재 history + 새 질문)
            const messagesForAPI = [...history, { role: 'user', content: currentQuery }];

            const res = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: 'completion', data: messagesForAPI })
            });

            const json = await res.json();
            addToHistory('assistant', json.text || '❌ 응답 없음');
        } catch (e) {
            addToHistory('assistant', '❌ 오류가 발생했습니다.');
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
                    <p className="text-gray-500">아까 질문이 없습니다.</p>
                ) : (
                    (() => {
                        const qaGroups = [];
                        for (let i = 0; i < history.length; i += 2) {
                            const question = history[i];
                            const answer = history[i + 1];
                            if (question && question.role === 'user') {
                                qaGroups.push({ question, answer, index: i });
                            }
                        }

                        return qaGroups.map(({ question, answer, index }) => (
                            <div key={index} className="mb-4 p-4 rounded border bg-gray-50">
                                {/* 질문 */}
                                <div className="mb-3">
                                    <span className="font-bold text-blue-600">Q:</span>
                                    <span className="ml-2 text-blue-600 whitespace-pre-wrap">{question.content}</span>
                                </div>

                                {/* 답변 */}
                                <div>
                                    <span className="font-bold text-black">A:</span>
                                    <span className="ml-2 text-black whitespace-pre-wrap">
                                        {answer
                                            ? answer.content
                                            : loading && index === history.length - 1
                                            ? '답변을 생성중입니다...'
                                            : '답변 없음'}
                                    </span>
                                </div>
                            </div>
                        ));
                    })()
                )}

                <div ref={endRef} />
            </div>

            {/* 입력창 (고정) */}
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t z-50">
                <div className="flex gap-2">
                    {/* 🔄 새 채팅 버튼 */}
                    <button
                        onClick={() => {
                            clearHistory();
                            setQuery('');
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
                        onKeyDown={(e) => e.key === 'Enter' && !loading && askLLM()}
                        placeholder="대치동 유치부 학원 추천해줘"
                        disabled={loading} // ✅ 로딩 중에는 입력 비활성화
                    />

                    <button
                        onClick={askLLM}
                        disabled={loading || !query.trim()}
                        className="bg-[#4B2EFF] text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                        {loading ? '생성중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
}
