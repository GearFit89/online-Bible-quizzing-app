import React, { useState, useEffect, useRef, useMemo } from 'react';
import { wsClient, useConnection, CONNECTION_UI } from './connection.jsx';

// --- ICONS (SVG) ---
const Icons = {
    Console: () => <span>💻</span>,
    Network: () => <span>📡</span>,
    State: () => <span>📊</span>,
    Health: () => <span>❤️</span>,
    Bug: () => <span>🐞</span>,
    Expand: () => <span style={{fontSize:'0.8em'}}>▶</span>,
    Collapse: () => <span style={{fontSize:'0.8em'}}>▼</span>,
    Success: () => <span style={{color:'#4caf50'}}>✔</span>,
    Warn: () => <span style={{color:'#ff9800'}}>⚠</span>
};

// --- HELPER: JSON TREE VIEW ---
const JsonTree = ({ data, level = 0 }) => {
    const [expanded, setExpanded] = useState(level < 1); // Auto-expand top level
    
    if (data === null) return <span style={{color:'#777'}}>null</span>;
    if (data === undefined) return <span style={{color:'#777'}}>undefined</span>;
    
    if (typeof data !== 'object') {
        const color = typeof data === 'string' ? '#ce9178' : typeof data === 'number' ? '#b5cea8' : '#569cd6';
        return <span style={{color}}>{String(data)}</span>;
    }

    const isArray = Array.isArray(data);
    const keys = Object.keys(data);
    const isEmpty = keys.length === 0;

    return (
        <div style={{ marginLeft: level * 10, fontFamily: 'monospace' }}>
            <span 
                onClick={() => !isEmpty && setExpanded(!expanded)} 
                style={{ cursor: isEmpty ? 'default' : 'pointer', userSelect:'none', color:'#dcdcaa' }}
            >
                {isEmpty ? '' : (expanded ? <Icons.Collapse/> : <Icons.Expand/>)} 
                {isArray ? '[' : '{'}
                {!expanded && !isEmpty && <span style={{color:'#777'}}>...</span>}
            </span>
            
            {expanded && keys.map(key => (
                <div key={key} style={{ marginLeft: 15 }}>
                    <span style={{ color: '#9cdcfe' }}>{key}</span>: 
                    <JsonTree data={data[key]} level={level + 1} />
                </div>
            ))}
            
            <span style={{color:'#dcdcaa'}}>{isArray ? ']' : '}'}</span>
        </div>
    );
};

export default function DebugConsole() {
    const { serverstate } = useConnection();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('console'); 
    
    // --- DATA STATE ---
    const [logs, setLogs] = useState([]);
    const [detectedRoomId, setDetectedRoomId] = useState('');
    const [roomState, setRoomState] = useState({});
    const [usersMap, setUsersMap] = useState({}); // Key: UserID, Value: UserData
    const [quizState, setQuizState] = useState({});
    
    // --- HEALTH STATE ---
    const [latency, setLatency] = useState(null);
    const [lastPing, setLastPing] = useState(null);

    // --- INPUT STATE ---
    const [ isDevMode, setIsDevMode] = useState(false);
    const [customFunc, setCustomFunc] = useState('deldbConfigure Runtime Arguments');
    const [customPayload, setCustomPayload] = useState('{"type":"quiz", "requiredUsers":[]}');
    const [customArgs, setCustomArgs] = useState('[]');
    const [history, setHistory] = useState([]);
    
    const logsEndRef = useRef(null);

    // --- EFFECT: Load History ---
    useEffect(() => {
        const saved = localStorage.getItem('debugConsoleHistory');
        if (saved) setHistory(JSON.parse(saved));
        const handleKeyDown = (e) => { // Event handler function
            // Check if the Alt key is held AND the 'd' key is pressed
            if (e.altKey && e.code === 'KeyD') {
                e.preventDefault(); // Stop the browser from performing default Alt actions
                setIsDevMode(dm => !dm); // Toggle state
            }
        }; // End of handler

        window.addEventListener('keydown', handleKeyDown); // Add listener on mount

        return () => { // Cleanup function
            window.removeEventListener('keydown', handleKeyDown); // Remove listener on unmount
        }; // End of cleanup
        
    }, []);

    // --- EFFECT: Argument Auto-Fill Logic ---
    useEffect(() => {
        // Specifically for answerInvite: Default to [false, roomId]
        if (customFunc === 'answerInvite' && detectedRoomId) {
            setCustomArgs(JSON.stringify([false, detectedRoomId]));
        }
    }, [customFunc, detectedRoomId]);

    // --- EFFECT: Scroll Logs ---
    

    // --- EFFECT: Global Listener (The Brain) ---
    useEffect(() => {
        if (typeof wsClient.addGlobalListener === 'function') {
            const unsubscribe = wsClient.addGlobalListener((event) => {
                const raw = event.data;
                let parsed = null;

                try {
                    parsed = JSON.parse(raw);
                } catch (e) {
                    addLog('INCOMING', raw); // Log raw if parse fails
                    return;
                }

                // 1. Log the parsed message
                addLog('INCOMING', parsed);

                // 2. Analyze Payload
                if (parsed.payload) {
                    const { update, data, id } = parsed.payload;

                    // A. Detect Room ID from anywhere
                    if (id) setDetectedRoomId(id);
                    if (data?.id) setDetectedRoomId(data.id);
                    if (data?.roomId) setDetectedRoomId(data.roomId);

                    // B. Route Updates to State
                    if (update === 'users') {
                        setUsersMap(prev => {
                            // Merge logic: if data is a map of ID->User, merge it
                            // If it's a single update, patch it.
                            // Simplified merge:
                            return { ...prev, ...data };
                        });
                    } else if (update === 'quiz') {
                        setQuizState(prev => ({ ...prev, ...data }));
                    } else if (update === 'room' || data?.type === 'quiz') { // Heuristic for room data
                        setRoomState(prev => ({ ...prev, ...data }));
                    }
                }
                
                // 3. Handle Direct Success/Response
                if (parsed.responseToId) {
                    addLog('SUCCESS', `Request ${parsed.responseToId} completed.`);
                }
            });
            return () => unsubscribe();
        }
    }, []);

    // --- ACTIONS ---

    const addLog = (type, data) => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, data }]);
    };

    const handlePing = async () => {
        const start = Date.now();
        try {
            // Assuming 'study' is a safe, simple endpoint to ping
            await wsClient.emit('study', { ping: true });
            const end = Date.now();
            setLatency(end - start);
            setLastPing(new Date().toLocaleTimeString());
        } catch (e) {
            setLatency('ERR');
        }
    };

    const handleSend = async () => {
        let pLoad = {}, pArgs = [];
        try { pLoad = JSON.parse(customPayload); } catch { alert("Invalid Payload JSON"); return; }
        try { pArgs = JSON.parse(customArgs); } catch { alert("Invalid Args Array"); return; }

        // Save history
        const newEntry = { func: customFunc, payload: customPayload, args: customArgs, timestamp: Date.now() };
        const updatedHistory = [newEntry, ...history.filter(h => h.func !== customFunc)].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem('debugConsoleHistory', JSON.stringify(updatedHistory));

        addLog('OUTGOING', { func: customFunc, payload: pLoad, args: pArgs });

        try {
            const res = await wsClient.emit(customFunc, pLoad, ...pArgs);
            addLog('RESPONSE', res);
        } catch (err) {
            addLog('ERROR', String(err));
        }
    };

    const loadFromHistory = (entry) => {
        setCustomFunc(entry.func);
        setCustomPayload(entry.payload);
        setCustomArgs(entry.args);
    };

    // --- UI HELPERS ---
    const currentStateUI = CONNECTION_UI[serverstate] || { label: 'Unknown', color: '#999' };
    const uniqueUserCount = Object.keys(usersMap).length;
    if(!isDevMode) return null;
    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} style={styles.openBtn}>
                <Icons.Bug /> Debug ({uniqueUserCount})
            </button>
        );
    }

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.headerInfo}>
                    <span style={{ color: currentStateUI.color, fontWeight:'bold' }}>● {currentStateUI.label}</span>
                    <span style={styles.roomBadge}>Room: {detectedRoomId || 'Scanning...'}</span>
                </div>
                <div style={styles.tabs}>
                    {['console', 'network', 'state', 'health'].map(tab => (
                        <button 
                            key={tab}
                            style={activeTab === tab ? styles.tabActive : styles.tab} 
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'console' && <Icons.Console/>}
                            {tab === 'network' && <Icons.Network/>}
                            {tab === 'state' && <Icons.State/>}
                            {tab === 'health' && <Icons.Health/>}
                            <span style={{marginLeft:4, textTransform:'capitalize'}}>{tab}</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>×</button>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
                
                {/* === TAB: CONSOLE === */}
                {activeTab === 'console' && (
                    <div style={styles.paneContainer}>
                        <div style={styles.sidebar}>
                             <div style={styles.sectionLabel}>History</div>
                             <div style={styles.historyList}>
                                {history.map((h, i) => (
                                    <div key={i} onClick={() => loadFromHistory(h)} style={styles.historyItem}>
                                        {h.func}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={styles.mainPanel}>
                            <div style={styles.inputRow}>
                                <input value={customFunc} onChange={e => setCustomFunc(e.target.value)} style={{...styles.input, flex:1}} placeholder="Function Name" />
                                <input value={customArgs} onChange={e => setCustomArgs(e.target.value)} style={{...styles.input, flex:2}} placeholder="Args [ ]" />
                            </div>
                            <textarea value={customPayload} onChange={e => setCustomPayload(e.target.value)} style={styles.textarea} placeholder="Payload { }" />
                            <div style={styles.btnRow}>
                                <button onClick={handleSend} style={styles.sendBtn}>Execute Request</button>
                                <button onClick={() => setLogs([])} style={styles.clearBtn}>Clear Output</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB: NETWORK (LOGS) === */}
                {activeTab === 'network' && (
                    <div style={styles.logWindow}>
                        {logs.length === 0 && <div style={{padding:20, color:'#666'}}>No traffic recorded.</div>}
                        {logs.map((l, i) => (
                            <div key={i} style={{ ...styles.logItem, borderLeft: `3px solid ${getColor(l.type)}` }}>
                                <div style={styles.logMeta}>
                                    <span style={styles.time}>{l.time}</span>
                                    <span style={{ color: getColor(l.type), fontWeight: 'bold' }}>{l.type}</span>
                                </div>
                                <div style={styles.logData}>
                                    {/* Use JSON Tree for Object data */}
                                    <JsonTree data={l.data} /> 
                                </div>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}

                {/* === TAB: STATE (DATA VIEWERS) === */}
                {activeTab === 'state' && (
                    <div style={styles.paneContainer}>
                        <div style={{...styles.sidebar, width:'30%'}}>
                            <div style={styles.sectionLabel}>Detected Keys</div>
                            <div style={styles.kvItem}>
                                <span>RoomID</span>
                                <span style={{color:'#ce9178'}}>{detectedRoomId || 'N/A'}</span>
                            </div>
                             <div style={styles.kvItem}>
                                <span>Users</span>
                                <span style={{color:'#b5cea8'}}>{uniqueUserCount}</span>
                            </div>
                        </div>
                        <div style={{...styles.mainPanel, overflowY:'auto'}}>
                            
                            <div style={styles.jsonSection}>
                                <div style={styles.sectionHeader}><Icons.State/> Room State (Quiz)</div>
                                <div style={styles.jsonBox}><JsonTree data={quizState} /></div>
                            </div>

                            <div style={styles.jsonSection}>
                                <div style={styles.sectionHeader}><Icons.Network/> Users Map</div>
                                <div style={styles.jsonBox}><JsonTree data={usersMap} /></div>
                            </div>

                            <div style={styles.jsonSection}>
                                <div style={styles.sectionHeader}>📋 Generic Room Data</div>
                                <div style={styles.jsonBox}><JsonTree data={roomState} /></div>
                            </div>

                        </div>
                    </div>
                )}

                {/* === TAB: HEALTH === */}
                {activeTab === 'health' && (
                    <div style={{padding:20, display:'flex', flexDirection:'column', gap:20}}>
                        <div style={styles.healthCard}>
                            <h3>Connection Health</h3>
                            <div style={{display:'flex', gap:10, alignItems:'center', marginTop:10}}>
                                <button onClick={handlePing} style={styles.pingBtn}>Measure Latency</button>
                                {latency !== null && (
                                    <span style={{fontSize:'1.2em', color: latency < 100 ? '#4caf50' : '#f44336'}}>
                                        {latency} ms
                                    </span>
                                )}
                            </div>
                            <p style={{color:'#888', fontSize:'0.9em'}}>Last Ping: {lastPing || 'Never'}</p>
                        </div>
                        
                        <div style={styles.healthCard}>
                            <h3>Diagnostics</h3>
                            <ul style={{paddingLeft:20, color:'#ccc', lineHeight:'1.6em'}}>
                                <li><strong>Socket ID:</strong> {wsClient.socket?.id || 'Unknown'}</li>
                                <li><strong>Global Listeners:</strong> {wsClient.globalListeners?.size || 0} active</li>
                                <li><strong>Buffer:</strong> {wsClient.clientWs?.bufferedAmount || 0} bytes</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- UTILS ---
const getColor = (t) => ({ 
    INCOMING: '#4facfe', 
    OUTGOING: '#ffa500', 
    RESPONSE: '#00f260', 
    ERROR: '#ff5858', 
    SUCCESS: '#00f260' 
}[t] || '#fff');

const styles = {
    openBtn: { position: 'fixed', bottom: 10, right: 10, zIndex: 9999, padding: '10px 15px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems:'center', boxShadow:'0 4px 12px rgba(0,0,0,0.3)' },
    container: { position: 'fixed', bottom: 0, right: 0, width: '650px', height: '650px', background: '#1e1e1e', color: '#eee', display: 'flex', flexDirection: 'column', boxShadow: '-5px -5px 25px rgba(0,0,0,0.6)', zIndex: 10000, fontFamily: 'monospace' },
    
    header: { padding: '8px 12px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerInfo: { display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' },
    roomBadge: { fontSize: '0.75rem', color: '#aaa', background:'#333', padding:'1px 4px', borderRadius:3 },
    
    tabs: { display: 'flex', gap: '2px', background:'#111', padding:2, borderRadius:4 },
    tab: { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '6px 12px', display:'flex', alignItems:'center', fontSize:'0.85em', borderRadius:4 },
    tabActive: { background: '#333', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', display:'flex', alignItems:'center', fontSize:'0.85em', borderRadius:4 },
    closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', padding:'0 5px' },
    
    content: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background:'#1e1e1e' },
    paneContainer: { display: 'flex', flex: 1, height: '100%' },
    sidebar: { width: '25%', borderRight: '1px solid #333', padding: '10px', background: '#181818', overflowY:'auto' },
    mainPanel: { flex: 1, padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#1e1e1e' },
    
    inputRow: { display: 'flex', gap: '10px' },
    input: { background: '#2d2d2d', border: '1px solid #3e3e3e', color: '#fff', padding: '8px', borderRadius:4 },
    textarea: { background: '#2d2d2d', border: '1px solid #3e3e3e', color: '#fff', padding: '8px', height: '80px', resize: 'vertical', borderRadius:4, fontFamily:'monospace' },
    btnRow: { display: 'flex', gap: '10px' },
    sendBtn: { flex: 2, background: '#0e639c', color: '#fff', border: 'none', padding: '10px', cursor: 'pointer', borderRadius:4, fontWeight:'bold' },
    clearBtn: { flex: 1, background: '#333', color: '#ccc', border: '1px solid #444', padding: '10px', cursor: 'pointer', borderRadius:4 },
    
    historyList: { display: 'flex', flexDirection:'column', gap: '4px' },
    historyItem: { fontSize: '0.75rem', padding: '6px', background: '#252526', borderRadius: '3px', cursor: 'pointer', color: '#ccc', border:'1px solid #333', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
    sectionLabel: { fontSize:'0.75em', textTransform:'uppercase', color:'#666', marginBottom:8, letterSpacing:1 },
    
    logWindow: { flex: 1, padding: '10px', overflowY: 'auto', background: '#1e1e1e' },
    logItem: { marginBottom: '8px', padding: '8px', background:'#252526', borderRadius:4 },
    logMeta: { display:'flex', justifyContent:'space-between', fontSize:'0.75em', marginBottom:4, borderBottom:'1px solid #333', paddingBottom:4 },
    logData: { fontSize: '0.85em', overflowX:'auto' },
    time: { color: '#666' },

    jsonSection: { marginBottom:20 },
    sectionHeader: { fontSize:'0.9em', fontWeight:'bold', color:'#ccc', marginBottom:5, display:'flex', alignItems:'center', gap:6 },
    jsonBox: { background:'#111', padding:10, borderRadius:4, border:'1px solid #333' },
    kvItem: { display:'flex', justifyContent:'space-between', fontSize:'0.85em', borderBottom:'1px solid #333', padding:'4px 0' },

    healthCard: { background:'#252526', padding:15, borderRadius:6, border:'1px solid #333' },
    pingBtn: { background:'#333', border:'1px solid #555', color:'#fff', padding:'6px 12px', borderRadius:4, cursor:'pointer' }
};


// --- Sub-Component: JSON Editor with Validation ---
const JsonEditor = ({ value, onChange, label }) => {
    const [isValid, setIsValid] = useState(true);

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val);
        try {
            if (val.trim() !== '') JSON.parse(val);
            setIsValid(true);
        } catch (err) {
            setIsValid(false);
        }
    };

    const handlePrettify = () => {
        try {
            const parsed = JSON.parse(value);
            onChange(JSON.stringify(parsed, null, 2));
            setIsValid(true);
        } catch (e) {
            // Do nothing if invalid
        }
    };

    return (
        <div style={styles.inputGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ color: '#aaa', fontSize: '0.8em' }}>{label}</label>
                <button onClick={handlePrettify} style={styles.tinyBtn}>Prettify</button>
            </div>
            <textarea
                value={value}
                onChange={handleChange}
                style={{
                    ...styles.textarea,
                    borderColor: isValid ? '#444' : '#ff4444',
                    outline: isValid ? 'none' : '1px solid #ff4444'
                }}
                spellCheck="false"
            />
            {!isValid && <span style={{ color: '#ff4444', fontSize: '0.7em' }}>Invalid JSON</span>}
        </div>
    );
};

// --- Sub-Component: Quiz Data Monitor ---
const QuizMonitor = ({ logs, sendJson }) => {
    const [userStates, setUserStates] = useState({});

    // Process logs to find latest user states
    useEffect(() => {
        const newStates = { ...userStates };
        let hasChanges = false;

        logs.forEach(log => {
            if (log.payload?.update === 'users' && log.payload?.data) {
                // Iterate over keys (usernames) in the data object
                Object.entries(log.payload.data).forEach(([key, val]) => {
                    // Check if this is a user status update (contains 'status' key)
                    if (val && typeof val === 'object' && val.status) {
                        newStates[key] = val.status;
                        hasChanges = true;
                    }
                });
            }
        });

        if (hasChanges) setUserStates(newStates);
    }, [logs]);

    // Filter for Quiz Flow Logs (Questions and Quiz Status)
    const quizLogs = useMemo(() => {
        return logs.filter(l => 
            l.payload?.update === 'quiz' || 
            (l.payload?.update === 'users' && l.payload?.data?.question) ||
            (l.payload?.update === 'users' && Object.keys(l.payload?.data || {}).some(k => k.includes('quiz')))
        );
    }, [logs]);

    const handleJump = () => {
        sendJson('gameAction', { action: 'jump', time: Date.now() });
    };

    const handleRecordAnswer = () => {
        // Example payload, adjust as needed
        const answer = prompt("Enter answer to record:");
        if(answer) sendJson('recordAnswer', { answer: answer, time: Date.now() });
    };

    return (
        <div style={styles.splitView}>
            {/* Left: Filtered Log Feed */}
            <div style={styles.halfPane}>
                <h4 style={styles.header}>Quiz Feed</h4>
                <div style={styles.logStream}>
                    {quizLogs.map((log, i) => (
                        <div key={i} style={styles.logEntry}>
                            <span style={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            {log.payload?.data?.question ? (
                                <span style={{color: '#4caf50'}}> Char: "{log.payload.data.question.char}"</span>
                            ) : (
                                <span style={{color: '#ce9178'}}> {JSON.stringify(log.payload)}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div style={styles.buttonRow}>
                    <button style={styles.actionBtn} onClick={handleJump}>⚡ Jump</button>
                    <button style={styles.actionBtn} onClick={handleRecordAnswer}>📝 Record Answer</button>
                </div>
            </div>

            {/* Right: User State Table */}
            <div style={styles.halfPane}>
                <h4 style={styles.header}>User States</h4>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(userStates).length === 0 ? (
                            <tr><td colSpan="2" style={styles.td}>No user data yet...</td></tr>
                        ) : (
                            Object.entries(userStates).map(([user, status]) => (
                                <tr key={user}>
                                    <td style={styles.td}>{user}</td>
                                    <td style={{...styles.td, color: status === 'viewing' ? '#aaa' : '#4caf50'}}>
                                        {status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Main Component ---
export  function DebugConsole2() {
    const { serverstate } = useConnection();
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('quiz'); // 'console', 'quiz', 'caller'

    // Command Center State
    const [funcName, setFuncName] = useState('testFunction');
    const [payloadJson, setPayloadJson] = useState('{}');
    const [argsJson, setArgsJson] = useState('[]');

    const logsEndRef = useRef(null);

    // Global Listener
    useEffect(() => {
        if (typeof wsClient.addGlobalListener === 'function') {
            const unsubscribe = wsClient.addGlobalListener((msg) => {
                setLogs(prev => [...prev.slice(-199), { timestamp: Date.now(), ...msg }]);
            });
            return () => unsubscribe();
        }
    }, []);

    // Scroll to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs, activeTab]);

    const handleSend = () => {
        try {
            const payload = JSON.parse(payloadJson);
            const args = JSON.parse(argsJson);
            wsClient.send(funcName, payload, ...args);
        } catch (e) {
            alert("Invalid JSON in Payload or Args");
        }
    };

    const loadTemplate = (name) => {
        switch(name) {
            case 'start':
                setFuncName('startQuiz');
                setPayloadJson(JSON.stringify({ roomId: 'ROOM_ID_HERE' }, null, 2));
                setArgsJson('[]');
                break;
            case 'reset':
                setFuncName('resetRoom');
                setPayloadJson(JSON.stringify({ roomId: 'ROOM_ID_HERE' }, null, 2));
                setArgsJson('[]');
                break;
            default: break;
        }
    };

    return (
        <div style={styles.container}>
            {/* Tab Navigation */}
            <div style={styles.tabBar}>
                <button style={activeTab === 'console' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('console')}>Raw Logs</button>
                <button style={activeTab === 'quiz' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('quiz')}>Quiz Monitor</button>
                <button style={activeTab === 'caller' ? styles.activeTab : styles.tab} onClick={() => setActiveTab('caller')}>Command Center</button>
            </div>

            {/* Content Area */}
            <div style={styles.content}>
                
                {/* 1. RAW LOGS TAB */}
                {activeTab === 'console' && (
                    <div style={styles.logStream}>
                        {logs.map((log, i) => (
                            <div key={i} style={styles.logEntry}>
                                <span style={styles.timestamp}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span style={styles.json}>{JSON.stringify(log.payload)}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                )}

                {/* 2. QUIZ MONITOR TAB */}
                {activeTab === 'quiz' && (
                    <QuizMonitor logs={logs} sendJson={(fn, data) => wsClient.send(fn, data)} />
                )}

                {/* 3. COMMAND CENTER TAB */}
                {activeTab === 'caller' && (
                    <div style={{...styles.splitView, flexDirection: 'column'}}>
                        <div style={styles.toolbar}>
                            <span style={{color:'#aaa', fontSize:'0.8em'}}>Templates:</span>
                            <button style={styles.tinyBtn} onClick={() => loadTemplate('start')}>Start Quiz</button>
                            <button style={styles.tinyBtn} onClick={() => loadTemplate('reset')}>Reset Room</button>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={{ color: '#aaa', fontSize: '0.8em' }}>Function Name</label>
                            <input 
                                style={styles.input} 
                                value={funcName} 
                                onChange={(e) => setFuncName(e.target.value)} 
                            />
                        </div>

                        <JsonEditor label="Payload (JSON Object)" value={payloadJson} onChange={setPayloadJson} />
                        <JsonEditor label="Additional Args (JSON Array)" value={argsJson} onChange={setArgsJson} />

                        <button style={styles.sendBtn} onClick={handleSend}>Execute Function</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Styles
const styles2 = {
    container: {
        display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1e1e1e', fontFamily: 'monospace', color: '#d4d4d4'
    },
    tabBar: {
        display: 'flex', borderBottom: '1px solid #333', backgroundColor: '#252526'
    },
    tab: {
        padding: '10px 20px', background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer'
    },
    activeTab: {
        padding: '10px 20px', background: '#1e1e1e', border: 'none', color: '#fff', borderTop: '2px solid #007acc'
    },
    content: {
        flex: 1, overflow: 'hidden', padding: '10px', display: 'flex', flexDirection: 'column'
    },
    splitView: {
        display: 'flex', flex: 1, gap: '10px', height: '100%'
    },
    halfPane: {
        flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #333', borderRadius: '4px', padding: '10px', backgroundColor: '#252526'
    },
    logStream: {
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'Consolas, monospace'
    },
    logEntry: {
        fontSize: '12px', borderBottom: '1px solid #333', padding: '2px 0'
    },
    timestamp: {
        color: '#569cd6', marginRight: '8px'
    },
    json: {
        color: '#ce9178', wordBreak: 'break-all'
    },
    inputGroup: {
        marginBottom: '10px', display: 'flex', flexDirection: 'column'
    },
    input: {
        backgroundColor: '#3c3c3c', border: '1px solid #333', color: '#fff', padding: '8px', fontFamily: 'monospace'
    },
    textarea: {
        backgroundColor: '#3c3c3c', border: '1px solid #333', color: '#ce9178', padding: '8px', fontFamily: 'monospace', minHeight: '100px', resize: 'vertical'
    },
    sendBtn: {
        backgroundColor: '#0e639c', color: 'white', border: 'none', padding: '12px', cursor: 'pointer', marginTop: 'auto'
    },
    tinyBtn: {
        backgroundColor: '#444', color: '#ccc', border: 'none', padding: '2px 8px', fontSize: '10px', cursor: 'pointer', borderRadius: '2px', marginLeft: '5px'
    },
    toolbar: {
        display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center'
    },
    table: {
        width: '100%', borderCollapse: 'collapse', fontSize: '12px'
    },
    th: {
        textAlign: 'left', borderBottom: '1px solid #555', padding: '4px', color: '#aaa'
    },
    td: {
        borderBottom: '1px solid #333', padding: '4px'
    },
    header: {
        marginTop: 0, marginBottom: '10px', color: '#fff'
    },
    buttonRow: {
        display: 'flex', gap: '10px', marginTop: '10px'
    },
    actionBtn: {
        flex: 1, padding: '10px', backgroundColor: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer'
    }
};