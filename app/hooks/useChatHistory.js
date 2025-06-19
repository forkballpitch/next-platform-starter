// app/hooks/useChatHistory.js
'use client';
import { useState, useEffect } from 'react';

export default function useChatHistory(sessionId = 'default') {
    const key = `chat_history_${sessionId}`;
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const saved = sessionStorage.getItem(key);
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, [key]);

    const addToHistory = (role, content) => {
        setHistory((prevHistory) => {
            const updated = [...prevHistory, { role, content }];
            sessionStorage.setItem(key, JSON.stringify(updated));
            return updated;
        });
    };

    // ✅ 대화 내역 초기화 함수 수정 (sessionStorage도 함께 초기화)
    const clearHistory = () => {
        setHistory([]);
        sessionStorage.removeItem(key);
    };

    return { history, addToHistory, clearHistory };
}
