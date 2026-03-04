import { useRef, useEffect, useState } from 'react' 
// Import React hooks for state and side effects

import  './style.css' // Import existing CSS styles
import { QuizCompanion } from './main.js'; // Import the QuizCompanion class for data structures
import Modal from './modal.jsx'; // Import the Modal wrapper component
import Loading from './Loading.jsx'; // Import the Loading component for displaying a loading state 

export function QuestCard({qObj}){
    const verse =   <p><strong>Verse:</strong> {qObj.verse}</p>;
    const ansQuestion = ( <>  <p><strong>Question:</strong> {qObj.question}</p>
    <p><strong>Answer:</strong> {qObj.answer}</p> 
    </>)
    return (<div className='questCard'>
      <h3>{qObj.ref}</h3>
     { qObj.type === 'ftv/quote' ? verse : ansQuestion}
     <span className='correct-icon'> ✅ {qObj.correct || 0} </span>
    <span className='incorrect-icon'>❌  {qObj.incorrect || 0} </span>
    </div>)
  }
  export  function QuestDataCard ({qObj}){
    const verse =   <p><strong>Verse:</strong> {qObj.verse}</p>;
    const ansQuestion = ( <>  <p><strong>Question:</strong> {qObj.question}</p><p><strong>Answer:</strong> {qObj.answer}</p> 
    </>)
    
    return (
      <div className='card '>
        <h3>{qObj.ref}</h3>
        { qObj.type === 'ftv/quote' ? verse : ansQuestion}
      </div>


    )


  }