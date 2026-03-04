import React, { useState, useMemo } from 'react';
import { User, Users, SettingsIcon,Globe, ChevronRight, BookOpen, ArrowLeft, Play, Clock } from 'lucide-react';
import './Quizzing.css';
import { AdvancedSettings  } from '../settings';
import { Link } from 'react-router-dom';
import { UniversalModal, METHODS } from './QuizStates';
import { useConnection, RoomTypes, wsClient } from '../connection';
import QUIZZES from './quizzes.json' with {type:'json'}; // Import the new JSON
import BOTS from './bots.json' with {type:'json'}; // Import bot configurations
const QUIZ_MODES = [
  {
    id: 'solo',
    type: RoomTypes.SOLO,
    header: 'Solo Quizzing',
    description: 'Master your skills with personalized challenges.',
    buttonText: 'View Solo Quizzes',
    class: 'mode-solo',
    btnClass: 'btn-blue',
    icon: <User size={32} />,
    quizzes: Object.values(QUIZZES).filter(q => q.id.startsWith('s'))
  },
  {
    id: 'com',
    type: RoomTypes.COMPUTER,
    header: 'Computer',
    description: 'Challenge a bot in real-time battles.',
    buttonText: 'Test Your Knowledge',
    class: 'mode-multi',
    btnClass: 'btn-indigo',
    icon: <Users size={32} />,
    quizzes: Object.values(BOTS.modes).map(bot => ({ // Map over the bot modes to create quiz entries
      id: bot.id, // Assign the bot ID to the quiz ID
      title: `Vs. ${bot.name} (${bot.display})`, // Set the title to show the bot's name and difficulty label
      questions: 'Variable', // Indicate that the number of questions is variable/dynamic for bots
      duration: `Difficulty: ${bot.difficulty}/10`, // Show the difficulty rating in the duration UI slot
      type: RoomTypes.COMPUTER, // Assign the correct room type for computer matches
      mode: 'bot' // Define the sub-mode as bot to be passed to the game configuration
    })) // End of mapping bots to quizzes array
  },
  {
    id: 'online',
    type: RoomTypes.MULTI,
    header: 'Multiplayer',
    description: 'Challenge your friends in real-time battles.',
    buttonText: 'Find Friends',
    class: 'mode-online',
    btnClass: 'btn-cyan',
    icon: <Globe size={32} />,
    quizzes: Object.values(QUIZZES).filter(q => q.id.startsWith('o'))
  }
];

const QuizCard = ({ mode, onSelect }) => {
  return (
    <div className={`quiz-card ${mode.class}`}>
      <div className="icon-box">
        {mode.icon}
      </div>
      <h2 className="card-title">{mode.header}</h2>
      <p className="card-desc">{mode.description}</p>
      <button
        onClick={() => onSelect(mode)}
        className={`quiz-btn ${mode.btnClass}`}
      >
        {mode.buttonText} <ChevronRight size={18} />
      </button>
    </div>
  );
};

const QuizListView = ({ mode, onBack }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { friends } = useConnection();
  const [isWaitUsers, setIsWaitUsers] = useState(false);
  const [isSoloOpen, setIsSoloOpen] = useState(false);
  const [userSel, setUsersSel] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isComOpen, setIsComOpen] = useState(false);
  const [activeQuizData, setActiveQuizData] = useState(null);
const [maxUsers, setMaxUsers] = useState(4); // Default max users for multiplayer quizzes
  const quizUrl = useMemo(() => {
    if (!activeQuizData) return '#';
    const { id, type, title, mode: quizMode } = activeQuizData;
    let func = METHODS.OPEN_ROOM;

    if ((userSel?.length || 0) > 0 && type === RoomTypes.MULTI) {
      func = METHODS.SEND_CHALLENGE;
    }
    if (type === RoomTypes.SOLO) func = METHODS.SOLO_QUIZ;
    else if (type === RoomTypes.COMPUTER) func = METHODS.COMPUTER_QUIZ;
    else if (type === RoomTypes.MULTI) func = userSel.length != 0?METHODS.SEND_CHALLENGE: METHODS.OPEN_ROOM;
    if (id.length > 2) console.error('wronagggggggg id', activeQuizData);
    const configArg = { requiredUsers: userSel, title, type: type, mode: quizMode, quizId:id };
    return `/play?config=${encodeURIComponent(JSON.stringify({ func, args: [configArg, maxUsers] }))}`;
  }, [activeQuizData, userSel]);

  return (
    <div className="list-view-container">

      {/* --- FIX: Added arrow functions to onClose to prevent infinite loop --- */}
      <UniversalModal isOpen={isOpen} title="Select who to Quiz" onClose={() => setIsOpen(false)}>
        <div className='modal-content-wrapper'>
          <div className='friend-view'>
            {friends.length === 0 ? (
              <p className="no-friends-text">No friends available. Please add friends to challenge them!</p>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.username || friend}
                  className={`friend-item ${userSel.includes(friend.username || friend) ? 'selected' : ''}`}
                  onClick={() => {
                    if (userSel.includes(friend.username || friend)) {
                      setUsersSel(userSel.filter(u => u !== friend.username || friend));
                    } else {
                      setUsersSel([...userSel, friend.username || friend]);
                    }
                    setIsWaitUsers(userSel.length === 0);
                  }}
                >
                  <div className="friend-icon">
                    {friend.icon ? <img src={friend.icon} alt={friend.username || friend} /> : <User size={24} />}
                  </div>
                  <span className="friend-username">{friend.username || friend}</span>
                  {userSel.includes(friend.username || friend) && <span className="selected-check">✓</span>}
                </div>
              ))
            )}
          </div>
          {/* Note: Removing target='_blank' keeps the connection alive */}
          <Link to={quizUrl} className="modal-action-link">
            <button className="quiz-btn btn-cyan full-width">
              {!isWaitUsers ? "Wait for Players" : "Invite Friends"}
            </button>
          </Link>
        </div>
      </UniversalModal>

      <UniversalModal isOpen={isSoloOpen} title="Starting Solo Quiz" onClose={() => setIsSoloOpen(false)}>
        <div className='modal-content-wrapper'>
          <p className="modal-text">Your solo quiz is about to begin. Good luck!</p>
          <Link to={quizUrl} className="modal-action-link">
            <button className="quiz-btn btn-blue full-width">Start Quiz</button>
          </Link>
          <UniversalModal isOpen={isSettingsOpen} title="Quiz Settings" onClose={() => {setIsSettingsOpen(false); }}>
            <AdvancedSettings onClose={() => setIsSettingsOpen(false)} />
          </UniversalModal>
          <button onClick={()=>setIsSettingsOpen(true)} ><SettingsIcon /></button>
        </div>
      </UniversalModal>

      <UniversalModal isOpen={isComOpen} title="Starting Computer Quiz" onClose={() => setIsComOpen(false)}>
        <div className='modal-content-wrapper'>
          <p className="modal-text">Your quiz against the computer is about to begin. Get ready!</p>
          <Link to={quizUrl} className="modal-action-link">
            <button className="quiz-btn btn-indigo full-width">Start Quiz</button>
          </Link>
        </div>
      </UniversalModal>

      <button onClick={onBack} className="back-btn">
        <ArrowLeft size={20} /> Back to Categories
      </button>

      <div className="list-header">
        <div className={`icon-box ${mode.class} header-icon`}>{mode.icon}</div>
        <div>
          <h1 className="header-title">{mode.header}</h1>
          <p className="header-subtitle">Select a quiz to get started</p>
        </div>
      </div>

      <div className="quiz-list">
        {mode.quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-item-row">
            <div className="quiz-info-group">
              <div className="quiz-icon-wrapper"> <BookOpen size={24} /> </div>
              <div>
                <h3 className="quiz-title">{quiz.title}</h3>
                <div className="quiz-meta">
                  <span className="meta-item"> <Play size={14} /> {quiz.questions} Questions </span>
                  {quiz.duration && <span className="meta-item"> <Clock size={14} /> {quiz.duration} </span>}
                </div>
              </div>
            </div>

            <button
              className="quiz-arrow-btn"
              onClick={() => {
                setActiveQuizData({
                  id: quiz.id,
                  type: quiz.type ? quiz.type : mode.type,
                  title: quiz.title,
                  mode: quiz.mode ?? 'single'
                });
                const type = quiz.type ? quiz.type : mode.type;
                if (type === RoomTypes.MULTI) setIsOpen(true);
                else if (type === 'computer') setIsComOpen(true);
                else setIsSoloOpen(true);
              }}>
              <div className="arrow-circle"> <ChevronRight size={20} /> </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Quizzing() {
  const [selectedMode, setSelectedMode] = useState(null);

  return (
    <div className="quizzing-container">
      <div className="max-width-wrapper">
        {!selectedMode ? (
          <div className="modes-grid">
            {QUIZ_MODES.map((mode) => (
              <QuizCard key={mode.id} mode={mode} onSelect={setSelectedMode} />
            ))}
          </div>
        ) : (
          <div>
            <QuizListView mode={selectedMode} onBack={() => setSelectedMode(null)} />
          </div>
        )}
      </div>
    </div>
  );
}