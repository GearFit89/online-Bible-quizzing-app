export const DragDropArea = ({ correctVerse }) => {
    // "Bank" is the source container, "Dropped" is the answer container
    const [bankWords, setBankWords] = useState([]);
    const [droppedWords, setDroppedWords] = useState([]);

    // Initialize words on mount (similar to your shuffle logic)
    useEffect(() => {
        const words = correctVerse.split(' ').map((word, index) => ({
            id: `${index}-${word}`,
            text: word
        }));
        // Simple shuffle
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setBankWords(shuffled);
        setDroppedWords([]);
    }, [correctVerse]);

    const handleDragStart = (e, wordId, origin) => {
        e.dataTransfer.setData("wordId", wordId);
        e.dataTransfer.setData("origin", origin);
    };

    const handleDrop = (e, targetContainer) => {
        e.preventDefault();
        const wordId = e.dataTransfer.getData("wordId");
        const origin = e.dataTransfer.getData("origin");

        if (origin === targetContainer) return; // No change needed

        let wordObj;
        // Logic to move word from Bank -> Dropped or Dropped -> Bank
        if (origin === 'bank') {
            wordObj = bankWords.find(w => w.id === wordId);
            setBankWords(bankWords.filter(w => w.id !== wordId));
            setDroppedWords([...droppedWords, wordObj]);
        } else {
            wordObj = droppedWords.find(w => w.id === wordId);
            setDroppedWords(droppedWords.filter(w => w.id !== wordId));
            setBankWords([...bankWords, wordObj]);
        }
    };

    const allowDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drop-valid');
    };

    return (
        <>
             {/* The Answer Zone */}
            <div 
                id="versedrop" 
                className="drag-zone draggable-container blueborder"
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, 'dropped')}
                style={{ minHeight: '50px' }}
            >
                {droppedWords.map(word => (
                    <button
                        key={word.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, word.id, 'dropped')}
                        className="draggable-block"
                    >
                        {word.text}
                    </button>
                ))}
            </div>

            {/* The Source/Bank Zone */}
            <div 
                id="verse-con" 
                className="draggable-container drag-zone blueborder"
                onDragOver={allowDrop}
                onDrop={(e) => handleDrop(e, 'bank')}
                style={{ marginTop: '10px' }}
            >
                {bankWords.map(word => (
                    <button
                        key={word.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, word.id, 'bank')}
                        className="draggable-block"
                    >
                        {word.text}
                    </button>
                ))}
            </div>
        </>
    );
};