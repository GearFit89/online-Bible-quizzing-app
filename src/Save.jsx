import React from 'react';
import Grid from './QuestGrid.jsx';
function Save({results}){
    const saved = results || JSON.parse( localStorage.getItem('searchResults')) || []
    return (<div>
      <h2>Search Results Saved!</h2>
         <Grid questions={saved} />
     </div>
    )
  }
  export default Save;