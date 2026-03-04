
class TrigScriptProcessor {

    constructor(debugMode=true, type ,config='nothing') {
        this.debugLogs = [];
        this.errors ={}
        console.log(this.debugLogs) ///lilve array 
          this.id = (word) => {
              const defluatWord = {style: {display:'block'}, message: `Element with id "${word}" not found.`};
              let word1 = document.getElementById(word);
              if(!word1) {    console.error(`Element with id "${word}" not found.`); }
              return word1;
          };
          this.allQuestionsTrigs  = [];
      this. numVs = [1,2,3]
      this.chpsNums = new Set([])
      this.booksNums = new Set([])
      this.flights = ['A', "B", "C", "T"]
      
                          this.quotesSorted = {}
                          this.ftvsSorted = {};
  
        
            this.c = 0;
          this.running = true;
          this.genQuiz = false;
          const testIsGenQuiz = this.id('isGenQuiz');
          if (testIsGenQuiz) {
              this.genQuiz = true;
          }
         
          this.quizMonths = [
              ['october', ['1', '2', '3', '4', '5'], 'Matthew'], 
              ['november', ['6', '7', '8', '9'], 'Matthew'], 
              ['december', ['10', '11', '12'], 'Matthew'], 
              ['january', ['13', '14'], 'Matthew'], 
              ['february', ['15', '16'], 'Matthew'], 
              ['march', ['Jonah'], 'Jonah']
            ];
          this.selverses = true;
    
          
          
          this.STATE = 'local'
          this.URL = this.STATE === 'local' ? 'http://localhost:3000': 'render web';
  
          this.books = ['Matthew', 'Jonah']
         
          this.question_dict2 = [];
          this.verse_dict2 = [];
         
          this.trigChar = null;
          this.question_dict = [];
        
          this.questTypes = ['ftv', 'quote'];
          this.quizSettings = {};
          this.quiMonths = ['october', 'november', 'december', 'january', 'february', 'march'];
          this.selVerses = [];
          this.quoteRefArr = [];
           
         
          //move this line 
         
          
          this.numverses = 1;
          this.verse_dict = null;
         
          this.readyLoad = false;
         
          
          this.allChps =  this.quizMonths.map(month=>month[1].join(' ')).join(' ').split(' ')
          this.corspondAns = []; // Added missing property
          this.notriggers = []; // Added missing property
          
      }

    async loadQuestions(     ) {
        try {
            const questResponse = await fetch('QuestioniTBQN.txt');
            if (!questResponse.ok) {
                throw new Error(`Questions failed fetch ${questResponse.status}`);
            }
            const questionsText = await questResponse.text();
            this.delog('data from questions has been loaded as text', questionsText);
            const returnQ = await this.processQuestions(questionsText);
            this.delog(returnQ);
            return returnQ;
        } catch (error) {
            console.error('Failed loading Questions', error);
        }
    }


    async initializeQuiz() {
        let allQs = {};
     this. allQuestions = {};       
     
 
         try {
             this.question_dict = await this.loadQuestions();
             this.verse_dict = await this.loadQuotes();
             this.delog('Loaded question_dict:', this.question_dict);
             this.delog('Loaded verse_dict:', this.verse_dict);
             if (!this.verse_dict || !this.question_dict) {
                 console.error('Failed to load verse_dict. Exiting quiz initialization.');
                 return;
             }
             this.readyLoad = true;
         } catch (error) {
             console.error('Error initializing quiz:', error);
         }
 
          this. allQs = {...this.verse_dict, ...this.question_dict}
           allQs = {...this.verse_dict, ...this.question_dict}
         localStorage.setItem('allQuestions', JSON.stringify({allQs}));
         
         this.clientanswers = JSON.parse(localStorage.getItem('storedQs') || '{}')
       
         console.log('clientanswers initialized:', this.clientanswers);
         if(!this.clientanswers) console.error('run run run clinent ans not wold run ')
          
 
         const QUESTIONS = this.question_dict;
 
         const VERSES = this.verse_dict;
         for(const q of  Object.values(  this.allQs  )){
             const {monthsTrigs:trigs} ={op:'op'} ///await  this.setTrigForAllMonths(q);
               if(q.aq) q.aq = null;
            const   [question, answer] = q.verse.includes('?') ?  q.verse.split('?'): ['ftv/quote', q.verse]
              this. allQuestions[q.id] = ( {...q, trigs, answer, question})
     
          }   
         const DATA  = {...this.clientanswers, ...this.allQuestions}
     return { allQs, QUESTIONS, VERSES, DATA }
     }
    async loadQuotes() {
        try {
            // Fetch the quotes_ftvs.txt file
            const response = await fetch('./quotes_ftvs.txt'); // Adjust the path if necessary
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Get the text content of the file
            const data = await response.text();
            //this.delog('Fetched data:', data); // Debugging log
            
            // Process the fetched data
            const returnq = await this.processQuotes(data);
            return returnq;
        } catch (error) {
            console.error('Error loading quotes:', error);
        }
    }
    hightestMonth(inMonths){
        const higestmoth =  this.quiMonths.indexOf(inMonths[inMonths.length -1]);
        const figureMonths = this.quiMonths.slice(0, higestmoth + 1);
        //this.delog(allMpnthsCurrent)
        const chps = this.quizMonths.map(Month=> {
         if(figureMonths.includes(Month[0])) return Month[1].join(' ')} ).join(' ').split(' ');
        
        return {figureMonths, chps};
     
     
     }
         fliterOutQs(inquestions=this.selVerses, ob={}){
             const allmoths = this.quizMonths.map(month=>month[0])
             const allchps  = this.quizMonths.map(month=>month[1].join(' ')).join(' ').split(' ')
             const allflights = ['A', 'B', 'C', 'T']
             const alltypes = ['quote', 'ftv', 'SQ:', 'According to', 'question', 'ftv/quote']
             const months = ob.m ? ob.m : allmoths;
         
             const {chps} = this.hightestMonth(months)
             const flights = ob.f ? ob.f : allflights;
             const types = ob.t ? ob.t : alltypes;
             this.delog( 'next', months, chps, flights, types)
             const reslult = inquestions.filter(Verse=>{
                 let Test = months.includes(Verse.month) && flights.includes(Verse.flight) && types.includes(Verse.type) && Verse.verse && chps.includes(Verse.chapter);
                 
                 return Test
             })
             this.delog(reslult, 'result')
             return reslult;
     
     
         }
    async loadCompleteQuestionDict(){
        console.log(this.ftvsSorted)
       const { allQs } =  JSON.parse(localStorage.getItem('allQuestions') || JSON.stringify(await this.initializeQuiz()))  
       const allContent = {...allQs, ...this.clientanswers }
       console.warn('allContent', allContent, allQs, this.clientanswers)   
       let  allQuestions = []
      for(const q of  Object.values(  allContent )){
        const {monthsTrigs:trigs} = await  this.setTrigForAllMonths(q);
        console.warn('trigs', trigs, q)
          if(q.aq) q.aq = null;
       const   [question, answer] = q.verse.includes('?') ?  q.verse.split('?'): ['ftv/quote', q.verse]
          allQuestions.push( {...q, trigs, answer, question})

     }
     console.warn('allQuestions', allQuestions)
     localStorage.setItem('allQuestions', JSON.stringify({allQuestions}))
     return allQuestions
    }
    async setTrigForAllMonths(verse, dict=false){
        await new Promise(resolve => setTimeout(resolve, 0));
        if(typeof verse !== 'object') {
            verse = this.allQs[verse]
        }
        const mockQuestions = [
            { ref: "Matthew 11:07-08", id: 1, verse: "Where, did Jesus ask, did the crowds go out to see a man dressed in soft clothing? The wilderness?", month: "october" },
            { ref: "Matthew 11:08", id: 2, verse: "Where are those who wear soft clothing? In kings' houses", month: "november" },
            { ref: "Matthew 11:09", id: 3, verse: "Who is more than a prophet? John (John the Baptist)", month: "december" },
            { ref: "Matthew 11:09", id: 4, verse: "About whom did Jesus say, 'Yes, I tell you, and more than a prophet'? John (John the Baptist)", month: "january" },
            { ref: "Matthew 11:10", id: 5, verse: "Who will I send before your face? My messenger", month: "february" },
            { ref: "Matthew 11:10", id: 6, verse: "What will my messenger prepare before you? Your way", month: "march" },
            { ref: "Matthew 11:11", id: 7, verse: "Who is greater than John the Baptist? The one who is least in the kingdom", month: "october" },
            { ref: "Matthew 11:11", id: 8, verse: "Than whom is no one greater among those born of women? John the Baptist", month: "november" },
            { ref: "Matthew 11:12", id: 9, verse: "When has the kingdom of heaven suffered violence? The days of John the Baptist until now", month: "december" },
            { ref: "Matthew 11:12", id: 10, verse: "What has the kingdom of heaven suffered from the days of John the Baptist until now? Violence", month: "january" },
            { ref: "Matthew 11:12", id: 11, verse: "By what do the violent take it? Force", month: "february" }
        ];
        this.notriggers = [];
        let htmlArr = verse.verse.split(' ');
        try{
     await this.loadVerseDicts(false)
        }catch(e){    console.error('error loading verse dicts', e)}
        let monthsTrigs = {}
        let arr_of_question = ( verse.verse.includes('?') ? verse.verse.split('?')[0] : verse.verse).split(' ')
      
        let allMonthsV =  this.quizMonths.map(m=>m[0])
        const MonthIndex =  allMonthsV.findIndex(v=> v === verse.month);
       const allMonths = allMonthsV.filter(m=>allMonthsV.slice(MonthIndex,).includes(m))
       //console.warn(allMonthsV, MonthIndex, allMonths, 1259, verse.month, verse)
       let list = dict;
       
       if(!dict) { list =   verse.type ==='ftv/quote' ?   this.ftvsSorted[verse.numVerses]:  Object.values(this.question_dict) }
        if(!list ) list = mockQuestions;
        let  trigs = [];
        let  test = []
        let uniqueWordNum = -2;
        let uniqueChar = -2;
        let qsForM = [];
        let uinqueWord = 'nothing'
       // console.log(list, this.ftvsSorted, 'list')
        //console.log('htmlArr', htmlArr)
        for (let i = 0; i < allMonths.length; i++) {
            const monthName = allMonths[i];
           const monthSel = allMonthsV.slice(0, i+1+MonthIndex) //set the months for each loop
         qsForM = list.filter(q=>monthSel.includes(q.month ))
         ///console.warn('all', monthSel, monthName, qsForM, htmlArr, arr_of_question, uniqueWordNum,uinqueWord)     
             if(!qsForM) console.error('bad abd bad abd abd qsforrrrrrrrrrrrr ms ')
        const   unique = await this.findUniqueTriggerWord(arr_of_question, qsForM, '', monthName)
    uniqueWordNum = unique.uniqueWordNum;
     uniqueChar = unique.uniquecharNum;
          uinqueWord =  arr_of_question[uniqueWordNum]
          htmlArr[uniqueWordNum] = `<span class="${monthName}">${uinqueWord}</span>`;
//console.warn( unique || 'hi')
            const trigVaule =  [uniqueWordNum, uniqueChar];
            if(verse.type ==='ftv/quote'){ 
                const { uniquecharNum:charTrig} = await this.findUniqueTriggerWord(verse.ref.split(' '), qsForM.map(q=>q.ref), monthName)
                trigVaule.push(charTrig)}
            monthsTrigs[monthName] = trigVaule;
            trigs.push({month: monthName, htmlArr: htmlArr,  id: verse.id, trigNum:uniqueWordNum, word:uinqueWord, question:verse})
            test.push({month: monthName, htmlArr: htmlArr, verse: verse.verse, id: verse.id, t:uniqueWordNum})
           
        }
        this.allQuestionsTrigs.push({trigs:trigs, id: verse.id} )

         const  htmlToDisplay = htmlArr.join(' ').split('?')[0] + '?' || 'Error rendering content'

        return {test, trigs, htmlArr, uniqueWordNum, htmlToDisplay, monthsTrigs}
    }
async processQuestions(data) {
    const dataSplit = data.trim().split('\n');
    let questiondict = {};
    
    const regex = /^(\w+ \d+:\d+\w*\-?\d*) (\w) (?:(SQ:|According to) )?(.*)$/;
    
    for (let val of dataSplit) {
        const match = val.match(/^(\w+ \d+:\d+[\w\d-]*) (\w) (?:(SQ:|According to) )?(.*)$/);
        this.c += 1;
        // check if a match was found
        if (match) {
            
            //const monthIndex = Math.floor((c - 1) / 20);
            let monthName;
            const ref1 = match[1];
            let splitref = ref1.split(' ');
            let book = splitref[0];
            let chapter = splitref[1].split(':');
            
            chapter = chapter[0];
            //this prevents stuff like Jonah chapter 1 from getting mixed in with Mat chp 1
            chapter = ref1.includes('Jonah') ? 'Jonah': chapter;
            if (book === 'Matthew') {
                // Find the month array that contains the chapter number
                const foundMonthArray = this.quizMonths.find(month => {
                    // This is the corrected check: access the nested array (at index 1)
                    // and convert the chapter string to a number
                    return month[1].includes(chapter);
                });
                // If a month was found, assign its name (at index 0)
                if (foundMonthArray) {
                    monthName = foundMonthArray[0];
                }
            } else {
                monthName = 'march';
            }
            
            
            const flight1 = match[2];
            
            const typeQuestion = match[3];
            let type1; // declare type1 with a broader scope
            if (typeof (typeQuestion) != 'string') {
                type1 = 'question';
            } else {
                type1 = typeQuestion;
            }
            const questAns = match[4];
            let chp = ref1.split(' ')[1].split(':')[0];
            if(monthName === 'march') chp = 'Jonah';
            const book1 = ref1.split(' ')[0]
            this.chpsNums.add(chp)
            this.booksNums.add(book1)
            questiondict[this.c] = {
                flight: flight1,
                verse: questAns,
                ref: ref1,
                month: monthName,
                type: type1,
                chapter: chp,
                id:this.c,
                book:book1
            };
        }
    }
    
    
    this.delog('processed quotes', questiondict);
    return questiondict;
}

async processQuotes(quotesFTVs) {
    const data = quotesFTVs.trim().split("\n");
    let versedict = {};
    let c2 = 0;
    for (let val of data) {
        
        // simple macth method word, digit:digit , word, Quote/FTV word
        val = val.match(/^(\w+ \d+:\d+\w*\-?\d*) (\w) Quote\/FTV (.*)$/);
        //example regex for questions
        // val.match(/^(\w+ \d+:\d+\w*\-?\d*) (\w) (?:(SQ|According to (?:\w+ \d+:\d+\w*\-?\d*))) (.*)$/)
        
        c2++;
        this.c += 1;
        if (val) {
            
            // Now, we correctly assign the month based on the verse number
            const monthIndex = Math.floor((c2 - 1) / 20);
            const monthName = this.quiMonths[monthIndex];
            const ref1 = val[1];
            const flight1 = val[2];
            const verse1 = val[3];
            let  chp = ref1.split(' ')[1].split(':')[0]
            //this prevents stuff like Jonah chapter 1 from getting mixed in with Mat chp 1
            chp = ref1.includes('Jonah') ? 'Jonah': chp;
            if (ref1.includes('-')) {
                const verseParts = ref1.split(':');
                if (verseParts.length > 1) {
                    const rangeParts = verseParts[1].split('-');
                    if (rangeParts.length === 2) {
                        this.numverses = parseInt(rangeParts[1]) - parseInt(rangeParts[0]) + 1;
                    }
                }
            } else {
                this.numverses = 1;
            }
              if(monthName === 'march') chp = 'Jonah';
              const book1 = ref1.split(' ')[0]
              this.chpsNums.add(chp)
              this.booksNums.add(book1)
            versedict[this.c] = {
                flight: flight1,
                verse: verse1,
                ref: ref1,
                month: monthName,
                type: 'ftv/quote',
                numVerses: this.numverses,
                chapter: chp,
                id:this.c,
                book:book1,
            };
        }
    }
    this.delog('Processed verse_dict:', versedict); // Debugging log
    return versedict;
}
async findUniqueTriggerWord(ARRAY, _obj, currentVerseNumber = '', classwordname='highlightWord', classCHAR = false, stop=false) {
    if (!Array.isArray(ARRAY) || _obj === null) {
        console.error('Invalid input: ARRAY must be an array and _obj must be an object.');
        
    }
    let logForchar = []
let htmlToDisplay;
let notquote = true;

if(currentVerseNumber === 'F') notquote = false
    const currentFullVerse = ARRAY.join(' ');
let obj;
let vOfV;
let htmlArr;

    
     obj = _obj.filter(v => {
       
   if(v.verse){
    const Verse =  v.verse.includes('?') ? v.verse.split('?')[0] : v.verse;
    return this.stripChar(Verse) !== this.stripChar(currentFullVerse);
}else{
     
        //const Verse =  v.verse.includes('?') ? v.verse.split('?')[0] : v.verse;
         return v !== ARRAY.join(' ') ;
}
     });
     

if(obj.length === _obj.length) this.errors['filter Error']=  [obj, ARRAY];
    //this.delog('Filtered obj:', obj);
    //this.delog('Current full verse:', currentFullVerse);

    let uniqueWordNum = -1;
    let uniquecharNum = -1;
    let absoluteCharIndex = -1;
//this.delog(obj)
    for (let k = 0; k < ARRAY.length; k++) {
        const currentPrefix = this.stripChar(ARRAY.slice(0, k + 1).join(' '));
        //this.delog('Current prefix:', currentPrefix);

        const isSharedPrefix = obj.find(Verse => {
            let otherPrefix;
          if(!Verse.verse) {

                 otherPrefix = Verse.split(' ').slice(0, k + 1).join(' ') 
          }else{
             otherPrefix = Verse.verse.split(' ').slice(0, k + 1).join(' ') 
          }
            //this.delog('Other prefix:', otherPrefix, 'current', currentPrefix);
            return this.stripChar(otherPrefix) === currentPrefix;
        });
//this.delog(isSharedPrefix, 'sp')
        if (!isSharedPrefix) {
            
            uniqueWordNum = k;

            const uniqueWord = ARRAY[uniqueWordNum];
            //this.delog('uq', uniqueWord)
            //const lentoWordtoit =  < 0 ? ARRAY.slice(0, 1): ARRAY.slice(0, uniqueWordNum - 2)
            const wordLengthToUWord = this.stripChar(ARRAY.slice(0, uniqueWordNum).join(' ')).length + 1;
            //this.delog(lentoWordtoit)
            //this.delog(wordLengthToUWord)


            for (let j = 0; j < uniqueWord.length + 1; j++) {
                const char = this.stripChar(ARRAY.join(' ')).slice(0, j + wordLengthToUWord);
                //this.delog('Current char:', char);

                const isSharedChar = obj.find(Verse => {
                    let otherWordStripped;
                    if(Verse.verse) otherWordStripped = this.stripChar(Verse.verse); else otherWordStripped = this.stripChar(Verse)
                    logForchar.push('Other word stripped:', this.stripChar(otherWordStripped.slice(0, wordLengthToUWord + j)) , 'Current char:', char)
                    return this.stripChar(otherWordStripped.slice(0, wordLengthToUWord + j)) === char;
                });

                if (!isSharedChar) {

                    uniquecharNum = j;
                     let  offset = 0;
                      if (notquote && ARRAY[uniqueWordNum][0]) 
                        {offset = ARRAY[uniqueWordNum][0].includes('"') ? 1 :0;}
                      let Verse = [...ARRAY];
                     
                      Verse[uniqueWordNum] = `<span class=${classwordname}>${Verse[uniqueWordNum]}</span>`;
                       
                      
                      
                     
                      if(classCHAR) Verse[uniqueWordNum].split('')[j+offset] = `<span class=${classCHAR}>${Verse[uniqueWordNum][j+offset]}</span>`
                    if(stop)  Verse.splice(uniqueWordNum+1)
                     htmlArr=  [...Verse]
                       
                      Verse = Verse.join(' ') 
                      htmlToDisplay = `${Verse}`
                      const spaceoffset = ARRAY.slice(0, uniqueWordNum).length === 0 ? 0 :1;  
                    this.delog( ARRAY.slice(0, uniqueWordNum).join(' '), 'test')
                    absoluteCharIndex =  ARRAY.slice(0, uniqueWordNum).join(' ').length + j + offset + spaceoffset;
                    this.delog(ARRAY[uniqueWordNum], Verse, ARRAY, 'unique word ')
                    if(ARRAY[uniqueWordNum].includes(':') && notquote) absoluteCharIndex++;
                    
                    //ARRAY.join(' ')[absoluteCharIndex] === ' ' ? absoluteCharIndex++ : null;
                    uniquecharNum = absoluteCharIndex; 
                    break;
                }
            }
            this.delog(logForchar);
                    //this.delog(uniqueWordNum, uniquecharNum, 'unique stuff')
                    return { uniqueWordNum, uniquecharNum, htmlToDisplay, htmlArr, absoluteCharIndex};
                
            
        }
    }

    return { uniqueWordNum, uniquecharNum, absoluteCharIndex,htmlToDisplay, htmlArr};
}

async  loadVerseDicts(dict2=false) {
                        
    if (dict2)     {
const {figureMonths} = this.hightestMonth(this.quizSettings.months)
this.verse_dict2 = this.fliterOutQs(Object.values(this.verse_dict), {m: figureMonths, f: this.quizSettings.selectedFlights, t: ['ftv/quote']})

///  this.delog2('question_dict', '2');


this.question_dict2 = this.fliterOutQs(Object.values(this.verse_dict), {m: figureMonths, f: this.quizSettings.selectedFlights, t: ['question', 'According to', 'SQ:']})
    }
else{
this.verse_dict2 = Object.values(this.verse_dict).filter(Verse => Verse.type === 'ftv/quote');
this.question_dict2 = Object.values(this.verse_dict).filter(Verse => Verse.type === 'question' || Verse.type === 'According to' || Verse.type === 'SQ:');
}
this.  numVs.forEach(v=> { this.ftvsSorted[v] = this.verse_dict2.filter(verse=> verse.numVerses === v)})
///this.delog2(this.ftvsSorted, 'sorted quotes by num verses');

this.quoteRefArr = this.verse_dict2.map(Verse => Verse.ref);
this.quotesSorted = this.numVs.map(v=> this.ftvsSorted[v].map(ve=>ve.ref));
///this.delog2('all dicts', this.question_dict2, this.verse_dict2, this.quoteRefArr, Object.values(this.verse_dict, 'verse dicts'));
return { question_dict2: this.question_dict2, verse_dict2: this.verse_dict2, ftvsSorted: this.ftvsSorted, quotesSorted: this.quotesSorted};

}
stripChar(input, nums=false, messaa = 'errorr!!!' ) {
    // Define the set of characters to be stripped
    const charToStripArr = ['!', '/', ';', ':', '.', '"', "'", ',', '-', '(', ')', '?', ' ', '\n', '\r', '\t', '[', ']', '{', '}', '—', '–', '|'];
    if(nums) charToStripArr.push('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
    const charToStrip = new Set(charToStripArr);
    // Helper function to process a single string
    const processString = (str) => {messaa='no message'
        // Ensure the input is a string before proceeding
        if (typeof str !== 'string') {
            console.warn('stripChar received a non-string element in the array.', messaa);
            return ''; // Return an empty string for invalid elements
        }
        // Convert to lowercase, trim whitespace, and filter out unwanted characters
        return str.toLowerCase().trim().split('').filter(char => !charToStrip.has(char)).join('');
    };
    
    // Check if the input is an array
    if (Array.isArray(input)) {
        // If it's an array, use .map() to process each string element
        return input.map(str => processString(str));
    } else if (typeof input === 'string') {
        // If it's a single string, process it directly
        return processString(input);
    } else {
        // Handle cases where the input is neither a string nor an array
        console.warn('stripChar received an invalid input type. Expected a string or an array of strings.', messaa);
        return '';
    }
}
delog(...args) {
    //checks for debug mode 
    if(args){
    if (this.deblog) {
        //this.delog(...args);
     this.debugLogs.push(...args)
        
    }
}
}
delog2(...args) {
    //checks for debug mode 
    if(args){
    if (this.deblog) {
        //this.delog(...args);
     console.log(...args)
        
    }
}
}
}
export default TrigScriptProcessor