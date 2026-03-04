// import React,   { useRef, useEffect, useContext,  useState, createContext }  from 'react' 
// // Import React hooks for state and side effects
// import Save from './Save.jsx';
// import  './style.css' // Import existing CSS styles
// ///import { QuizCompanion } from './main.js'; // Import the QuizCompanion class for data structures
// import Modal from './modal.jsx'; // Import the Modal wrapper component
// import Loading from './Loading.jsx'; // Import the Loading component for displaying a loading state

// import Grid from './QuestGrid.jsx';

 


// ////const [curScene, setScene]  =  useState(<Loading/>)
// const Quiz = new QuizCompanion(false, 'quiz');

// const filterContext = createContext();
// function Filter({setRs, Quiz, questions, }) {
//   // Define helper for keys that are not standard multi-select arrays
//   const others = ['sortBy', 'searchBy']; 
//   // Establish the initial state with all, de categories selected by default;
//   const {defaultFilterObj, setFilters, filters} = useContext(filterContext);
//    console.log('Filter component initialized with filters:', filters, 'obj', defaultFilterObj);
//   // Function to filter the data and update the parent result state
//   function applyFilters(currentFilters) { 
//     // Convert the questions object into an iterable array of values
//     let qs = Object.values(questions); 
//     // Apply the filtering logic to each question in the array
//     const filteredQs = qs.filter((q) => { 
//       // Verify if the question's month is included in the active filters
//       const matchMonth = currentFilters.month.includes(q.month); 
//       // Ensure the chapter of the question matches the selected filters
//       const matchChp = currentFilters.chp.includes(q.chp); 
//       // Check if the book name is present in the book filter array
//       const matchBook = currentFilters.book.includes(q.book); 
//       // Confirm the flight category is one of the checked options
//       const matchFlight = currentFilters.flight.includes(q.flight); 
//       // Determine if the verse count matches the specific radio selection
//       const matchNumVerses = currentFilters.numVerses.length === 0 || currentFilters.numVerses.includes(q.numVerses); 
//       // Return true only if the question meets every single criteria
//       return matchMonth && matchChp && matchBook && matchFlight && matchNumVerses; 
//     }); 
//     console.log('Filtered Questions:', filteredQs);
//     // Sort the filtered results alphabetically or by reference as chosen
//     const sortedQs = currentFilters.sortBy === 'Alphabet' ? Quiz.sortBy(filteredQs) : filteredQs; 
//     // Pass the filtered and sorted data back to the parent SearchBarScene
//     setRs(sortedQs); 
//   } 
//   // Handler for all input changes within the filter panel
//   function handleChangeFil({ target }) { 
//     // Extract properties from the event target for logic branching
//     const { name, id, checked, type, value } = target; 
//     // Update the local filter state based on user interaction
//     setFilters((prevFil) => { 
//       // Create a copy of the state to avoid direct mutations
//       let newState = { ...prevFil }; 
//       // Logic for handling radio button selections like 'sortBy'
//       if (type === 'radio') { 
//         // If the name is 'trig', update the specific trigger month field
//         if (name === 'trig') newState.trigMonth = id; 
//         // Otherwise, update the array with the single selected radio ID
//         else newState[name] = [id]; 
//       } 
//       // Logic for handling numeric inputs like the trigger word count
//       else if (type === 'number') { 
//         // Update the trigs object using the current trigger month as the key
//         newState.trigs = { ...prevFil.trigs, [prevFil.trigMonth]: Number(value) }; 
//       } 
//       // Logic for handling standard checkboxes (multi-select)
//       else if (type === 'checkbox') { 
//         // Add or remove the ID from the array based on checked status
//         newState[name] = checked 
//           ? [...prevFil[name], id] 
//           : prevFil[name].filter((item) => item !== id); 
//       } 
//       // Return the newly constructed state object to React
//       return newState; 
//     }); 
//   } 
//   // Define sorting options for the UI mapping
//   const sortByOptions = ['Alphabet', 'Reference', 'Relevance']; 
//   // Render the filter UI components
//   return ( 
//     <div className="filter-panel" onChange={handleChangeFil}> 
//       {/* Container for sort options */}
//       <div className="filter-section" > 
//         <h3 className="section-subtitle">Sort By</h3> 
//         <div className="filter-grid" > 
//           {sortByOptions.map((m) => ( 
//             <label key={m} className="filter-item"> 
//               <input id={m} name='sortBy' type="radio" checked={m === 'Reference'} /> 
//               <span className="filter-label-text">{m}</span> 
//             </label> 
//           ))} 
//         </div> 
//       </div> 
//       {/* Section for filtering by Month */}
//       <div className="filter-section">
//         <h3 className="section-subtitle">Months</h3>
//         <div className="filter-grid">
//           {defaultFilterObj.month.map((m) => (
//             <label key={m} className="filter-item">
//               <input id={m} name='month' type="checkbox" checked /> {/* Checkbox for each month */}
//               <span className="filter-label-text">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Section for filtering by Book */}
//       <div className="filter-section">
//         <h3 className="section-subtitle">Books</h3>
//         <div className="filter-grid">
//           {defaultFilterObj.book.map((b) => (
//             <label key={b} className="filter-item">
//               <input id={b} name='book' type="checkbox" checked /> {/* Checkbox for each book */}
//               <span className="filter-label-text">{b}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Section for filtering by Flight */}
//       <div className="filter-section">
//         <h3 className="section-subtitle">Flight</h3>
//         <div className="filter-grid">
//           {defaultFilterObj.flight.map((f) => (
//             <label key={f} className="filter-item">
//               <input id={f} name='flight' type="checkbox" checked /> {/* Checkbox for each flight */}
//               <span className="filter-label-text">Flight {f}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Section for filtering by Verse Count */}
//       <div className="filter-section">
//         <h3 className="section-subtitle">Number of Verses</h3>
//         <div className="filter-grid">
//           {defaultFilterObj.numVerses.map((v) => (
//             <label name='numVerses'key={v} className="filter-item">
//               <input id={v} type="radio" name="numVerses" /> {/* Radio buttons for unique verse counts */}
//               <span className="filter-label-text">{v} Verse(s)</span>
//             </label>
//           ))}
//         </div>
//       </div>
//       <div className="filter-section">
//         <h3 className="section-subtitle">Trigger Words </h3>
//         <div className="filter-grid">
//         <span  className='trigNum'>  Month of Trigger Word </span>
//           {defaultFilterObj.month.map((m) => (
//             <label key={m} className="filter-item">
//               <input id={m} name='trig' type="radio" checked={ m === 'october' ? true: false}/> {/* Checkbox for each month */}
//               <span className="filter-label-text">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
//             </label>
//           ))}
//         </div>
//         <div className="filter-grid">
            
//             <span  className='trigNum'>  Number of Word </span>
           
//               <input id={'num'} name='trig' type="number"  value={1} min={1} max={20}/> {/* Checkbox for each month */}
             
           
         
//         </div>
//       </div>

//       <div className="filter-actions"> 
//         <button onClick={() => applyFilters(filters)} className="button apply-btn"> 
//           Apply Filters 
//         </button> 
//       </div> 
//     </div> 
//   ); 
// }
// function SearchBar({questions, Quiz, results, setresults}) {
//   const firstTime = true
  
  
//   console.log('filters  initialized', defaultFilterObj);
//   // Initialize the local state for managing current filter selections
//   const [filters, setFilters] = useState(defaultFilterObj);
 
  
//   function handleClickSave(){
//     console.log("Search button clicked", results);
//     localStorage.setItem('results', JSON.stringify(results));
    

//   }
//   function handleClickGoToSave(){
//     console.log("Go to saved questions");
//   }

  
  
//   function handleSearch({target}){
//     console.log("Input changed:", target.value)
//     //const result =  ''
//     const results = Object.values(questions).filter( (q ) => {
//       return q.verse.toLowerCase().includes(target.value.toLowerCase()) ||
//              (q.answer && q.answer.toLowerCase().includes(target.value.toLowerCase())) ||
//              (q.ref && q.ref.toLowerCase().includes(target.value.toLowerCase())) || 
//               (q.question && q.question.toLowerCase().includes(target.value.toLowerCase()) )
//     })
//     console.log("Search results:", results);
//     let resultsSorted = results
//    const query =  target.value.toLowerCase()
//    const word = query.split(' ')[0];
//    let inresults = results;
//    switch(filters.sortBy){
//     case 'Alphabet':
//        resultsSorted = Quiz.sortBy(results)
//       break;
//     case 'Reference':
//        resultsSorted = results
//       break;
//     default:
//        resultsSorted = query.split(' ').map(w=>{
      
//       inresults =   inresults.map((q)=>({ score: q.score ? q.score + q.verse.split(' ').indexOf(w): q.verse.split(' ').indexOf(w)  , ...q}))

//        }).filter(q=> q.score !== -1 ).sort((a, b) => a.score - b.score)
//    }
//     setresults( (prevResults)=>  {
      
//     return resultsSorted
//     })
//   } 
  
// return (
//   <>
// <div> 
//   <filterContext.Provider value={{filters, setFilters, defaultFilterObj}}>
//   <input onChange={handleChange} type="text" placeholder="Search by Question, Answer, Referrence..." />
//   <button className='btn' onClick={handleClickSave}>Save All</button>
//   <button className='btn' onClick={handleClickGoToSave}>Saved Questions</button>
//   <button className='btn' onClick={handleSearch}>Saved Questions</button>
//   <Modal openText={'Filter'} >
//    <Filter setRs= {setresults} Quiz={Quiz} questions={questions} filterContext={filterContext} ></Filter>
//     </Modal>
//     </filterContext.Provider>
// </div>

// </>

// )
// }
 

// function SearchBarScene() {
//   // Boolean state to track if data is still loading
//   const [loading, setLoading] = useState(true); 
//   // State to hold the master list of questions
//   const [data, setData] = useState({ questions: {}, Quiz: null }); 
//   // State to hold what is currently displayed on screen
//   const [results, setresults] = useState([]); 

//   // Effect hook to load data on component mount
//   useEffect(() => {
//     // Async function to initialize data from the QuizCompanion
//     async function load() {
//       // Create new instance of QuizCompanion
//       const Quiz = new QuizCompanion(false, 'quiz'); 
//       // Await the data initialization
//       const { DATA: questions } = await Quiz.initializeQuiz(); 
//       // Store both Quiz and Questions in state
//       setData({ questions, Quiz }); 
//       // Set initial results to show everything
//       setresults(Object.values(questions)); 
//       // Turn off the loading spinner
//       setLoading(false); 
//     }
//     // Execute the load function
//     load(); 
//   }, []);

//   // Return loading screen if data isn't ready
//   if (loading) return <Loading />; 

//   return (
//     <>
//       {/* Render the SearchBar and pass necessary data as props */}
//       <SearchBar 
//         questions={data.questions} 
//         Quiz={data.Quiz} 
//         results={results}
//         setresults={setresults} 
//       />
//       {/* Map the filtered data into QuestCard components */}
//       <div className="searchContainer">
//        <Grid questions={results} ></Grid>
//       </div>
//     </>
//   );
// }
//     // Simulate data loading with a timeout
// export default SearchBarScene
