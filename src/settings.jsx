import React, { useState, useEffect } from 'react';
import {  FolderOpen, X, Save, ChevronDown, ChevronUp, BookOpen, Tag, Hash } from 'lucide-react';
import { wsClient } from './connection';
// Reusing your UniversalModal logic for the save prompt
const UniversalModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <dialog className="modal-container" open style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '500px', border: 'none', position: 'relative' }}>
                <button className="modal-close-btn" onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
                <div className="modal-content">
                    {title && <h3 className="modal-title" style={{ marginTop: 0 }}>{title}</h3>}
                    <div className="modal-body">{children}</div>
                </div>
            </dialog>
        </div>
    );
};

export const AdvancedSettings = () => {
    // 1. Core State structured exactly like your TS Interfaces
    const [settings, setSettings] = useState({
        // --- QuestionSettings Interface ---
        month: [],
        book: [],
        chapter: [],
        verses: [],
        flight: ['A', 'B', 'C', 'T'],
        trigs: {},
        types: ['quote', 'ftv', 'question', 'According to', 'SQ:'],
        quizMode: [],

        // --- QuizSettings Interface ---
        verseSelection: 'random',
        highlight: 0,
        mode: 'quiz',
        numQuestions: 20,
        lenOfTimer: 30,
        speed_tOf_text: 1000,

        // --- Bonus Advanced Filtering ---
        difficulty: 'all',
      
    });

    // Modal and Save States
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [savedConfigs, setSavedConfigs] = useState({});

    // Load saved settings from LocalStorage on mount
    useEffect(() => {
        const localData = localStorage.getItem('quiz_custom_settings');
        if (localData) {
            setSavedConfigs(JSON.parse(localData));
        }
    }, []);

    // Handle standard inputs
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' || type === 'range' ? Number(value) : value
        }));
    };

    // Handle Array toggles (like Flights or Question Types)
    const toggleArrayItem = (arrayName, item) => {
        setSettings(prev => {
            const currentArr = prev[arrayName];
            const newArr = currentArr.includes(item)
                ? currentArr.filter(i => i !== item)
                : [...currentArr, item];
            return { ...prev, [arrayName]: newArr };
        });
    };

    // Save Logic
    const handleSave = async () => {
        if (!saveName.trim()) return;
        const newConfigs = { ...savedConfigs, [saveName]: settings };
       const {success, data}  = await wsClient.emit('setSettings', {  }, newConfigs);
       if(!success || !data?.success)console.error('error with data on savieng settings', data) // Optional server sync
        localStorage.setItem('quiz_custom_settings', JSON.stringify(newConfigs));
        setSavedConfigs(newConfigs);
        setSaveName('');
        setIsSaveModalOpen(false);
    };

    // Load Logic
    const loadConfig = (name) => {
        if (savedConfigs[name]) {
            setSettings(savedConfigs[name]);
        }
    };

    const deleteConfig = (name) => {
        const newConfigs = { ...savedConfigs };
        delete newConfigs[name];
        localStorage.setItem('quiz_custom_settings', JSON.stringify(newConfigs));
        setSavedConfigs(newConfigs);
    };

    return (
        <div className="overflow-set" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>

            {/* --- SAVED CONFIGURATIONS (SCROLL BAR AREA) --- */}
            <div className="option-section" style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="section-title" style={{ margin: 0 }}><FolderOpen size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Saved Loadouts</h3>
                    <button className="button" onClick={() => setIsSaveModalOpen(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}>
                        <Save size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Save Current
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '15px 0', scrollbarWidth: 'thin' }}>
                    {Object.keys(savedConfigs).length === 0 ? (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>No saved settings yet.</span>
                    ) : (
                        Object.keys(savedConfigs).map(name => (
                            <div key={name} style={{ flexShrink: 0, background: 'white', border: '1px solid #e2e8f0', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong style={{ cursor: 'pointer', color: '#1e293b' }} onClick={() => loadConfig(name)}>{name}</strong>
                                <button onClick={() => deleteConfig(name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><X size={16} /></button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- QUIZ SETTINGS (Game Mechanics) --- */}
            <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a' }}>Game Mechanics</h2>

            <div className="option-section">
                <h3 className="section-title">Number of Questions ({settings.numQuestions})</h3>
                <input type="range" name="numQuestions" min="5" max="100" step="5" value={settings.numQuestions} onChange={handleChange} style={{ width: '100%' }} />
            </div>

            <div className="option-section">
                <h3 className="section-title">Timer Length (Seconds) ({settings.lenOfTimer || 'Off'})</h3>
                <input type="range" name="lenOfTimer" min="0" max="60" value={settings.lenOfTimer} onChange={handleChange} style={{ width: '100%' }} />
            </div>

            <div className="option-section">
                <h3 className="section-title">Text Speed (ms) ({settings.speed_tOf_text})</h3>
                <input type="range" name="speed_tOf_text" min="0" max="4000" step="100" value={settings.speed_tOf_text} onChange={handleChange} style={{ width: '100%' }} />
            </div>

            {/* --- QUESTION SETTINGS (Advanced Filtering) --- */}
            <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', color: '#0f172a', marginTop: '30px' }}>Question Filters</h2>

            <div className="option-section">
                <h3 className="section-title">Allowed Flights</h3>
                <div className="checkbox-container" style={{ display: 'flex', gap: '15px' }}>
                    {['A', 'B', 'C', 'T'].map(flight => (
                        <label key={flight} className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="checkbox"
                                checked={settings.flight.includes(flight)}
                                onChange={() => toggleArrayItem('flight', flight)}
                            />
                            Flight {flight}
                        </label>
                    ))}
                </div>
            </div>

            <div className="option-section">
                <h3 className="section-title">Question Types</h3>
                <div className="checkbox-container" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'quote', label: 'Quotes' },
                        { id: 'ftv', label: 'Finish The Verse' },
                        { id: 'question', label: 'Standard Q/A' },
                        { id: 'according', label: 'According To' }
                    ].map(type => (
                        <label key={type.id} className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input
                                type="checkbox"
                                checked={settings.types.includes(type.id)}
                                onChange={() => toggleArrayItem('types', type.id)}
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* --- SAVE MODAL --- */}
            <UniversalModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Settings">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ margin: 0, color: '#64748b' }}>Give this settings configuration a name so you can quickly load it later.</p>
                    <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="e.g., Fast Paced Flight A"
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', width: '100%' }}
                    />
                    <button
                        onClick={handleSave}
                        style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        Save Configuration
                    </button>
                </div>
            </UniversalModal>
        </div>
    );
};



export const QuestionBank = ({ wsClient, currentSettings }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [saveSetName, setSaveSetName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // 1. Fetch Questions using your socket hint
    useEffect(() => {
        if (!wsClient) return;

        setLoading(true);

        // Emitting with the filter settings
        // Assuming your server responds via an acknowledgment callback
        wsClient.emit('getQuestion', {}, { filterSettings: currentSettings || {} }, (response) => {
            if (response && response.questions) {
                setQuestions(response.questions);
            } else {
                // Fallback mock data if server isn't hooked up yet
                console.warn("No questions returned, using fallback data.");
                setQuestions([
                    { id: 'q1', text: "For God so loved the world...", answer: "that he gave his only Son", book: "John", chapter: 3, verse: 16, type: "quote", flight: "A" },
                    { id: 'q2', text: "Finish the verse: 'In the beginning...'", answer: "God created the heavens and the earth.", book: "Genesis", chapter: 1, verse: 1, type: "ftv", flight: "B" },
                    { id: 'q3', text: "According to Romans 6:23, what is the wages of sin?", answer: "Death", book: "Romans", chapter: 6, verse: 23, type: "according", flight: "A" }
                ]);
            }
            setLoading(false);
        });

        // If your server uses a separate listener instead of an ack callback, use this:
        // wsClient.on('receiveQuestions', (data) => { setQuestions(data.questions); setLoading(false); });
        // return () => wsClient.off('receiveQuestions');
    }, [wsClient, currentSettings]);

    // 2. Expand/Collapse UX Logic
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // 3. Save Set Logic
    const handleSaveSet = () => {
        if (!saveSetName.trim() || questions.length === 0) return;

        const existingSets = JSON.parse(localStorage.getItem('quiz_saved_sets') || '{}');
        existingSets[saveSetName] = questions;

        localStorage.setItem('quiz_saved_sets', JSON.stringify(existingSets));
        setSaveSetName('');
        setIsSaving(false);
        alert(`Set "${saveSetName}" saved successfully!`);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, color: '#0f172a' }}>Question Bank preview</h2>

                {/* Save Set Controls */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {isSaving ? (
                        <>
                            <input
                                type="text"
                                value={saveSetName}
                                onChange={(e) => setSaveSetName(e.target.value)}
                                placeholder="Name this set..."
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                            <button onClick={handleSaveSet} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Save size={16} /> Confirm
                            </button>
                            <button onClick={() => setIsSaving(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsSaving(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Save size={16} /> Save Question Set
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading questions from server...</div>}

            {/* Grid Area */}
            {!loading && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {questions.map((q) => {
                        const isExpanded = expandedId === q.id;

                        return (
                            <div
                                key={q.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: `1px solid ${isExpanded ? '#3b82f6' : '#e2e8f0'}`,
                                    boxShadow: isExpanded ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s ease-in-out',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Card Header (Always Visible) */}
                                <div
                                    onClick={() => toggleExpand(q.id)}
                                    style={{ padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: isExpanded ? '#f8fafc' : 'white' }}
                                >
                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '5px', display: 'flex', gap: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><BookOpen size={14} /> {q.book} {q.chapter}:{q.verse}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#8b5cf6' }}><Tag size={14} /> Flight {q.flight}</span>
                                        </div>
                                        <div style={{ color: '#1e293b', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: isExpanded ? 'none' : '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {q.text}
                                        </div>
                                    </div>
                                    <div style={{ color: '#94a3b8', marginTop: '5px' }}>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Expanded Content (The "Nice UX" Reveal) */}
                                {isExpanded && (
                                    <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', animation: 'fadeIn 0.2s ease-in' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Answer</strong>
                                            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '6px', color: '#065f46', border: '1px solid #a7f3d0' }}>
                                                {q.answer}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={14} /> Type: <strong>{q.type.toUpperCase()}</strong></span>
                                            <span>ID: {q.id}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};