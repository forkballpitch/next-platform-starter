import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://admin:admin@cluster0.p3isnmw.mongodb.net'; //process.env.MONGODB_URI!;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI 환경 변수가 설정되어 있지 않습니다.');
}

if (process.env.NODE_ENV === 'development') {
    if (!(global as any)._mongoClientPromise) {
        client = new MongoClient(uri, options);
        (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
