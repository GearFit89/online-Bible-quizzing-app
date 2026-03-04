import React, { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import questionsData from './assets/questions.json' //with { type: 'json' }; //nsure path is correct

const QuizLoadingScreen = () => {
  // 1. Select 30 random entries once when the component mounts
  const loadingSet = useMemo(() => {
    return [...questionsData]
      .sort(() => 0.5 - Math.random())
      .slice(0, 30);
  }, []);

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    let timeoutId;

    const cycleQuestion = () => {
      // Start fade out
      setFade(false);

      // Wait for fade out animation (500ms), then change content
      timeoutId = setTimeout(() => {
        setIndex((prev) => (prev + 1) % loadingSet.length);
        setFade(true);

        // Set a random delay for the NEXT question (between 3 and 6 seconds)
        const nextDelay = Math.floor(Math.random() * 3000) + 3000;
        timeoutId = setTimeout(cycleQuestion, nextDelay);
      }, 500);
    };

    // Initial delay before the first swap
    const firstDelay = Math.floor(Math.random() * 2000) + 3000;
    timeoutId = setTimeout(cycleQuestion, firstDelay);

    // CLEANUP: Kill timers if component unmounts to prevent memory leaks/crashes
    return () => clearTimeout(timeoutId);
  }, [loadingSet]);

  const current = loadingSet[index];

  return (
    <div className="loading-wrapper">
      <div className="loader-box">
        <Loader2 className="spinner" size={40} />
        <h2>Syncing Quiz Data...</h2>
      </div>

      {/* Fixed height container prevents the "jumping" layout issue */}
      <div className={`preview-card ${fade ? 'fade-in' : 'fade-out'}`}>
        <div className="card-inner">
          <span className="type-badge">{current.type.toUpperCase()}</span>
          <p className="q-text">{current.question}?</p>
          <div className="divider" />
          <p className="a-text">{current.answer}</p>
          {current.ref && <span className="ref-text">{current.ref}</span>}
        </div>
      </div>

      <style jsx>{`
                .loading-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background-color: #f1f5f9;
                    padding: 20px;
                }
                .loader-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 30px;
                    color: #1e293b;
                }
                .spinner {
                    animation: spin 1s linear infinite;
                    color: #2563eb;
                }
                .preview-card {
                    background: white;
                    width: 100%;
                    max-width: 500px;
                    height: 280px; /* FIXED HEIGHT TO STOP JUMPING */
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.5s ease-in-out;
                }
                .card-inner {
                    padding: 30px;
                    text-align: center;
                    width: 100%;
                }
                .type-badge {
                    font-size: 10px;
                    letter-spacing: 1px;
                    font-weight: 800;
                    color: #3b82f6;
                    background: #eff6ff;
                    padding: 4px 10px;
                    border-radius: 20px;
                }
                .q-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 15px 0;
                    color: #1e293b;
                }
                .divider {
                    height: 1px;
                    background: #e2e8f0;
                    width: 40px;
                    margin: 15px auto;
                }
                .a-text {
                    color: #64748b;
                    font-style: italic;
                }
                .ref-text {
                    display: block;
                    margin-top: 10px;
                    font-size: 12px;
                    color: #94a3b8;
                }
                .fade-in { opacity: 1; }
                .fade-out { opacity: 0; }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

export default QuizLoadingScreen;