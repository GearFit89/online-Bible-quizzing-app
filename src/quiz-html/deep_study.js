
    import QUIZSECENE from './quizHtml.js';
    import { debug, QuizCompanion, Sockets, HtmlContentHandling, delog, startVoiceRecognition, setQuizSetings, SETTINGSHTML,  VerseStudy, QuizStudy} from './main.js';
        // Load the quiz scene HTML into the quiz container
    const quizSceneDiv = document.getElementById('quiz-container');
    let questionMode = 'both'
        // Tailwind Configuration for the custom gradient and font
       
   
        // JavaScript function to handle button clicks (for demonstration)
        function selectStudyMode(mode) {
            const output = document.getElementById('selectionOutput');
            const buttons = document.querySelectorAll('.study-mode-button');
            const quizScene =  document.getElementById('quiz-container');
            quizScene.innerHTML = ''; // Clear previous content
            quizScene.innerHTML = QUIZSECENE; // Load quiz scene content
           /* // Reset all buttons
            buttons.forEach(btn => {
                btn.classList.remove('ring-4', 'ring-indigo-300', 'shadow-2xl');
                btn.classList.remove('ring-4', 'ring-indigo-300', 'shadow-xl'); // Clean up old shadow if present
            });

            // Highlight the selected button with a subtle shadow
            const selectedBtn = document.getElementById(`btn-${mode.toLowerCase()}`);
            selectedBtn.classList.add('ring-4', 'ring-indigo-300', 'shadow-xl');

            // Show confirmation message
            output.textContent = `Study Mode Selected: ${mode}`;
            output.classList.remove('hidden');*/

        }
        

// create a qustion array and pass to startapp 
//const questionToAsk = ['Study this passage','Recite the whole passage' ,"Memorize this chunk of words",  'Enter the chunk you just learned', "Enter all words in this verse you just learned","Practice your diffclut words", 'Review' ]
//q.startApp()
/// verese will be an array. within an object with the key verses
const defaultPassage = {book: "John", chapter: 3, verses: [ "16 For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", "17 For God did not send his Son into the world to condemn the world, but to save the world through him.", '18 ']}; /// default passage if none loaded
   
const isFromQuiz = location.hash.split('-')[0] === '#quiz' ? true : false;/// either #verse or #quiz
const QUESTIONID =   location.hash.split('-')[1];
const PASSAGE = JSON.parse(localStorage.getItem('currentPassage') || '{}' ) || defaultPassage; 
/// get from local storage
if(!isFromQuiz){
    console.log ("No passage loaded for study. Using default passage.");
} else if(isFromQuiz){
    console.log('ffromquiz',  location.hash.split('-'))
    
}

if(isFromQuiz){
    document.getElementById('container').addEventListener('click', ({target})=>{
        if(target && target.closest('.study-mode-button')){
            const mode = target.closest('.study-mode-button').id;
            selectStudyMode(mode);
            questionMode = mode;
            const Study = isFromQuiz ? new QuizStudy(QUESTIONID, questionMode , 3) : new VerseStudy();
        }
       })
} else{


}
 










function compareVerses(actualVerse, userVerse) {
    
    // --- Helper 1: Normalization and Tokenization ---
    /**
     * Cleans the input text by converting it to lowercase, removing punctuation, 
     * and splitting it into an array of words (tokens).
     */
    const cleanAndTokenize = (text) => {
        const lowerCaseText = text.toLowerCase(); // Convert text to lowercase for case-insensitive comparison.
        // Replace all common punctuation marks with a space.
        const cleanedText = lowerCaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' '); 
        // Replace multiple spaces with a single space.
        const singleSpaceText = cleanedText.replace(/\s{2,}/g, ' '); 
        // Split the string by single spaces.
        // Filter out any empty strings that might result from the cleaning process.
        return singleSpaceText.split(' ').filter(word => word.length > 0); 
    };

    // --- Helper 2: Frequency Mapping ---
    /**
     * Builds a frequency map for a given array of words.
     */
    const buildWordFrequency = (words) => {
        const frequencyMap = {}; // Initialize an empty object to store word counts.
        for (const word of words) { // Iterate over each word token.
            // Increment the count for the word, initializing to 0 if it's the first time.
            frequencyMap[word] = (frequencyMap[word] || 0) + 1; 
        }
        return frequencyMap; // Return the map of word counts.
    };

    // 1. Prepare data for comparison
    const actualTokens = cleanAndTokenize(actualVerse); // Tokenize and normalize the actual verse.
    const userTokens = cleanAndTokenize(userVerse); // Tokenize and normalize the user's input.
    
    const actualFreq = buildWordFrequency(actualTokens); // Build frequency map for the actual verse.
    const userFreq = buildWordFrequency(userTokens); // Build frequency map for the user's input.

    // 2. Statistical Comparison (Finding Missed Words)
    const missedWords = []; // Array to store words missed based on frequency count.
    
    for (const word in actualFreq) { // Iterate through every unique word required by the actual verse.
        const requiredCount = actualFreq[word]; // Get the count required for this word.
        const providedCount = userFreq[word] || 0; // Get the count provided by the user, defaulting to 0.
        
        if (providedCount < requiredCount) { // Check if the user missed any instances of this word.
            const missedCount = requiredCount - providedCount; // Calculate the number of times the word was missed.
            for (let i = 0; i < missedCount; i++) { // Add the word to the results array for the number of times it was missed.
                missedWords.push(word); 
            }
        }
    }

    // 3. Sequential Comparison (Visual Highlighting Logic)
    const sequentialReport = []; // Array to store the word-by-word sequential status.
    let userIndex = 0; // Index to track the user's current token position.

    for (const actualWord of actualTokens) { // Iterate through each word in the actual verse.
        const userWord = userTokens[userIndex]; // Get the corresponding word from the user's input at the current position.
        let status = 'missed'; // Default status if no match is found.
        
        if (userWord && actualWord === userWord) { // If the words match at the current position (perfect sequence).
            status = 'correct'; // Mark as correctly placed.
            userIndex++; // Advance the user index to the next word.
        } else if (userWord) { // If there is a user word, but it doesn't match the actual word.
            // Check if the actual word appears shortly after in the user's input (misplaced or extra word detected).
            const lookAheadLimit = Math.min(userTokens.length, userIndex + 3); // Look 3 words ahead max for a misplaced word.
            let lookAheadFound = false; // Flag to track if the actual word is found later.

            for (let j = userIndex + 1; j < lookAheadLimit; j++) { // Loop ahead in the user's tokens.
                if (actualWord === userTokens[j]) { // If the word is found, it's a sequence error (misplaced).
                    lookAheadFound = true; 
                    break; // Exit the look-ahead loop.
                }
            }

            if (lookAheadFound) {
                status = 'misplaced'; // Word exists, but the sequence is wrong.
                // Do NOT increment userIndex; keep the user pointer here to see if it matches the NEXT actual word.
            } else {
                status = 'sequence_error'; // User word doesn't match and the actual word wasn't found shortly after.
                // Do NOT increment userIndex; keep the user pointer here.
            }

        } else {
            status = 'missed'; // User ran out of words for the rest of the actual verse.
            // Do NOT increment userIndex.
        }
        
        // Push the result for the current word from the actual verse.
        sequentialReport.push({ word: actualWord, status: status }); 
    }

    // 4. Return the combined result object
    return {
        missedWords: missedWords, // The list of words statistically missed (based on count).
        sequentialReport: sequentialReport // The word-by-word status (for visual sequence checking).
    };
}

export { compareVerses };