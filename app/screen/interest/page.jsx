'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function SalePage() {
    const [tasks, setTasks] = useState([]);
    const [todoText, setTodoText] = useState('');
    const [loading, setLoading] = useState(false);
    const [webKey, setWebKey] = useState(0);

    const fetchTasks = async () => {
        const q = query(collection(db, 'todo'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setTasks(list);
    };

    const handleAddTodo = async () => {
        if (!todoText.trim()) {
            alert('할 일을 입력해 주세요!');
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, 'todo'), {
                taskname: todoText,
                completed: false,
                createdAt: serverTimestamp()
            });
            setTodoText('');
            await fetchTasks();
        } catch (e) {
            console.error('등록 실패:', e);
            alert('등록 실패: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="p-4 space-y-6">
            {/* 할일 목록 */}
            <ul className="space-y-2">
                {tasks.map((task) => (
                    <li key={task.id} className="text-black border p-2 rounded">
                        {task.taskname}
                    </li>
                ))}
            </ul>

            {/* 입력 폼 */}
            <div className="pt-4">
                <input
                    type="text"
                    className="border border-gray-300 rounded px-4 py-2 w-full"
                    placeholder="할 일을 입력하세요"
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                />
                <button
                    onClick={handleAddTodo}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? '등록 중...' : '등록하기'}
                </button>
            </div>
        </div>
    );
}
