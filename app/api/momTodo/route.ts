import clientPromise from '@/app/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    const client = await clientPromise;
    const db = client.db('momnote');
    const tasks = await db.collection('todos').find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(tasks);
}

export async function POST(req: Request) {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('momnote');
    const newTask = {
        taskname: body.taskname,
        completed: false,
        createdAt: new Date()
    };
    const result = await db.collection('todos').insertOne(newTask);
    return NextResponse.json({ ...newTask, _id: result.insertedId });
}
