

import { QuizCompanion, Sockets, HtmlContentHandling, delog, startVoiceRecognition, setQuizSetings }  from "./main.js";
const debug =true
const mod = new HtmlContentHandling()
const app = new QuizCompanion();
app.initializeQuiz();  

const startButton = app.id('startQuizButton')

if(startButton){
startButton.addEventListener('click', async (event) => {
    event.preventDefault();
    const settings = setQuizSetings(app)
    //const clientAnswersLength = console.log.selVerses.length;
   app.startApp(settings);
})
}
console.log('this one caslues problems',); 
const testWss = new Sockets('ws://localhost:8080')
async function wsRun(params) {
    

//testWss.handleConnection()
let testWs;
//testWs = await testWss.asyncEmit('study', null);
console.log(testWs)
}
wsRun()
