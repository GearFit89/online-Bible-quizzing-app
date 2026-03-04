import React, { createContext, useState, useContext, useMemo } from 'react';  

const StreamContext = createContext();  

export const StreamProvider = ({ children }) => {  
    const [isInput, setIsInput] = useState(true);  
    const [stream, setStream] = useState([]);  
    const [charStream, setCharStream] = useState({ active: false, input: '' });  

    const value = useMemo(() => ({  
        isInput, setIsInput,  
        stream, setStream,  
        charStream, setCharStream  
    }), [isInput, stream, charStream]);  

    return (  
        <StreamContext.Provider value={value}>  
            {children}  
        </StreamContext.Provider>  
    ); 
};

export const useStream = () => {  
    const context = useContext(StreamContext);  
    if (!context) throw new Error('useStream must be used within StreamProvider');  
    return context;  
};
