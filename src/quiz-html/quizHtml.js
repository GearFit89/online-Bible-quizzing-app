 
const dis = 'block';
const QUIZSECENE = `<main id="nextScene" class="quiz-container" style="display: block;">
        <div class="quiz-card" id="card">

            
            <button id="BTN" class="settings-icon-btn" aria-label="Open Settings">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-settings">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            </button>
            <div class="quiz-header-area" id="clear">
                <div id="quizTimer" class="timer-circle">
                    <span class="timer-number"></span>
                  </div>
                <!--<div id="quiz-timer" class="mb-4 shadow-lg">
                   
                    <span class="timer-display">
                     
                    </span>
                </div>
                
                
                <p id="status-message" class="text-center text-base font-medium text-gray-600">Time remaining: 30 seconds</p> -->
                <div class="fallback-message" id="quizHeader"></div>
                <button id="retry" class="answer-button incorrect1 extra-margin"><span>Retry Question </span></button>
                <div id="review" class="reveiw"></div>
                <button id="new-quiz" class="button" style="display: block;"> Review incorrect Questions</button>
                <main>
            </div>
            
            <div class="progress-container" id="progressBar2">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <button id="correctbtnQ" class="answer-button correct1 extra-margin">Question Correct!</button>
          <div id="finish-question" ><button id="f-btn" class="f-btn-black button">
            <p id="f-txt">
                Finish question 
                <br>
                <small>(not the answer)</small>
            </p>
        </button></div>

           <div class="quiz-content">
            <div id="questionNumber">1</div>
            
            <div class="text-container" id="quiz-text-content">
                <h2 id="main-text"></h2>
                <h2 id="second-text" class="blinking-text"></h2>
            </div>
         
   <div id="answer-section" class="answer-section" >
            

            <textarea spellcheck="false" placeholder="Enter Text" id="verse" class="blueborder"></textarea>
            
          
       
            <div id="drag-drop-container" class="drag-drop-container">
            <div id="versedrop" class="drag-zone draggable-container blueborder"> </div>
               <div id="verse-con" class="draggable-container drag-zone blueborder"> </div>


            </div>
            </div>
        </div>
                <!-- Comment: Mic button moved back to its position directly under the #verse container -->
            <button id="micBtn" class="micBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mic-icon"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                <span id="micSpan">Press For Mic</span>
            </button>
            
                <!--<div class="quiz-footer">
                    <div class="score-display" id="score">Score: 0</div>
                    <div class="question-count" id="questionCount">Question: 0/0</div>
                </div>-->
              
                <div class="button-group">
                    <button type="reset" class="button" id="submit">Submit</button>
                    <button type="reset" class="button" id="submit-finish">Submit</button>
                    <button id="correctbtn" class="answer-button correct1">Correct!</button>
                    <button id="incorrectbtn" class="answer-button incorrect1">Incorrect!</button>
                    <button id="pleasebtn" class="answer-button orange">Please Correct</button>
                    <button id="next" class="button" type="reset" >Next</button>
                    <button id="stop-text" class="button" type="button" >STOP QUESTION</button>
                    <button id="pleasefinish" class="answer-button black">Finish the Question 
                        
                    </button>
                    <button id="More" class="answer-button orange">More information</button>
                    <!--<button id="BTN" class="button"> Quiz Settings</button>-->
                    <button type="button" class="button" id="startreview" >Start Quiz</button>
                    <button id="puralbtn" class="answer-button orange">Incorrect Form</button>
                     <!-- Comment: Print Button positioned in the top right corner -->
        <a href="PageToPrintQuestion.html" target="_blank" title="Print Questions (Opens in New Tab)" class="print-button-start-scene">
            <button id="printBtnLink" class="button print-button-link" type="button">
                <!-- Comment: Inline SVG for a clean print icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-printer"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </button>
        </a>
                    <a href="index.html"><button id="restart" class="button" type="reset" >Home</button></a>
                </div>
            </div>
        </div>
        </main>
    </main>
    <div id="hi" ></div>`;
    const MHTML = `<dialog class="modal" id="settings"> 
        <div class="modal-content" id="modaldiv">
            <h3 id="modalh3">Settings</h3>
           <!-- <div class="option-section">
                        <h3 class="section-title">Length of Timer (Length of zero will be no timer)</h3>
                        <input type="number" id="secs" name="numQuestions" value="30" min="0" max="1000" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    </div>
                    <div class="option-section">
                        <h3 class="section-title">Speed of Text (In seconds)</h3>
                        <input type="range" id="speed" name="numQuestions" value="0" min="0" max="1000" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
                    </div>-->
            
            <p id="modalMessage"></p>
            
            </div>
            <br>
            
            
            <button id='closeModalBtn' class="button">OK</button>
        
    </dialog>`
   export {MHTML};
    export default QUIZSECENE