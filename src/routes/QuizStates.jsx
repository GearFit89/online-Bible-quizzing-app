import React, { useState, useEffect, useContext, createContext, useRef, useCallback, useMemo, isValidElement } from 'react';
import { DragDropArea } from './dragDrop.jsx';
import '../style.css'
import { X, Trophy, RotateCcw, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useConnection, USER_STATES,   wsClient } from '../connection.jsx';
import { StreamProvider, useStream } from '../hooks/Status.jsx';
///import { userInfo } from 'node:os';
const USERNAME = localStorage.getItem('username') || 'Guest';
// --- 1. Global Context & State ---
const ModeContext = createContext();
const QuizContext = createContext();
function useFeedback() {
    const startBack = {
        correct: false,
        incorrect: false,
        please_correct: false,
        plural: false,
        more: false,
        none: true
    }

    const [feedback, setFeedback] = useState(startBack);
    function change(state) {
        setFeedback({ ...startBack, [state]: true });
    }
    function reset() {
        setFeedback(startBack)
    }



    return [feedback, change, reset];
}
 function useStatus(){
    
    const [userQuizData, setuqd] = useState([])
    const {quizData} = useConnection()
    const [curStatus, setCurStatus] = useState('')
     const {  status:newStatus, oldStatus, target, } = quizData?.status ?? {status:'', oldStatus:'', target:null, userConfig:null};
    const [statu, setStatus] = useState({});
    const { userConfig } = quizData || {};
     const { status, teamName, seatNum, username } = userConfig || {};
    useEffect(()=>{
        if(!quizData?.status) return;
       if(target){
       setStatus(prev=>({...prev, [target]:newStatus}));

       if(target === USERNAME){
        setCurStatus(quizData.status)
       }
    }else {
        console.warn(quizData?.status, 'first')
           if (oldStatus === undefined || newStatus === undefined) { console.error('help?'); return; } 
        setStatus(prev=>{
           const newStatui = Object.entries(prev ?? {}).reduce((acc, [user, userstatus])=>{
            return userstatus === oldStatus || oldStatus ==='*' ? acc[user] = newStatus:acc[user] = oldStatus
           }, {});
            console.warn(quizData?.status, 'second')
           return newStatui;
        })

    }
    }, [quizData.status, quizData.target])
    useEffect(()=>{
     
      setStatus(prev=>({...prev, [username]:status}));
      setuqd(prev=> [...prev, {teamName, seatNum, username, status}]);



    }, [quizData.userConfig])
return [statu, curStatus, userQuizData]
  }
  export const QUESTION_STATUS = {
    correct: 'Correct Answer', // Maps the 'correct' state to a display string
    incorrect: 'Wrong Answer', // Maps the 'incorrect' state to a display string
    please_correct: 'Needs Correction', // Maps the 'please_correct' state to a display string
    more: 'More' ,
    none:'none'// Maps the 'more' state to a display string
  }; // The 'Record' type ensures all keys from QuestionStates are present
  
export const QuizProvider = ({ children }) => {
    // Global Settings State
    const [settings, setSettings] = useState({
        // Default number of questions per session
        numQuestions: 20,
        // Default time limit for each question
        timerLength: 30,
       
        // Default text display speed in milliseconds
        textSpeed: 1000,
        // Default method for choosing verses
        verseSelection: 'random',
        // Configuration for which question types are active
        questionType: { quote: true, ftv: true, questions: true },
        // Toggle for using the drag and drop interface
        dragEnabled: false, 
        // Mode for handling trigger words (highlight, ignore, or stop)
        triggerMode: 'highlight'
    });

    // Define the current state of the active game session
    const [gameState, setGameState] = useState({
        // Boolean to track if a game is currently active
        isPlaying: false,
        usersScore: {},
        usersMetatData: {},
        isTimerRuning: false,
        timeLen:30,
        // Boolean to track if the game is temporarily paused
        isPaused: false,
        currentQuestState:'',
        // The index of the question the user is currently answering
        currentQuestionIndex: 0,
        // The total number of questions for this specific session
        totalQuestions: 20,
        // The user's current cumulative score
        score: 0,
        // Array to store the history of answers for review
        answers: [], 
        // Array to store system logs for the DebugLogger component
        debugLogs: []
    });
    
    const [userJumped, setUserJumped] = useState(false)
    const [canJump, setCanJump] = useState(false);
    const [userInput, setUserInput] = useState('')
    const [isWaiting, setIsWaiting] = useState(true);
    // Current Question State
    const [currentQuestion, setCurrentQuestion] = useState({
        id: 1,
        text: "In the beginning...",
        answer: "In the beginning God created...",
        type: "ftv" // or 'quote', etc.
    });

    // Connectivity State
    //const [connectedToServer, setConnectedToServ er] = useState(true);
    const [displayUser, setDisplayUser] = useState({});
    const [displayTeam, setDisplayTeam] = useState({});
    const [ feedback, changeFeedback, resetFeedback] = useFeedback()
    return (
        <QuizContext.Provider value={{
            settings, setSettings,
            gameState, setGameState,
            currentQuestion, setCurrentQuestion, feedback, changeFeedback, resetFeedback, isWaiting, setIsWaiting,
            displayUser, canJump, setCanJump, userJumped, setUserJumped,setDisplayUser, displayTeam, setDisplayTeam, userInput, setUserInput
            //connectedToServer, setConnectedToServer
        }}>
            {children}
        </QuizContext.Provider>
    );
};
// components/SettingsForm.js


const quizMonthsData = [
    ['october', ['1', '2', '3', '4', '5'], 'Matthew'], 
    ['november', ['6', '7', '8', '9'], 'Matthew'], 
    ['december', ['10', '11', '12'], 'Matthew'], 
    ['january', ['13', '14'], 'Matthew'], 
    ['february', ['15', '16'], 'Matthew'], 
    ['march', ['Jonah'], 'Jonah']
];

const SettingsForm = () => {
    const { settings, setSettings } = useContext(QuizContext);
    const [viewMode, setViewMode] = useState('months'); // 'months' or 'chapters'
    
    // Helper to extract all chapters based on selected months (if you want auto-select logic)
    // Placeholder: implementation of this.quizMonths.forEach logic
    
    return (
        <div className="overflow-set">
            {/* --- Speed Settings --- */}
            <div className="option-section">
                <h3 className="section-title">Speed of Text (In Milliseconds)</h3>
                <div className="range-display-container">
                    <input 
                        type="range" 
                        name="speed" 
                        min="0" max="4000" 
                        value={settings.textSpeed || 0}
                        onChange={(e) => setSettings({...settings, textSpeed: Number(e.target.value)})}
                    />
                    <span id="speedValue">{settings.textSpeed || 0}</span>
                </div>
            </div>

{            /* --- Selection Logic (Months vs Chapters) --- */}
                        <div className="option-section" id="monthDiv">
                            <div style={{ marginBottom: '10px' }}>
                                <label className="radio-label">
                                    <input type="radio" name="viewMode" value="months" checked={viewMode === 'months'} onChange={(e) => setViewMode(e.target.value)} />
                                    <span className="radio-custom"></span>
                                    Select Months
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="viewMode" value="chapters" checked={viewMode === 'chapters'} onChange={(e) => setViewMode(e.target.value)} />
                                    <span className="radio-custom"></span>
                                    Select Chapters
                                </label>
                            </div>

                            {viewMode === 'months' ? (
                                <>
                                    <h3 className="section-title">Select Months</h3>
                                    <div className="checkbox-container">
                                        {quizMonthsData.map(([month, chapters, book]) => (
                                            <label key={month} className="radio-label">
                                                <input type="radio" name="month" value={month} onChange={(e) => {}} />
                                                <span className="radio-custom"></span>
                                                {month.charAt(0).toUpperCase() + month.slice(1)}
                                            </label>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="section-title">Select Chapters</h3>
                                    <div className="checkbox-container">
                                        {/* Flattening the array to show all chapters */}
                            {quizMonthsData.flatMap(([_, chapters]) => chapters).map((chp, idx) => (
                                <label key={`${chp}-${idx}`} className="toggle-label">
                                    <input type="checkbox" name="chp" value={chp} /> 
                                    {chp}
                                </label>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* --- Trigger Words --- */}
            <div className="option-section">
                <h3 className="section-title">Trigger Words</h3>
                <div className="radio-group">
                    {['highlight', 'ignore', 'stop'].map(opt => (
                        <label key={opt} className="radio-label">
                            <input 
                                type="radio" 
                                name="verseSelectionH" 
                                value={opt} 
                                checked={settings.triggerMode === opt}
                                onChange={() => setSettings({...settings, triggerMode: opt})}
                            />
                            <span className="radio-custom"></span>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};


const QuizTimer = () => {
    const { settings, gameState, setGameState, setCanJump } = useContext(QuizContext);
    const [timeLeft, setTimeLeft] = useState(gameState.timeLen || 5);

    useEffect(() => {
        if (!gameState.isTimerRuning) {
            setTimeLeft(0); // Force reset
            return;
        }

        // 1. Set the "Deadline" (Current Time + Timer Length)
        const endTime = Date.now() + (gameState.timeLen * 1000);

        const interval = setInterval(() => {
            const now = Date.now();
            const remaining = Math.ceil((endTime - now) / 1000);

            if (remaining <= 0) {
                clearInterval(interval);
                setTimeLeft(0);
                //setCanJump(false); // Stop jumping
                setGameState(prev => ({ ...prev, isTimerRuning: false })); // Stop game
            } else {
                setTimeLeft(remaining);
            }
        }, 100); // Check frequently (every 100ms) for smoothness

        return () => clearInterval(interval);
    }, [gameState.isTimerRuning, gameState.timeLen]);

    // Calculate progress for CSS
    const progress = timeLeft / settings.timerLength;
    
    return !gameState.isTimerRuning || settings.timerLength === 0 ?null: (
        <div className="quiz-header-area">
            <div 
                id="quizTimer" 
                className="timer-circle" 
                style={{ '--progress': progress }}
            >
                <span className={`timer-number ${timeLeft < 5 ? 'warning' : ''}`}>
                    {timeLeft}
                </span>
            </div>
            {/* Fallback message container from original HTML */}
            <div className="fallback-message" id="quizHeader"></div>
        </div>
    );
};






// hooks/useVoiceRecognition.js


export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Browser not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.interimResults = false;
        recognition.continuous = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
        };

        recognition.onerror = (event) => {
            console.error("Speech Error:", event.error);
            setError(event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    }, []);

    return { isListening, transcript, error, startListening };
};



// composalModal.js

////import React, { useState, useMemo, useEffect } from 'react';

// Component to visualize dynamic quiz data objects


// Main component that reacts to every change in quizData.X
const QuizDataTabs = ({ dataUpdate }) => {
    // Stores the accumulated state because dataUpdate is volatile
    const [persistentData, setPersistentData] = useState({}); // Stores the "latest" value for every key seen
    const [activeTab, setActiveTab] = useState(''); // Tracks which tab the user is viewing
    const [tabList, setTabList] = useState([]); // List of unique categories derived from keys

    // EFFECT: Process every update when the data object changes
    useEffect(() => {
        if (!dataUpdate || typeof dataUpdate !== 'object') return; // Exit if data is null

        setPersistentData(prev => {
            const nextData = { ...prev }; // Start with existing known data
            const newKeys = Object.keys(dataUpdate); // Get keys from the current update

            newKeys.forEach(key => {
                nextData[key] = dataUpdate[key]; // Update/Add the value for this specific key
            });

            // Update Tab List: Extract simple categories (first word before any space or underscore)
            const categories = Object.keys(nextData).map(k => k.split('_')[0].split(' ')[0].toLowerCase());
            const uniqueCategories = [...new Set(categories)]; // Remove duplicates

            setTabList(uniqueCategories); // Update the UI tabs

            // Set default tab if none selected
            if (!activeTab && uniqueCategories.length > 0) {
                setActiveTab(uniqueCategories[0]);
            }

            return nextData; // Save the updated persistent state
        });
    }, [dataUpdate]); // Fires every time the object reference changes

    return (
        <div className="tab-wrapper" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%' }}>
            {/* --- TAB NAVIGATION --- */}
            <div className="tab-nav" style={{
                display: 'flex',
                overflow: 'auto',
                overflowX: 'auto',
                borderBottom: '0.125rem solid #ccc',
                marginBottom: '1rem'
            }}>
                {tabList.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            overflow:'auto',
                            padding: '0.75rem 1.5rem',
                            cursor: 'pointer',
                            backgroundColor: activeTab === tab ? '#e0e0e0' : 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab ? '0.25rem solid #007bff' : '0.25rem solid transparent',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            flexGrow: 1, // Ensures tabs fill the whole screen width
                            transition: 'all 0.2s ease',
                            fontSize: '1rem' // rem for accessibility
                        }}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="tab-content" style={{ flexGrow: 1, minHeight: '12.5rem' }}>
                {Object.entries(persistentData)
                    .filter(([key]) => key.toLowerCase().startsWith(activeTab)) // Show keys belonging to active tab
                    .map(([key, value]) => (
                        <div
                            key={key}
                            className="data-entry"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                borderBottom: '1px solid #eee'
                            }}
                        >
                            <span style={{ fontWeight: 600 }}>{key}</span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

//export default QuizDataTabs;

// export default DataTabVisualizer;

export const UniversalModal = ({ isOpen, onClose, title, children }) => {
    // Return null if not open to prevent rendering
    if (!isOpen) return null;

    return (
        <div className="modal-overlay"> {/* Dark background layer */}
            <dialog className="modal-container" open>
                {/* Close button positioned absolutely to the container */}
                <button
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={24} /> {/* Increased size for better UX touch targets */}
                </button>

                <div className="modal-content">
                    {title && <h3 className="modal-title">{title}</h3>}

                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </dialog>
        </div>
    );
};



// components/Controls.js


export const NextButton = ({ onNext, disabled }) => (
    <button 
        id="next" 
        className="button" 
        type="button" 
        onClick={onNext}
        disabled={disabled}
    >
        Next
    </button>
);

export const SubmitButton = ({ onSubmit }) => (
    <button 
        type="button" 
        className="button" 
        id="submit"
        onClick={onSubmit}
    >
        Submit
    </button>
);

export const StopButton = ({ onStop }) => (
    <button 
        id="stop-text" 
        className="button" 
        type="button" 
        onClick={onStop}
        style={{ display: 'block' }} // Controlled by parent state usually
    >
        STOP QUESTION
    </button>
);

// New Component: Debug Logger (Based on your this.debugLogs)
export const DebugLogger = ({ logs }) => {
    // Only show in development or if a specific setting is on
    const [isVisible, setIsVisible] = React.useState(false);

    if (!logs || logs.length === 0) return null;

    return (
        <div style={{ position: 'fixed', bottom: 0, left: 0, padding: '10px', background: 'rgba(0,0,0,0.8)', color: '#0f0', maxWidth: '300px', fontSize: '10px', zIndex: 9999 }}>
            <button onClick={() => setIsVisible(!isVisible)} style={{marginBottom: '5px'}}>
                {isVisible ? 'Hide Logs' : 'Show Logs'}
            </button>
            
            {isVisible && (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{ borderBottom: '1px solid #333' }}>
                            {JSON.stringify(log)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export const METHODS = { // Exports a constant object for centralized method management
  ACCEPT_FRIEND_REQ: 'acceptFriendReq', // Key for accepting friend requests
  SEND_FRIEND_REQUESTS: 'sendFriendRequests', // Key for sending new friend requests
  HANDLE_REACT_BTN: 'handleReactBtn', // Key for processing UI reaction buttons
  SEND_CHALLENGE: 'sendChallenage', // Key for challenge invites (note: preserved original spelling)
  ANSWER_INVITE: 'answerInvite', // Key for responding to room invitations
  RECORD_JUMP: 'recordJump', // Key for logging user jump timestamps in Redis
  RECORD_USER_INPUT: 'recordUserInput', // Key for submitting text-based quiz answers
  STUDY: 'study', // Key for entering study mode
  GET_PASSAGE: 'getPassage', // Key for retrieving specific scripture text
  OPEN_ROOM: 'openRoom',
  SOLO_QUIZ: "soloQuiz",
  COMPUTER_QUIZ:'computerQuiz' // Key for creating new quiz rooms
}


// components/QuizGame.js (Updated)
const SubmitBtn = ({answer=''}) =>{
    const { wsClient }=  useConnection();
    const { gameState, setGameState, settings, currentQuestion } = useContext(QuizContext);
async function handleClick(){
   
   const {success, error}  = await  wsClient.emit(METHODS.RECORD_USER_INPUT, {}, answer)
 
  if(error) {console.error('errro wiht answer', error);return;}
   gameState.answers.push(answer)
}


  return  <button type="button" className="button" id="submit" onClick={handleClick}>Submit</button>
}



const JumpBtn = () =>{
    const { wsClient }=  useConnection();
    const { gameState, setGameState, settings, currentQuestion, setUserJumped, setCanJump,canJump

     } = useContext(QuizContext);
     //if(canJump)return null;
    //const { gameState, setGameState, settings, currentQuestion } = useContext(QuizContext);
async function handleClick(){
    console.log('user jumped');
    setUserJumped(true);
    setCanJump(false);
    //setGameState(prev=>({...prev, isTimerRuning: false}));
  const {success, error}  =await  wsClient.emit(METHODS.RECORD_JUMP);
  if(error) {console.error('errro wiht jump', error)}
  
}
  return  <button type="button" className="button" id="jump" onClick={handleClick}>Jump</button>
}



const quizHeadStylesExtra = `
  .quiz-head-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    flex-direction: row;
    padding: 15px;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .score-card {
    flex: 1 1 140px; /* Flexible: grow/shrink, base width 140px */
    max-width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    color: white;
    overflow: hidden;
    transition: transform 0.2s;
  }

  .score-card:hover { transform: translateY(-3px); }

  .user-name-tag {
    background: rgba(0, 0, 0, 0.2);
    width: 100%;
    padding: 8px;
    text-align: center;
    font-weight: bold;
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  .user-score-val {
    padding: 15px;
    font-size: 1.8rem;
    font-weight: 800;
  }

  .team-badge {
    border: 2px dashed rgba(255,255,255,0.5);
    margin-bottom: 5px;
    border-radius: 4px;
    font-size: 0.7rem;
    padding: 2px 6px;
  }

  .modal-btn {
    padding: 5px 10px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 5px;
    margin-bottom: 10px;
  }
`;

// Helper to generate a consistent color based on a string (username)
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 65%, 45%)`;
};

// Replace your existing quizHeadStyles and QuizHead component

const quizHeadStyles = `
  .quiz-head-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    justify-content: center;
    background: transparent;
  }

  .score-widget {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    padding: 6px 12px;
    gap: 10px;
    border-left: 4px solid var(--user-color);
    min-width: 100px;
    transition: transform 0.2s;
  }
  
  .score-widget:hover { transform: translateY(-2px); }

  .widget-info {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .widget-name {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
  }

  .widget-score {
    font-size: 1.1rem;
    font-weight: 800;
    color: #1e293b;
  }
`;

function QuizHead({ quizState }) {
    const { changeFeedback, setGameState, gameState } = useContext(QuizContext);
const {quizData} = useConnection()
    const scoreState = quizData?.score || {};
    const displayUser = gameState.usersScore || {};
    const questionState = quizData.questState || 'none'
useEffect(()=>{
    if(questionState === 'none')return;
    console.error(questionState.toLowerCase(), 'qs');
    changeFeedback(questionState.toLowerCase())
}, [questionState])
    // 1. Fixed Score Logic
    useEffect(() => {
        if (!scoreState.username) return; // Don't run if empty
try{
        const { username, points } = scoreState;
        const inc = points || 0;

        setGameState(prev => {
            const currentTotal = prev.usersScore[username] || 0;
            return {
                ...prev,
                usersScore: {
                    ...prev.usersScore, // CRITICAL: Keep existing users!
                    [username]: currentTotal + inc
                }
            };
        });
    }catch(ee){
        console.error(ee)
    }
    }, [scoreState]); // Only run when scoreState updates

    // 2. Widget Component
    const ScoreWidget = ({ name, score }) => (
        <div className="score-widget" style={{ '--user-color': stringToColor(name) }}>
            <div className="widget-info">
                <span className="widget-name">{name}</span>
                <span className="widget-score">{score}</span>
            </div>
        </div>
    );

    return (
        <>
            <style>{quizHeadStyles}</style>
            <div className="quiz-head-container">
               
                {Object.entries(displayUser).map(([name, score], i) => (
                    <ScoreWidget key={`${name}-${i}`} name={name} score={score} />
                ))}
            </div>
        </>
    );
}

function QuizFootBtns(){
return (<>

<button className='foot-btn-timeout'>Timeout</button>
</>)
}
function QuestHead({ questionHook }) {
    const {gameState, setGameState, settings, isWaiting } = useContext(QuizContext);
    const [head, setHead] = useState('');
    
    const headCur = questionHook?.question?.head;
    useEffect(() => {
        if (isWaiting) {
            setHead('');
        };


    }, [isWaiting])
    useEffect(() => {
  if(!headCur) return
        setHead(headCur)
    }, [headCur]);
    return (
        <strong className='question-head'>{head}</strong>
    )
}
function QuestFoot({ questionHook }) {
    const {chars:streamChars} = useConnection();
    const [chars, setChars] = useState('');
    // Use a ref to track ID without causing re-renders
const {setStream, isInput, setIsInput} = useStream()
    const {
        isWaiting,
        setUserInput,
        userJumped,
        setCanJump
    } = useContext(QuizContext);

    // 1. Listen for global resets via Context (e.g., waiting for next question)
    useEffect(() => {
        if (isWaiting || questionHook?.question?.wait) {
            setChars('');
        }
    }, [isWaiting, questionHook?.question?.wait]);

    // 2. FAST PATH: Listen directly to the WebSocket bypass event
    useEffect(() => {
        const handleFastChar = (e) => {
            const  [ questionId, char, charIndex]  = e.detail;

            // Handle start of question
            if (char === 'Question: ') {
                setCanJump(true);
                //questIdRef.current = questionId;
                setStream([]);
                setIsInput(false);
                alert('new question incoming', questionId);
                setGameState(prev => ({ ...prev, isTimerRuning: false })); 
                setChars('Question: ');
                return;
            }

            // Handle end of question
            
            if (true/*questIdRef.current === questionId*/) {
            // Append the character instantly to the screen
            setChars((prev) => {
                const charArray = prev.split('');
                charArray[charIndex + 10] = char; // +10 offset for 'Question: ' length
                return charArray.join('');
            });
                if (char === '?' && !userJumped) {
                    setUserInput('');
                    return;
                }
            // Update user input state
           
                setUserInput((prev) => {
                    const charArray = prev.split('');
                    charArray[charIndex] = char;
                    return charArray.join('');
                });
            }
            else
             {
                console.error('incorrect id wuets', questIdRef.current, questionId)
            };
        };

        // Attach listener
        window.addEventListener('fast-char-update', handleFastChar);

        // Cleanup listener on unmount
        return () => window.removeEventListener('fast-char-update', handleFastChar);

    }, [streamChars]); // Listen to character stream updates

    const [questionId, char, charIndex] = streamChars || [];
    useEffect(() => {
        

        // Handle start of question
        if (char === 'Question: ') {
            setCanJump(true);
            //questIdRef.current = questionId;
            setStream([]);
            setIsInput(false);
            //setGameState(prev => ({ ...prev, isTimerRuning: false }));
            setChars('Question: ');
            return;
        }

        // Handle end of question
        
        if (true ) {
            // Append the character instantly to the screen
            setChars((prev) => {
                const charArray = prev.split('');
                charArray[charIndex + 10] = char; // +10 offset for 'Question: ' length
                return charArray.join('');
            });

            // Update user input state
            if (char === '?' && !userJumped) {
                setUserInput('');
                return;
            }
            setUserInput((prev) => {
                const charArray = prev.split('');
                charArray[charIndex] = char;
                return charArray.join('');
            });
        }
        else {
            console.error('incorrect id wuets', questIdRef.current, questionId)
        };

    }, [streamChars]); // Listen to character stream updates
    
    return (
        <div className='question-chars'>
            {/* Wrap the prefix in a styled span if the text starts with it */}
            {chars.startsWith("Question: ") ? ( // Check if prefix exists
                <>
                    <span style={{ color: 'blue' }}>Question: </span>
                    {chars.slice(10)} {/* Render the rest of the question text */}
                </>
            ) : (
                chars // Fallback if the prefix hasn't arrived yet
            )}
        </div>
    ); // End of component return
}
const questionStyles = `
  .question-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  /* The "Head" - Big but not too big, slightly offset */
  .question-head {
    display: block;
    font-size: 1.4rem;
    color: #2c3e50;
    margin-bottom: 12px;
    margin-left: 4px; /* Slight offset from the foot */
    letter-spacing: -0.02em;
    border-left: 4px solid #3498db; /* Adds a visual 'stand out' element */
    padding-left: 12px;
  }

  /* The "Foot" - The flowing text area */
  .question-chars {
    font-size: 1.15rem;
    line-height: 1.6;
    color: #444;
    min-height: 3em; /* Prevents layout jump as text types in */
    padding: 10px 4px;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
`;

function QuestionDisplay({ questionHook }) {
    
    return (
        <>
            <style>{questionStyles}</style>
            <div className='question-container'>
                <QuestHead questionHook={questionHook} />
                <QuestFoot questionHook={questionHook} />
            </div>
        </>
    ); 
}
function IOSection({ serverStream}){
    const { gameState, setGameState, settings, currentQuestion, feedback, userInput, setCanJump , setUserInput, isWaiting } = useContext(QuizContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { profileData } = useConnection();
    const { isInput, setIsInput, stream, setStream, charStream, setCharStream } = useStream()
    const [cer, setCer] = useState(0);
   // const [truth, zcreateOwntruthAdndiebecuasethaisbadlifecauseGodtruthisthwonlytruthifudonotbeleiveitwillnotbegood] = useState(false)
  
 const { isListening, transcript, startListening } = useVoiceRecognition();
    useEffect(() => {
        console
        setStream([]);
        setGameState(prev => ({ ...prev, isTimerRuning: false,}));
    }, [feedback])
    const streamStyles = `
  .stream-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 400px;
    margin: 10px auto;
    perspective: 1000px; /* Adds depth for the slide effect */
  }

  .stream-block {
    padding: 12px 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-left: 5px solid var(--user-color, #ccc);
    font-weight: 500;
    color: #333;
    
    /* Animation: Slide in from right and fade in */
    animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
    
    /* Ensure it doesn't overflow on small screens */
    word-wrap: break-word;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @keyframes slideIn {
    0% {
      transform: translateX(50px) scale(0.9);
      opacity: 0;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  /* Different styling for Winner vs Jump */
  .stream-block.type-winner {
    background: #fffdf0; /* Slight gold tint */
    border-style: double;
    border-left-width: 8px;
  }

  /* Responsive Adjustments */
  @media (max-width: 480px) {
    .stream-container {
      max-width: 90%;
    }
    .stream-block {
      font-size: 0.85rem;
      padding: 10px;
    }
  }
`;
    const appInputStyles = `
  .chat-input-wrapper {
    display: flex;
    align-items: flex-end;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    padding: 8px 16px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    width: 100%;
    gap: 8px;
    transition: border-color 0.2s;
  }
  .chat-input-wrapper:focus-within {
    border-color: #3b82f6;
    background: #ffffff;
  }
  .chat-textarea {
    flex-grow: 1;
    border: none;
    background: transparent;
    resize: none;
    outline: none;
    font-size: 1rem;
    padding: 8px 0;
    min-height: 24px;
    max-height: 120px;
    color: #1e293b;
  }
  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  .icon-btn:hover {
    background: #e2e8f0;
    color: #334155;
  }
  .chat-submit-btn {
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    height: 40px;
  }
  .chat-submit-btn:hover {
    background: #2563eb;
  }
`;
useEffect(()=>{setUserInput(prev=> prev + transcript)}, [transcript])
    useEffect(() => {
        if (!serverStream?.username || isWaiting) return;
        let newData = null;
 
        if (serverStream.winner) {
            setCanJump(false);
            
            //serverStream.winner= false;
            console.warn('check this;, pro', profileData, serverStream.username)
            if (serverStream.username === profileData.username ) {
                setIsInput(true);
                setCout(p => p+1);   
                setGameState(prev => ({ ...prev, isTimerRuning: false,  }));        
                setGameState(prev => ({ ...prev, isTimerRuning: true, }));
            } else {
                setGameState(prev => ({ ...prev, isTimerRuning: false,  }));
                setGameState(prev => ({ ...prev, isTimerRuning: true,  }));
                setCer(p => p+1);
                newData = {
                    text: `${serverStream.username} is Answering`,
                    username: serverStream.username,
                    type: 'winner'
                };
            }
        } else if (serverStream.jumpTime) {
            setGameState(prev => ({ ...prev, isTimerRuning: false, }));
            setCer(p => p+1);
            newData = {
                text: `${serverStream.username} Jumped`,
                username: serverStream.username,
                type: 'jump'
            };
        }else if(serverStream.answerChar && !isInput){
            setCharStream(prev=>({active:true, input:prev['input']+serverStream.answerChar}))

        }

        if (newData) {
            setStream(prev => {
                // If we are at the limit, the first item "slides out"
                const newArray = prev.length >= 5 ? prev.slice(1) : prev;
                return [...newArray, newData];
            });
        }
    }, [serverStream]);
    
    return (
        <>
            <style>{streamStyles}</style>

            {!isInput ? (
                <div className='stream-container'>
                    {/* Render Stream Blocks */}
                    {stream.map((block, i) => (
                        <div
                            className={`stream-block type-${block.type}`}
                            key={`${i}-${block.username}`}
                            style={{ '--user-color': stringToColor(block.username) }}
                        >
                            <span>{block.text}{cer}</span>
                        </div>
                    ))}
                                <button onClick={()=>{setIsInput(true)}}>Redefine truth</button>
                    {/* Live Character Stream with Close Button */}
                    {charStream.active && (
                        <div style={{ position: 'relative' }}>
                            <textarea
                                readOnly
                                value={charStream.input}
                                className="blueborder"
                                style={{ width: '100%', minHeight: '60px', marginTop: '10px' }}
                            />
                            <button
                                onClick={() => setCharStream({ active: false, input: '' })}
                                style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                            >
                                <XCircle size={20} fill="white" />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Inside your IOSection component, replace your current text area div with this:
    <>
        <style>{appInputStyles}</style>

        <div className="chat-input-wrapper">
            <button
                className={`icon-btn ${isListening ? 'active' : ''}`}
                onClick={() => startListening()}
                title="Use Microphone"
            >
                {/* Mic Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isListening ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </button>

            <textarea
                spellCheck="false"
                placeholder="Type your verse here..."
                className="chat-textarea"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={userInput.split('\n').length > 1 ? 2 : 1} // Auto-expand slightly
            />

            {userInput.length > 0 && (
                <button
                    onClick={() => setUserInput('')}
                    className="icon-btn"
                    title="Clear text"
                >
                    <RotateCcw size={18} />
                </button>
            )}

            <SubmitBtn answer={userInput} />
        </div>
    </>
            )}
        </>
    );
}
function Waiting(){
      const { gameState, setGameState, settings } = useContext(QuizContext);
    return (<div className='waiting-next-question'>
        <h1 className='waiting-next-text'> {gameState.currentQuestionIndex === 0 ? "STARTING QUIZ..." :"QUESTION " + gameState.currentQuestionIndex }</h1>
      </div>)
}
const endStyles = `
    .end-container {
        text-align: center;
        padding: 40px 20px;
        animation: fadeIn 0.5s ease;
    }
    .winner-podium {
        margin: 30px 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 15px;
    }
    .rank-item {
        background: white;
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        min-width: 120px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .rank-1 { transform: scale(1.1); border: 2px solid #fbbf24; z-index: 2; }
    .rank-2 { border: 2px solid #94a3b8; }
    .rank-3 { border: 2px solid #b45309; }
    
    .trophy-icon { margin-bottom: 10px; }
    .rank-score { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    .rank-name { font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 0.9rem; }
    
    .home-btn {
        margin-top: 30px;
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 1.1rem;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .home-btn:hover { transform: scale(1.05); background: #2563eb; }
`;

function EndScene() {
    const { gameState, setGameState } = useContext(QuizContext);

    // Sort users by score (descending)
    const leaderboard = Object.entries(gameState.usersScore || {})
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 3); // Get top 3

    return (
        <div className="end-container">
            <style>{endStyles}</style>
            <Trophy className="trophy-icon" size={64} color="#fbbf24" />
            <h1>Quiz Complete!</h1>

            <div className="winner-podium">
                {leaderboard[1] && (
                    <div className="rank-item rank-2">
                        <span className="rank-name">{leaderboard[1][0]}</span>
                        <span className="rank-score">{leaderboard[1][1]}</span>
                        <small>2nd</small>
                    </div>
                )}

                {leaderboard[0] && (
                    <div className="rank-item rank-1">
                        <Trophy size={24} color="#fbbf24" />
                        <span className="rank-name">{leaderboard[0][0]}</span>
                        <span className="rank-score">{leaderboard[0][1]}</span>
                        <small>Winner</small>
                    </div>
                )}

                {leaderboard[2] && (
                    <div className="rank-item rank-3">
                        <span className="rank-name">{leaderboard[2][0]}</span>
                        <span className="rank-score">{leaderboard[2][1]}</span>
                        <small>3rd</small>
                    </div>
                )}
            </div>

            <button
                className="home-btn"
                onClick={() => window.location.reload()} // Simple way to reset everything
            >
                Restart Quiz
            </button>
        </div>
    );
}

// Update your QuizBody to use EndScene instead of End
function End() { return <EndScene />; }
const QuizBody = ({children})=>{
    const { gameState, setGameState, settings, isWaiting, setIsWaiting, useFeedback, setUserInput, setCanJump, setUserJumped, resetFeedback } = useContext(QuizContext);
    const {  quizData, quizScore, resetFeedback:reset } = useConnection();
    const { isInput, setIsInput, stream, setStream, charStream, setCharStream , } = useStream()


     const [isEnd, setIsEnd] = useState(false);

     
    useEffect(()=>{
  if(quizData.end){
    setIsEnd(true);
    return;
  }
if(quizData.question?.wait === undefined)return;
    if(quizData?.question?.wait === false){
        setStream([]);
        setIsInput(false);
        setGameState(prev => ({ ...prev, isTimerRuning: false }));
        console.warn('question head detected, setting isPlaying true', quizData)
        setIsWaiting(false);
        //gameState.isPlaying = true;
    }else if(quizData?.question?.wait){
        setGameState(prev => ({ ...prev, isTimerRuning: false }));
        setIsWaiting(true)
        resetFeedback();
        setCanJump(false);
        setUserJumped(false);
        console.warn('exuinting')
        setStream([]);
        setIsInput(false);
        setUserInput('');
        setCharStream({ active: false, input: '' })
        //setUserInput('');

        setGameState(prev=>({...prev,currentQuestionIndex:gameState.currentQuestionIndex ++}))
        //setIsEnd(quizData?.end || false)
    }else if (quizData?.end){
        setIsEnd(quizData?.end || false)    }
    }, [quizData?.question?.wait, quizData?.end])
    return (
      <>
      {isEnd ? <EndScene /> : isWaiting ? <Waiting /> : children}
      </>
    )
    

}
export const QuizGame = () => {
     const { gameState, setGameState, settings,canJump, userJumped,useFeedback, changeFeedback, feedback} = useContext(QuizContext);
     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [statusObj, myStatus, userData] = useStatus();
    const {usersData, initalScore} = useContext(ModeContext);
    
    
      const [error, setError] = useState(false);
    const { streamData, quizData, quizScore, serverstate, SERVER_STATES } = useConnection();
    // Voice Hook
    
    useEffect(()=>{
        if(serverstate === SERVER_STATES.ERROR){
            setError(true);
            console.error('server error state detected');
        }else{
            setError(false);
            console.warn('error is now false')
        }
    }, [serverstate])

    // Logic for Next Button
    
    // Local UI states for feedback buttons
    useEffect(() =>{
setGameState(prev=>({...prev, isPlaying: true, }) );
        setGameState(prev => ({
            ...prev, usersScore: {
                ...prev.usersScore,
                ...initalScore
            }, usersMetatData: {
                ...prev.usersMetatData,
                ...userData
            }
        }))

    }, [])
    

    // Simulate your 'handleSpaceEvent'
   

    // Calculate progress percentage
    const progressPercent = ((gameState.currentQuestionIndex ) / gameState.totalQuestions) * 100;

    return false ? null :(
       
        <main id="nextScene" className="quiz-container" style={{ display: 'flex' }}>
            <div className="quiz-card" id="card">
                
                {/* --- Header Area --- */}
             {/* <button onClick={() => setIsSettingsOpen(true)}>
                <div className="settings-icon-btn" style={{position: 'absolute', right: '10px', top: '10px'}}>
                  
                </div>
               </button>  */}
                

            {/* --- Modals --- */}
            <UniversalModal 
                isOpen={isSettingsOpen} 
                onClose={() => setIsSettingsOpen(false)}
                title="In-Game Settings"
                footerButtonText="Resume Quiz"

            >
                <QuizDataTabs dataUpdate={gameState} />
                <QuizDataTabs dataUpdate={{canjump:canJump, feed:feedback, userjUmped:userJumped}} />
                <QuizDataTabs dataUpdate={statusObj} />
                {/* <SettingsForm  /> */}
            </UniversalModal>
<div id="questionNumber">{gameState.currentQuestionIndex }</div>
                <StreamProvider>
                
<QuizHead  quizState={quizData}/>
<QuizBody >
                    <QuizTimer />
                    {/* <div className="progress-container" id="progressBar2">
                        <div
                            className="progress-bar"
                            id="progressBar"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div> */}

                {/* --- Feedback Buttons Area --- */}
                
                
                <div className="quiz-content">
                    
                    


                     <QuestionDisplay questionHook={quizData} />

                    <IOSection serverStream={streamData} />
                 {canJump &&  <JumpBtn/>}
                        
                    {/* --- Input Area: Switch based on Drag Mode --- */}
                    

                  <div>
                    <div className="button-group">
                       
                        
                        {/* Conditional Rendering of Status Buttons */}
                        {feedback.correct && <button id="correctbtn" className="answer-button correct1" style={{display:'block'}}>Correct!</button>}
                        {feedback.incorrect && <button id="incorrectbtn" className="answer-button incorrect1" style={{display:'block'}}>Incorrect!</button>}
                        {feedback.please && <button id="pleasebtn" className="answer-button orange" style={{display:'block'}}>Please Correct</button>}
                        {feedback.plural && <button id="puralbtn" className="answer-button orange" style={{display:'block'}}>Incorrect Form</button>}
                        {feedback.more && <button id="morebtn" className="answer-button orange" style={{ display: 'block' }}>Try Again</button>}
                        
                        {/* <button id="stop-text" className="button" type="button">STOP QUESTION</button>
                         */}
                       
                        <a href="#"><button id="restart" className="button" type="reset" onClick={() => setGameState(prev => ({...prev, isPlaying: false}))}>Home</button></a>
                    </div>
                </div>
                </div>
                
                </QuizBody>
                </StreamProvider>
                {/* <QuizFootBtns /> */}
            </div>
        </main>
       
    );
};
function QuizLogs(){
    const { quizData, wsClient } = useConnection()
    const [logs, SetLogs] = useState([])
    useEffect(()=>{
    SetLogs(prev=>[...prev, quizData])
    }, [quizData]);
    return null;
}
const lobbyStyles = `
  .lobby-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 20px;
    font-family: 'Inter', sans-serif;
  }

  .lobby-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .lobby-header h1 {
    font-size: 2.5rem;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  .pulse-text {
    color: #666;
    animation: pulse 2s infinite;
  }

  .player-grid {
  display: grid;
  /* Adjust '200px' to match your card's width + gap */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  width: 100%;
  justify-items: center;
}
  .player-card {
    background: white;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid #eee;
    transition: all 0.3s ease;
  }

  .player-card.is-me {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .avatar-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
    margin-bottom: 12px;
  }

  .status-badge {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .status-connected { background: #dcfce7; color: #166534; }
  .status-waiting { background: #fef9c3; color: #854d0e; }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
function LoadUserData(){
    
    return null;
}
function PlayerCard({ username, status, isMe }) {
    const initials = username ? username.substring(0, 2).toUpperCase() : '??';

    return (
        <div className={`player-card ${isMe ? 'is-me' : ''}`} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px', // Increased padding
            minWidth: '180px',    // Larger base width
            minHeight: '200px',   // Ensure it looks like a "card"
            borderRadius: '16px',
            background: isMe ? 'rgba(59, 130, 246, 0.05)' : '#ffffff',
            border: isMe ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s ease'
        }}>
            {/* Bigger Avatar */}
            <div className="avatar-circle" style={{
                width: '64px',
                height: '64px',
                fontSize: '1.5rem',
                backgroundColor: isMe ? '#3b82f6' : '#94a3b8',
                marginBottom: '16px'
            }}>
                {initials}
            </div>

            {/* Username - Full Visibility */}
            <strong style={{
                fontSize: '1.1rem',
                color: '#1e293b',
                marginBottom: '12px',
                width: '100%',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.3'
            }}>
                {username}
                {isMe && (
                    <span style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 'normal',
                        color: '#64748b',
                        marginTop: '4px'
                    }}>(You)</span>
                )}
            </strong>

            <span className={`status-badge ${status === 'connected' ? 'status-connected' : 'status-waiting'}`}>
                {status || 'Pending'}
            </span>
        </div>
    );
}
export default function QuizApp(){
    
        const { quizData, wsClient, profileData, streamData } = useConnection();
        const [usersData, setUsersData] = useState({});
        const [params] = useSearchParams();
        const [hasStarted, setSart] = useState(false)
        const rawConfig = params.get('config');
        const [initalScore, setinitScore] = useState({[profileData?.username || '']:0})
        const [isTeamMode, setIsTeamMode] = useState(false);
        const [timerSettings, setTimerSettings] = useState({  isTimerRuning: false });  
   const userConfig = quizData.userConfig || {};
   const start = quizData.start;
   const settings = quizData.settings;
        // Check if the quiz has actually started
      
        useEffect(() => {
            if(start){
                setSart(true);
                const { timerSettings } = settings;
                setTimerSettings(ts => ({ ...ts, timeLen: timerSettings?.questionAnswer || ts.timeLen, isTimerRuning: timerSettings?.isTimerRuning || ts.isTimerRuning }) )
            }
        }, [start]) 
        
       useEffect(()=>{
        if(!userConfig.username || start)return;
        console.warn('val of ucrt1satrt start', userConfig)
           setinitScore(prev => ({ ...prev, [userConfig.username]:0 }))
        setUsersData(prev=>({...prev, [userConfig.username]: { username: userConfig.username, status: 'connected' }}))
       },[userConfig])
    console.warn(usersData)
        useEffect( () => {
            async function  wait(){
            //await new Promise (reslove=>{setInterval(()=>{   profileData.username && reslove(), }, 250)})
            const config = JSON.parse(rawConfig || '{}');
            if (config?.func) {
                setIsTeamMode(config.mode === 'team');
               await  wsClient.emit(config.func, {}, ...config.args || []);
            }
};
wait();


}, []);

        if (!hasStarted) {
            return (
                <QuizProvider>
                    <LoadUserData />
                <div className="lobby-container">
                    <style>{lobbyStyles}</style>
                    <div className="lobby-header">
                        <h1>Game Loading</h1>
                        <p className="pulse-text">Waiting for the quiz to start...</p>
                    </div>

                    <div className="player-grid">
                        {/* Map through usersData which should be an object or array of players */}
                        {Object.entries(usersData || {}).map(([uid, data]) => (
                            <PlayerCard
                                key={uid}
                                username={data.username || '??'}
                                status={data.status}
                                isMe={data.username === profileData?.username}
                            />
                        ))}

                        {/* Fallback if you are the only one there and usersData hasn't populated */}
                      (
                            <PlayerCard
                                username={profileData?.username || "Guest"}
                                status="connected"
                                isMe={true}
                            />
                        )
                    </div>
                    <button onClick={()=>wsClient.emit('start')} style={{backgroundColor:'blue', color:'white'}}>Start Now</button>
                </div>
                </QuizProvider>
            );
        }
    return (
        <ModeContext.Provider value={{isTeamMode, setIsTeamMode,usersData, initalScore }}>

                

            <QuizProvider>

<QuizLogs />
                <QuizGame />

                    
            </QuizProvider>

        </ModeContext.Provider>
    )
}