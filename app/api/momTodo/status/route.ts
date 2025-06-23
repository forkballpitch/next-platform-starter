import clientPromise from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
    const { id, newStatus } = await req.json();

    const client = await clientPromise;
    const db = client.db('momnote');

    await db.collection('todos').updateOne({ _id: new ObjectId(id) }, { $set: { status: newStatus } });

    return NextResponse.json({ success: true });
}
