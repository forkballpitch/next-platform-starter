// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyC-DQ3Onk9AhByIA1Wbbdgo6dt0_9Usw2w',
    authDomain: 'realestate-bc763.firebaseapp.com',
    databaseURL: 'https://realestate-bc763.firebaseio.com',
    projectId: 'realestate-bc763',
    storageBucket: 'realestate-bc763.firebasestorage.app',
    messagingSenderId: '773191908048',
    appId: '1:773191908048:web:ba65ba80558ee73ba33cd5',
    measurementId: 'G-J70VESFET2'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ 이거 추가!
export { db };
