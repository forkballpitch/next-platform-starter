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

//여기는 티스토리
// 'use client';

// import Link from 'next/link';
// import { useEffect, useState } from 'react';

// export default function RssList() {
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true); // 로딩 상태 추가

//     useEffect(() => {
//         const fetchRss = async () => {
//             try {
//                 const res = await fetch('/api/rss');
//                 const text = await res.text();
//                 const parser = new DOMParser();
//                 const xml = parser.parseFromString(text, 'application/xml');
//                 const parsedItems = Array.from(xml.querySelectorAll('item')).map((item) => ({
//                     title: item.querySelector('title')?.textContent ?? '',
//                     link: item.querySelector('link')?.textContent ?? '',
//                     slug: item.querySelector('link')?.textContent.split('/').pop() ?? '',
//                     pubDate: item.querySelector('pubDate')?.textContent ?? ''
//                 }));
//                 setItems(parsedItems);
//             } catch (err) {
//                 console.error('RSS fetch error:', err);
//             } finally {
//                 setLoading(false); // 완료 시 로딩 false
//             }
//         };

//         fetchRss();
//     }, []);

//     return (
//         <div style={{ padding: '1rem' }}>
//             <h2>📰 코딩학습(Backend)</h2>

//             {loading ? (
//                 <div style={{ textAlign: 'center', padding: '2rem' }}>
//                     <div className="spinner" />
//                     <p>로딩 중입니다...</p>
//                 </div>
//             ) : (
//                 <ul>
//                     {items.map((item) => (
//                         <li key={item.slug} style={{ margin: '1rem 0' }}>
//                             <Link href={`/screen/rss/${item.slug}`}>
//                                 <span style={{ cursor: 'pointer', fontSize: '1.1rem', color: 'blue' }}>
//                                     {item.title}
//                                 </span>
//                             </Link>
//                             <div style={{ fontSize: '0.8rem', color: '#888' }}>{item.pubDate}</div>
//                         </li>
//                     ))}
//                 </ul>
//             )}

//             {/* 간단한 CSS */}
//             <style jsx>{`
//                 .spinner {
//                     width: 40px;
//                     height: 40px;
//                     margin: 0 auto;
//                     border: 5px solid lightgray;
//                     border-top: 5px solid #3498db;
//                     border-radius: 50%;
//                     animation: spin 0.8s linear infinite;
//                 }

//                 @keyframes spin {
//                     0% {
//                         transform: rotate(0deg);
//                     }
//                     100% {
//                         transform: rotate(360deg);
//                     }
//                 }
//             `}</style>
//         </div>
//     );
// }

'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WordGuessPage() {
    const [showHint, setShowHint] = useState(false);

    // 사운드 준비
    const correctSound = useRef<HTMLAudioElement | null>(null);
    const wrongSound = useRef<HTMLAudioElement | null>(null);
    const fanfareSound = useRef<HTMLAudioElement | null>(null);
    const [completedWordCount, setCompletedWordCount] = useState(0);

    useEffect(() => {
        correctSound.current = new Audio('/sounds/correct.mp3');
        wrongSound.current = new Audio('/sounds/wrong.mp3');
        fanfareSound.current = new Audio('/sounds/fanfare.mp3');
    }, []);

    const julyBookUnitList = [
        {
            name: 'July Words',
            words: [
                { word: 'journey', meaning: 'a trip or travel' },
                { word: 'January', meaning: 'the first month of the year' },
                { word: 'snail', meaning: 'a small slow animal with a shell' },
                { word: 'trail', meaning: 'a path or track' },
                { word: 'teacher', meaning: 'a person who teaches' },
                { word: 'February', meaning: 'the second month of the year' },
                { word: 'wait', meaning: 'stay for a time' },
                { word: 'wall', meaning: 'a structure that divides space' },
                { word: 'empty', meaning: 'having nothing inside' },
                { word: 'March', meaning: 'the third month of the year' },
                { word: 'chair', meaning: 'something to sit on' },
                { word: 'see', meaning: 'to look with your eyes' },
                { word: 'complain', meaning: 'to express dissatisfaction' },
                { word: 'tidy', meaning: 'neat and clean' },
                { word: 'April', meaning: 'the fourth month of the year' },
                { word: 'leaf', meaning: 'part of a plant' },
                { word: 'May', meaning: 'the fifth month of the year' },
                { word: 'each', meaning: 'every one' },
                { word: 'meet', meaning: 'to see and talk with someone' },
                { word: 'peek', meaning: 'to look quickly' },
                { word: 'June', meaning: 'the sixth month of the year' },
                { word: 'thief', meaning: 'a person who steals' },
                { word: 'treat', meaning: 'to give care or reward' },
                { word: 'brief', meaning: 'short in time' },
                { word: 'July', meaning: 'the seventh month of the year' },
                { word: 'deep', meaning: 'far down' },
                { word: 'creek', meaning: 'small stream of water' },
                { word: 'team', meaning: 'group of people' },
                { word: 'August', meaning: 'the eighth month of the year' },
                { word: 'keep', meaning: 'to hold or save' },
                { word: 'toe', meaning: 'part of your foot' },
                { word: 'toasted', meaning: 'browned by heat' },
                { word: 'September', meaning: 'the ninth month of the year' },
                { word: 'window', meaning: 'glass opening in a wall' },
                { word: 'toad', meaning: 'an amphibian like a frog' },
                { word: 'snow', meaning: 'frozen water from the sky' },
                { word: 'October', meaning: 'the tenth month of the year' },
                { word: 'mad', meaning: 'angry' },
                { word: 'child', meaning: 'young person' },
                { word: 'dry', meaning: 'no water or moisture' },
                { word: 'November', meaning: 'the eleventh month of the year' },
                { word: 'untie', meaning: 'to loosen a knot' },
                { word: 'angry', meaning: 'very mad' },
                { word: 'kind', meaning: 'nice, friendly' },
                { word: 'December', meaning: 'the twelfth month of the year' },
                { word: 'furious', meaning: 'extremely angry' },
                { word: 'high', meaning: 'tall or elevated' },
                { word: 'sky', meaning: 'where the clouds are' },
                { word: 'lucky', meaning: 'having good luck' },
                { word: 'easy', meaning: 'not difficult' },
                { word: 'healthy', meaning: 'well, not sick' },
                { word: 'city', meaning: 'large town' },
                { word: 'valley', meaning: 'low land between hills' },
                { word: 'alley', meaning: 'narrow street' },
                { word: 'sunny', meaning: 'full of sunlight' },
                { word: 'buddy', meaning: 'friend' },
                { word: 'puppy', meaning: 'young dog' },
                { word: 'family', meaning: 'parents and children' },
                { word: 'carry', meaning: 'to hold and move' },
                { word: 'eight', meaning: 'number 8' },
                { word: 'brag', meaning: 'to boast' },
                { word: 'race', meaning: 'a competition to go fast' },
                { word: 'special', meaning: 'different and important' },
                { word: 'splendid', meaning: 'very good' },
                { word: 'sticky', meaning: 'gluey or tacky' },
                { word: 'danger', meaning: 'risk of harm' },
                { word: 'escape', meaning: 'to get away' },
                { word: 'fold', meaning: 'to bend something over' },
                { word: 'because', meaning: 'reason' },
                { word: 'cry', meaning: 'to shed tears' },
                { word: 'small', meaning: 'not big' },
                { word: 'alone', meaning: 'by oneself' },
                { word: 'bunch', meaning: 'group together' },
                { word: 'unsafe', meaning: 'dangerous' },
                { word: 'whimper', meaning: 'soft cry' },
                { word: 'busy', meaning: 'having a lot to do' },
                { word: 'brain', meaning: 'part of your head that thinks' },
                { word: 'bone', meaning: 'part of skeleton' },
                { word: 'skin', meaning: 'cover of your body' },
                { word: 'cut', meaning: 'to slice' },
                { word: 'heal', meaning: 'to get better' },
                { word: 'pajamas', meaning: 'sleep clothes' },
                { word: 'seaweed', meaning: 'ocean plant' },
                { word: 'ocean', meaning: 'big water area' },
                { word: 'float', meaning: 'stay on top of water' },
                { word: 'hold', meaning: 'grip something' },
                { word: 'relax', meaning: 'rest' },
                { word: 'nap', meaning: 'short sleep' },
                { word: 'tradition', meaning: 'custom or habit' },
                { word: 'temperature', meaning: 'measure of heat' },
                { word: 'break', meaning: 'to split or crack' },
                { word: 'understand', meaning: 'to know' },
                { word: 'luck', meaning: 'chance' },
                { word: 'die', meaning: 'stop living' },
                { word: 'donkey', meaning: 'animal like a small horse' },
                { word: 'spelling', meaning: 'how to write words' },
                { word: 'alike', meaning: 'similar' },
                { word: 'ladder', meaning: 'tool to climb up' },
                { word: 'hose', meaning: 'pipe for water' },
                { word: 'uniform', meaning: 'special clothes for work or school' },
                { word: 'protect', meaning: 'to keep safe' },
                { word: 'visit', meaning: 'to go see someone' },
                { word: 'wild', meaning: 'not tame' },
                { word: 'watch', meaning: 'to look at' },
                { word: 'drought', meaning: 'no rain for a long time' },
                { word: 'tusk', meaning: 'big tooth of an elephant' },
                { word: 'trunk', meaning: 'the nose of an elephant' },
                { word: 'scream', meaning: 'loud cry' },
                { word: 'apart', meaning: 'not together' },
                { word: 'invent', meaning: 'make something new' },
                { word: 'paddle', meaning: 'oar for a boat' },
                { word: 'railroad', meaning: 'train tracks' },
                { word: 'wheel', meaning: 'round turning part' },
                { word: 'harvest', meaning: 'gather crops' }
            ]
        }
    ];

    const redBookUnitList = [
        {
            name: 'Unit 1',
            words: [
                { word: 'bold', meaning: 'not afraid; showing courage' },
                { word: 'coward', meaning: 'a person who is easily scared and avoids danger' },
                { word: 'empty', meaning: 'with nothing inside' },
                { word: 'flee', meaning: 'to run away from danger' },
                { word: 'fortune', meaning: 'luck or something valuable' },
                { word: 'gasp', meaning: 'to breathe in quickly from fear or surprise' },
                { word: 'grin', meaning: 'a big smile' },
                { word: 'sharp', meaning: 'having an edge or point that can cut' },
                { word: 'sneaky', meaning: 'acting in a secret and tricky way' },
                { word: 'stare', meaning: 'to look at something for a long time' }
            ]
        },
        {
            name: 'Unit 2',
            words: [
                { word: 'dart', meaning: 'to move quickly' },
                { word: 'fog', meaning: 'thick mist' },
                { word: 'gulp', meaning: 'to swallow quickly' },
                { word: 'host', meaning: 'a person who receives guests' },
                { word: 'rude', meaning: 'not polite' },
                { word: 'scold', meaning: 'to speak angrily' },
                { word: 'serious', meaning: 'not joking' },
                { word: 'sly', meaning: 'clever and sneaky' },
                { word: 'upset', meaning: 'angry or worried' },
                { word: 'weary', meaning: 'tired' }
            ]
        },
        {
            name: 'Unit 3',
            words: [
                { word: 'area', meaning: 'a space or region' },
                { word: 'complain', meaning: 'to say you are unhappy about something' },
                { word: 'gather', meaning: 'to collect or bring together' },
                { word: 'market', meaning: 'a place where people buy and sell things' },
                { word: 'price', meaning: 'the amount of money something costs' },
                { word: 'rapid', meaning: 'fast or quick' },
                { word: 'ripe', meaning: 'ready to eat' },
                { word: 'seller', meaning: 'a person who sells something' },
                { word: 'surround', meaning: 'to be all around something' },
                { word: 'yank', meaning: 'to pull quickly and strongly' }
            ]
        },
        {
            name: 'Unit 4',
            words: [
                { word: 'cozy', meaning: 'warm and comfortable' },
                { word: 'fierce', meaning: 'strong and aggressive' },
                { word: 'freezing', meaning: 'very cold' },
                { word: 'hatch', meaning: 'to come out of an egg' },
                { word: 'howl', meaning: 'a long, loud cry' },
                { word: 'huddle', meaning: 'to crowd together' },
                { word: 'hunt', meaning: 'to chase and kill animals for food' },
                { word: 'protect', meaning: 'to keep safe' },
                { word: 'slide', meaning: 'to move smoothly over a surface' },
                { word: 'temperature', meaning: 'how hot or cold something is' }
            ]
        },
        {
            name: 'Unit 5',
            words: [
                { word: 'blush', meaning: 'to become red in the face from embarrassment' },
                { word: 'chatter', meaning: 'to talk quickly or repeatedly' },
                { word: 'doze', meaning: 'to sleep lightly' },
                { word: 'drench', meaning: 'to make completely wet' },
                { word: 'dusk', meaning: 'the time when the sun goes down' },
                { word: 'peer', meaning: 'to look carefully' },
                { word: 'slippery', meaning: 'hard to hold or stand on because it is wet or smooth' },
                { word: 'startle', meaning: 'to surprise suddenly' },
                { word: 'stumble', meaning: 'to trip or lose balance' },
                { word: 'swift', meaning: 'moving very fast' }
            ]
        },
        {
            name: 'Unit 6',
            words: [
                { word: 'burst', meaning: 'to break open suddenly' },
                { word: 'examine', meaning: 'to look at closely' },
                { word: 'fasten', meaning: 'to close or attach something' },
                { word: 'frantic', meaning: 'very worried or excited' },
                { word: 'judge', meaning: 'to form an opinion' },
                { word: 'shock', meaning: 'a sudden surprise' },
                { word: 'space', meaning: 'an empty area' },
                { word: 'spread', meaning: 'to open out or expand' },
                { word: 'squirm', meaning: 'to twist and turn' },
                { word: 'tangle', meaning: 'a twisted mess' }
            ]
        },
        {
            name: 'Unit 7',
            words: [
                { word: 'applause', meaning: 'the clapping of hands to show approval' },
                { word: 'instrument', meaning: 'a tool or device for making music' },
                { word: 'lively', meaning: 'full of energy' },
                { word: 'nervous', meaning: 'worried or afraid' },
                { word: 'perform', meaning: 'to act or do something in front of people' },
                { word: 'role', meaning: 'the part an actor plays' },
                { word: 'shriek', meaning: 'a loud, high cry' },
                { word: 'sway', meaning: 'to move back and forth' },
                { word: 'timid', meaning: 'shy or lacking courage' },
                { word: 'whirl', meaning: 'to spin around' }
            ]
        },
        {
            name: 'Unit 8',
            words: [
                { word: 'delighted', meaning: 'very happy' },
                { word: 'grateful', meaning: 'thankful' },
                { word: 'groan', meaning: 'a low sound made from pain or sadness' },
                { word: 'mischief', meaning: 'playful or naughty behavior' },
                { word: 'romp', meaning: 'to play roughly and happily' },
                { word: 'selfish', meaning: 'caring only about yourself' },
                { word: 'splendid', meaning: 'very good or beautiful' },
                { word: 'sprinkle', meaning: 'to scatter in drops or small pieces' },
                { word: 'stormy', meaning: 'with strong winds and rain' },
                { word: 'stun', meaning: 'to shock or surprise greatly' }
            ]
        },
        {
            name: 'Unit 9',
            words: [
                { word: 'attach', meaning: 'to join or connect' },
                { word: 'complete', meaning: 'to finish' },
                { word: 'create', meaning: 'to make something new' },
                { word: 'dainty', meaning: 'small and pretty' },
                { word: 'damage', meaning: 'harm or injury' },
                { word: 'edge', meaning: 'the border or side of something' },
                { word: 'jealous', meaning: "feeling upset about someone else's success" },
                { word: 'misty', meaning: 'full of mist or fog' },
                { word: 'roam', meaning: 'to travel without a fixed plan' },
                { word: 'silent', meaning: 'without sound' }
            ]
        },
        {
            name: 'Unit 10',
            words: [
                { word: 'anxious', meaning: 'worried or nervous' },
                { word: 'creak', meaning: 'a long squeaking sound' },
                { word: 'drowsy', meaning: 'sleepy' },
                { word: 'exchange', meaning: 'to trade one thing for another' },
                { word: 'footprint', meaning: 'a mark left by a foot' },
                { word: 'limp', meaning: 'to walk with difficulty' },
                { word: 'plead', meaning: 'to beg' },
                { word: 'polite', meaning: 'kind and respectful' },
                { word: 'trust', meaning: 'to believe someone is honest' },
                { word: 'whimper', meaning: 'to cry with soft sounds' }
            ]
        },
        {
            name: 'Unit 11',
            words: [
                { word: 'celebrate', meaning: 'to have a party for something special' },
                { word: 'comfort', meaning: 'to make someone feel better' },
                { word: 'destroy', meaning: 'to ruin completely' },
                { word: 'injury', meaning: 'harm done to the body' },
                { word: 'monument', meaning: 'a building to honor a person or event' },
                { word: 'polish', meaning: 'to make shiny by rubbing' },
                { word: 'rescue', meaning: 'to save from danger' },
                { word: 'seek', meaning: 'to look for' },
                { word: 'symbol', meaning: 'a picture or sign that means something' },
                { word: 'tidy', meaning: 'neat and clean' }
            ]
        },
        {
            name: 'Unit 12',
            words: [
                { word: 'argue', meaning: 'to speak in disagreement' },
                { word: 'clutch', meaning: 'to hold tightly' },
                { word: 'exhausted', meaning: 'very tired' },
                { word: 'furious', meaning: 'very angry' },
                { word: 'gently', meaning: 'softly or kindly' },
                { word: 'journey', meaning: 'a long trip' },
                { word: 'loosen', meaning: 'to make less tight' },
                { word: 'remove', meaning: 'to take away' },
                { word: 'traveler', meaning: 'someone who goes on trips' },
                { word: 'wrap', meaning: 'to cover with paper or cloth' }
            ]
        }

        // ...Unit 3~12도 같은 형식으로 채우면 됩니다.
    ];

    const purpleBookUnitList = [
        {
            name: 'Unit 1',
            words: [
                { word: 'test', meaning: 'not afraid; showing courage' },
                { word: 'coward', meaning: 'a person who is easily scared and avoids danger' },
                { word: 'empty', meaning: 'with nothing inside' },
                { word: 'flee', meaning: 'to run away from danger' },
                { word: 'fortune', meaning: 'luck or something valuable' },
                { word: 'gasp', meaning: 'to breathe in quickly from fear or surprise' },
                { word: 'grin', meaning: 'a big smile' },
                { word: 'sharp', meaning: 'having an edge or point that can cut' },
                { word: 'sneaky', meaning: 'acting in a secret and tricky way' },
                { word: 'stare', meaning: 'to look at something for a long time' }
            ]
        }

        // ...Unit 3~12도 같은 형식으로 채우면 됩니다.
    ];
    type BookType = 'red' | 'purple' | 'july';
    const [selectedBook, setSelectedBook] = useState<BookType>('red');
    const unitList =
        selectedBook === 'red' ? redBookUnitList : selectedBook === 'purple' ? purpleBookUnitList : julyBookUnitList;

    const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentGuess, setCurrentGuess] = useState<string[]>([]);
    const [completed, setCompleted] = useState(false);
    const [shakeIndex, setShakeIndex] = useState<number | null>(null);
    const [showYoshi, setShowYoshi] = useState(false);
    const [showKoopa, setShowKoopa] = useState(false);
    const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
    const currentUnit = unitList[selectedUnitIndex] ?? null;
    const currentWordObject = currentUnit?.words?.[currentWordIndex] ?? null;
    const [solvedCount, setSolvedCount] = useState(0);
    useEffect(() => {
        setClickedLetters([]);
    }, [currentWordIndex, selectedUnitIndex, selectedBook]);

    useEffect(() => {
        setShuffledLetters(shuffleArray(answerArray));
        handleReset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWordIndex, selectedUnitIndex]);

    useEffect(() => {
        setSelectedUnitIndex(0);
        setCurrentWordIndex(0);
        setCurrentGuess([]);
        setClickedLetters([]);
        setCompleted(false);
        setSolvedCount(0); // 유닛 바뀔 때 리셋
        // 새로 바뀐 책의 첫 단어를 기준으로 알파벳 다시 셔플
        const firstWord = unitList[0].words[0].word;
        setShuffledLetters(shuffleArray(firstWord.split('')));
    }, [selectedBook]);

    // if (!currentUnit || !currentWordObject) {
    //     return <div>Loading...</div>;
    // }

    const currentWord = currentWordObject.word;
    const answerArray = currentWord.split('');

    const shuffleArray = (array: string[]) => {
        return [...array].sort(() => Math.random() - 0.5);
    };

    const handleLetterClick = (letter: string, idx: number) => {
        if (completed) return;

        const nextIndex = currentGuess.length;

        if (answerArray[nextIndex] === letter) {
            correctSound.current?.play();
            const updated = [...currentGuess, letter];
            setCurrentGuess(updated);
            setClickedLetters((prev) => [...prev, { letter, idx }]);
            setShowYoshi(true);
            setTimeout(() => setShowYoshi(false), 1000);

            if (updated.length === answerArray.length) {
                //  if (updated.length === answerArray.length) {
                setCompleted(true);
                setSolvedCount((prev) => prev + 1); // 맞출 때마다 +1
                fanfareSound.current?.play();
                setCompletedWordCount((prev) => prev + 1); // 맞춘 단어 카운트 증가
                //
            }
        } else {
            wrongSound.current?.play();
            setWrongLetter(letter);
            setShakeIndex(idx);
            setShowKoopa(true);
            // setClickedLetters((prev) => [...prev, { letter, idx }]); // 틀린 것도 추가

            setTimeout(() => setShowKoopa(false), 1000);
            setTimeout(() => setShakeIndex(null), 300);
            setTimeout(() => setWrongLetter(null), 500);
        }
    };

    const handleReset = () => {
        setCurrentGuess([]);
        setCompleted(false);
        setShakeIndex(null);
        setShowYoshi(false);
        setShowKoopa(false);
        setClickedLetters([]); // ← 이 줄을 반드시 추가
    };

    const handleNextWord = () => {
        const next = (currentWordIndex + 1) % currentUnit.words.length;
        setCurrentWordIndex(next);
    };

    const handlePrevWord = () => {
        const prev = (currentWordIndex - 1 + currentUnit.words.length) % currentUnit.words.length;
        setCurrentWordIndex(prev);
    };

    const handleSelectWord = (index: number) => {
        setCurrentWordIndex(index);
        setCompletedWordCount(0);
    };

    const handleSelectUnit = (index: number) => {
        setSelectedUnitIndex(index);
        setCurrentWordIndex(0);
        setCompletedWordCount(0);
    };

    const imageNumber = selectedUnitIndex * 10 + completedWordCount + 1; // 1부터 시작

    const [clickedLetters, setClickedLetters] = useState<{ letter: string; idx: number }[]>([]);

    const [wrongLetter, setWrongLetter] = useState<string | null>(null);
    const router = useRouter();
    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded shadow space-y-4 text-center relative overflow-hidden">
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => router.back()}
                className="absolute top-4 left-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                ← 뒤로가기
            </button>

            <h1 className="text-xl font-bold text-gray-800">📝 Word Guess Game</h1>
            {!currentUnit || !currentWordObject ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* 원래의 JSX 구조 */}

                    {/* etc... */}
                </>
            )}
            {/* 책 선택 버튼 */}
            <div className="flex justify-center gap-2 mb-2">
                <button
                    onClick={() => setSelectedBook('red')}
                    className={`px-4 py-2 rounded text-xs ${
                        selectedBook === 'red' ? 'bg-red-600 text-white' : 'bg-gray-200'
                    }`}
                >
                    Red Book
                </button>
                <button
                    onClick={() => setSelectedBook('purple')}
                    className={`px-4 py-2 rounded text-xs ${
                        selectedBook === 'purple' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                    }`}
                >
                    Purple Book
                </button>

                <button
                    onClick={() => setSelectedBook('july')}
                    className={`px-4 py-2 rounded text-xs ${
                        selectedBook === 'july' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                    }`}
                >
                    July Book
                </button>
            </div>
            {/* 유닛 선택 버튼 */}
            {/* 유닛 선택 버튼 (가로 스크롤) */}
            <div
                className="flex overflow-x-scroll whitespace-nowrap gap-2 mb-2 px-2 scroll-smooth"
                style={{
                    scrollbarWidth: 'auto', // Firefox
                    msOverflowStyle: 'auto' // IE/Edge
                }}
            >
                {unitList.map((unit, index) => (
                    <button
                        key={unit.name}
                        onClick={() => handleSelectUnit(index)}
                        className={`inline-block w-24 h-10 rounded border text-sm font-semibold shrink-0
        ${index === selectedUnitIndex ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-800'}
      `}
                    >
                        {unit.name}
                    </button>
                ))}
            </div>

            <hr className="border-t border-gray-300 mb-2" />
            <div className="text-xs text-gray-500 mb-2">{currentUnit.words.length} words</div>
            {/* 단어 index 선택 */}
            <div
                className="flex overflow-x-auto whitespace-nowrap gap-1 mb-1 px-2 scroll-smooth"
                style={{
                    scrollbarWidth: 'thin', // 파이어폭스
                    msOverflowStyle: 'auto' // IE/Edge
                }}
            >
                {currentUnit.words.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelectWord(idx)}
                        className={`w-8 h-8 rounded-full border text-sm shrink-0
                        ${currentWordIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}
                    `}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>
            {/* 단어 개수와 구분선 */}

            <hr className="border-t border-gray-300 mb-2" />
            <div className="text-xs text-gray-500 mb-2"> Meaning</div>
            {/* 단어 뜻 */}
            <p className="text-gray-600 italic mt-2">{currentWordObject.meaning || '(No meaning yet)'}</p>

            {/* 화살표 */}
            <div className="flex justify-between mt-4">
                <button onClick={handlePrevWord} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                    ←
                </button>
                {/* 정답 칸 */}
                <div className="flex justify-center space-x-1 mt-2">
                    {answerArray.map((letter, index) => (
                        <span key={index} className="w-6 h-8 border-b-2 border-gray-400 text-center text-lg">
                            {showHint ? letter : currentGuess[index] || ''}
                        </span>
                    ))}
                </div>
                <button onClick={handleNextWord} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                    →
                </button>
            </div>
            {/* 알파벳 버튼 */}
            <div className="flex justify-center flex-wrap gap-2 mt-4">
                {shuffledLetters.map((letter, idx) => (
                    <button
                        key={`${letter}-${idx}`}
                        onClick={() => handleLetterClick(letter, idx)}
                        disabled={clickedLetters.some((c) => c.letter === letter && c.idx === idx) || completed}
                        className={`
                            relative rounded-full w-12 h-12 text-lg transition
                            ${
                                clickedLetters.some((c) => c.letter === letter && c.idx === idx)
                                    ? 'bg-gray-400 cursor-not-allowed btn-x'
                                    : wrongLetter === letter
                                    ? 'bg-red-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                            ${shakeIndex === idx ? 'animate-shake-fast' : ''}
                            ${
                                clickedLetters.some((c) => c.letter === letter && c.idx === idx) && !completed
                                    ? 'animate-bling'
                                    : ''
                            }
                            `}
                    >
                        {letter}
                    </button>
                ))}
            </div>

            {completed && (
                <div className="flex flex-col items-center justify-center mt-2 space-y-2">
                    <div className="text-green-600 font-bold animate-bounce">YOU GOT IT! 🎉</div>
                    {/* <img src="/images/mario.png" alt="mario thumbs up" className="w-20 animate-bounce" /> */}
                </div>
            )}

            {/* 피카츄 진행 표시 */}
            <div className="flex justify-center flex-wrap gap-1 mt-4">
                {Array.from({ length: solvedCount }).map((_, idx) => {
                    const baseImageNumber = selectedUnitIndex * 10; // 유닛별 시작 번호
                    const imageNumber = baseImageNumber + idx + 1; // 1부터 시작
                    return (
                        <img
                            key={idx}
                            src={`/images/pocketmon/${imageNumber}.png`}
                            alt={`pikachu ${imageNumber}`}
                            className="w-12 h-12"
                        />
                    );
                })}
            </div>

            {/* 요시 Good Job */}
            {showYoshi && (
                <div className="absolute top-10 right-10 animate-pop">
                    <span className="bg-yellow-300 px-2 py-1 rounded text-xs font-bold shadow">Good Job!</span>
                    <img src="/images/yoshi.png" alt="yoshi" className="w-16" />
                </div>
            )}

            {/* 쿠파 Wrong */}
            {showKoopa && (
                <div className="absolute top-10 left-10 animate-pop">
                    <span className="bg-red-600 px-2 py-1 rounded text-xs font-bold text-white shadow">Wrong!</span>
                    <img src="/images/koopa.png" alt="koopa" className="w-16" />
                </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
                <button onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Again
                </button>
                <button
                    onClick={() => {
                        setShowHint(true);
                        setTimeout(() => setShowHint(false), 2000);
                    }}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
                >
                    Hint
                </button>
            </div>
            {/* CSS */}
            <style jsx>{`
                .animate-shake-fast {
                    animation: shake-fast 0.3s;
                }
                @keyframes shake-fast {
                    0% {
                        transform: translateX(0);
                    }
                    20% {
                        transform: translateX(-5px);
                    }
                    40% {
                        transform: translateX(5px);
                    }
                    60% {
                        transform: translateX(-5px);
                    }
                    80% {
                        transform: translateX(5px);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }
                .animate-pop {
                    animation: pop 1s ease-in-out forwards;
                }
                @keyframes bling {
                    0% {
                        background-color: yellow;
                    }
                    50% {
                        background-color: white;
                    }
                    100% {
                        background-color: yellow;
                    }
                }
                .animate-bling {
                    animation: bling 0.5s ease;
                }
                .btn-strike::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    height: 2px;
                    width: 100%;
                    background-color: black;
                    transform: translateY(-50%);
                }

                .btn-x::after {
                    content: '✕';
                    position: absolute;
                    color: black;
                    font-size: 1.2rem;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                @keyframes pop {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                    50% {
                        transform: scale(1);
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                }
            `}</style>
        </div>
    );
}
