'use client';
import { useEffect, useState } from 'react';

export default function MomSchedulePage() {
    const [tasks, setTasks] = useState([]);
    const [todoText, setTodoText] = useState('');

    const fetchTasks = async () => {
        const res = await fetch('/api/momTodo');
        const data = await res.json();
        setTasks(data);
    };

    const handleAdd = async () => {
        if (!todoText.trim()) return;
        const res = await fetch('/api/momTodo', {
            method: 'POST',
            body: JSON.stringify({ taskname: todoText }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            setTodoText('');
            fetchTasks();
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="p-4 max-w-xl mx-auto space-y-4">
            <h1 className="text-xl font-bold">📝 엄마 할 일</h1>
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border p-2 rounded"
                    placeholder="할 일을 입력하세요"
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
                    추가
                </button>
            </div>
            <ul>
                {tasks.map((task) => (
                    <li key={task._id} className="flex justify-between items-center border-b py-2">
                        <span>{task.taskname}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
