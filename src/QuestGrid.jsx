import React, { createContext, useContext, useState } from 'react';
///import QuestDataCard from './QuestCard.jsx'

// --- 1. CONTEXT & STATE MANAGEMENT ---
const QuestionContext = createContext();

export const QuestionProvider = ({ children, inquestions, save }) => {
  const [questions, setQuestions] = useState(inquestions);

  const deleteQuest = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Bulk Delete
  const bulkDelete = (ids) => {
    setQuestions(prev => prev.filter(q => !ids.includes(q.id.toString()) && !ids.includes(q.id)));
  };

  const copyQuest = (id) => {
    const qToCopy = questions.find(q => q.id === id);
    if (qToCopy) {
      const newQ = { ...qToCopy, id: Date.now(), ref: `${qToCopy.ref}-copy` };
      // Note: navigator.clipboard.writeText expects a string
      navigator.clipboard.writeText(JSON.stringify(qToCopy, null, 2));
      alert("Question copied to clipboard!");
    }
  };

  function viewQuest (id){
    const q = questions.find(q => q.id === id);
    // Note: In a real app, you'd likely trigger a modal here rather than returning JSX
    console.log("Viewing:", q);
  }

  const saveToLocal = (id) => {
    const q = questions.find(q => q.id === id);
    const saved = JSON.parse(localStorage.getItem('saved_questions') || '[]');
    if (!saved.find(item => item.id === id)) {
      localStorage.setItem('saved_questions', JSON.stringify([...saved, q]));
      return true;
    }
    return false;
  };

  // Bulk Save
  const bulkSave = (ids) => {
    let count = 0;
    ids.forEach(id => {
      if(saveToLocal(Number(id))) count++;
    });
    alert(`Saved ${count} new questions to local storage.`);
  };

  return (
    <QuestionContext.Provider value={{ questions, deleteQuest, bulkDelete, copyQuest, saveToLocal, bulkSave, save, viewQuest }}>
      {children}
    </QuestionContext.Provider>
  );
};

const useQuestions = () => useContext(QuestionContext);

// --- 2. UI COMPONENT ---
const QuestGrid = ({ columns }) => {
  const { questions, deleteQuest, bulkDelete, copyQuest, saveToLocal, bulkSave, save, viewQuest } = useQuestions();
  const [selected, setSelected] = useState({});

  const defaultCols = {
    Select: '50px',
    Reference: '120px',
    Question: '1fr',
    Answer: '1fr',
    Actions: '180px',
  };

  const activeCols = columns || defaultCols;
  const gridTemplate = Object.values(activeCols).join(' ');

  // Get list of selected IDs
  const selectedIds = Object.keys(selected).filter(id => selected[id]);

  const styles = {
    wrapper: {
      padding: '20px',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#333',
      paddingBottom: '80px' // Space for floating bar
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      border: '1px solid #dfe3e8',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff'
    },
    header: {
      backgroundColor: 'blue',
      padding: '12px 15px',
      fontWeight: '600',
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      color: 'white',
      borderBottom: '2px solid #dfe3e8',
      display: 'flex',
      alignItems: 'center'
    },
    cell: {
      padding: '12px 15px',
      fontSize: '0.9rem',
      borderBottom: '1px solid #f1f1f1',
      display: 'flex',
      alignItems: 'center',
      minHeight: '50px'
    },
    btn: {
      padding: '6px 10px',
      marginRight: '6px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: '600',
      transition: 'all 0.2s'
    },
    actionBar: {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#212B36',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '50px',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      zIndex: 1000
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAll = (e) => {   
    const { checked } = e.target;
    const newSelected = {};
    if (checked) {
      questions.forEach(q => newSelected[q.id] = true);
    }
    setSelected(newSelected);
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={{ marginBottom: '15px' }}>Question Management</h2>
      <div style={styles.grid}>
        {/* Header Row */}
        {Object.keys(activeCols).map((col) => (
          <div key={col} style={styles.header}>
            {col === 'Select' ? <input type='checkbox' onChange={toggleSelectAll} /> : col}
          </div>
        ))}

        {/* Data Rows */}
        {questions.map((q) => (
          <React.Fragment key={q.id}>
            <div style={styles.cell}>
              <input 
                type="checkbox" 
                checked={!!selected[q.id]} 
                onChange={() => toggleSelect(q.id)} 
              />
            </div>
            <div style={{ ...styles.cell, fontWeight: '500', color: '#212B36' }}>{q.ref}</div>
            <div style={styles.cell}>{q.question}</div>
            <div style={styles.cell}>{q.answer}</div>
            <div style={styles.cell}>
              {save ? (
                <button 
                  style={{ ...styles.btn, backgroundColor: '#007bff', color: '#fff', border: 'none' }}
                  onClick={() => saveToLocal(q.id)}
                >Save</button>
              ) : (
                <button 
                  style={{ ...styles.btn, backgroundColor: '#fff', color: '#ff4d4f', borderColor: '#ff4d4f' }}
                  onClick={() => deleteQuest(q.id)}
                >Delete</button>
              )}
              <button 
                style={{ ...styles.btn, backgroundColor: '#f0f0f0' }}
                onClick={() => copyQuest(q.id)}
              >Copy</button>
              <button 
                style={{ ...styles.btn, backgroundColor: '#f0f0f0' }}
                onClick={() => viewQuest(q.id)}
              >View</button>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={styles.actionBar}>
          <span style={{ fontWeight: '600', marginRight: '10px' }}>
            {selectedIds.length} items selected
          </span>
          <button 
            style={{ ...styles.btn, backgroundColor: '#fff', color: '#333' }}
            onClick={() => {
              const text = questions
                .filter(q => selectedIds.includes(q.id.toString()))
                .map(q => `${q.ref}: ${q.question}`)
                .join('\n');
              navigator.clipboard.writeText(text);
              alert("Selected questions copied!");
            }}
          >Bulk Copy</button>
          
          {save && (
            <button 
              style={{ ...styles.btn, backgroundColor: '#007bff', color: '#fff', border: 'none' }}
              onClick={() => bulkSave(selectedIds)}
            >Bulk Save</button>
          )}
          
          <button 
            style={{ ...styles.btn, backgroundColor: '#ff4d4f', color: '#fff', border: 'none' }}
            onClick={() => {
              bulkDelete(selectedIds);
              setSelected({}); // Clear selection after delete
            }}
          >Bulk Delete</button>
          
          <button 
            style={{ ...styles.btn, backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff' }}
            onClick={() => setSelected({})}
          >Cancel</button>
        </div>
      )}
    </div>
  );
};

// --- 3. EXPORT WRAPPED COMPONENT ---
export default function Grid({questions, columns, save=true}) {
  return (
    <QuestionProvider inquestions={questions} save ={save}>
      <QuestGrid columns={columns} />
    </QuestionProvider>
  );
}