import React, { useState, useEffect, useMemo } from 'react';
import { useConnection } from '../connection.jsx';
import { UniversalModal } from './QuizStates.jsx';
import {
    User, Mail, Zap, UserPlus, Shield, Edit3, X, Search,
    // Existing Icons
    Ghost, Skull, Smile, Gamepad2, Sword, Crown,  Star, Sparkles,
    // New Icons Added
    Sun, Moon, Rocket, Music, Coffee, Code, Terminal, Cpu, Globe, Camera, Headphones, Anchor, Flame, Bug
} from 'lucide-react';
import { METHODS } from './QuizStates.jsx';
// Expanded Array of available icons
const AVAILABLE_ICONS = [
    { id: 'user', icon: User, label: 'User' }, // Capitalized 'u'
    { id: 'ghost', icon: Ghost, label: 'Ghost' }, // Matches Id
    { id: 'skull', icon: Skull, label: 'Skull' }, // Matches Id
    { id: 'smile', icon: Smile, label: 'Smile' }, // Changed from 'Happy'
    { id: 'game', icon: Gamepad2, label: 'Game' }, // Changed from 'Gamer'
    { id: 'sword', icon: Sword, label: 'Sword' }, // Changed from 'Fighter'
    { id: 'crown', icon: Crown, label: 'Crown' }, // Matches Id
    { id: 'heart', icon: Terminal, label: 'Heart' }, // Changed from 'Terminal'
    { id: 'star', icon: Star, label: 'Star' }, // Matches Id
    { id: 'sparkle', icon: Sparkles, label: 'Sparkle' }, // Changed from 'Magic'
    // --- New Icons ---
    { id: 'h', icon: Headphones, label: 'Headphone' }, // Capitalized 'h'
    { id: 'c', icon: Camera, label: 'Camera' }, // Capitalized 'c'
    { id: 'rocket', icon: Rocket, label: 'Rocket' }, // Changed from 'Launch'
    { id: 'flame', icon: Flame, label: 'Flame' }, // Changed from 'Fire'
    { id: 'music', icon: Music, label: 'Music' }, // Changed from 'Vibe'
    { id: 'coffee', icon: Coffee, label: 'Coffee' }, // Changed from 'Fuel'
    { id: 'code', icon: Code, label: 'Code' }, // Matches Id
    { id: 'bug', icon: Bug, label: 'Bug' }, // Changed from 'Glitch'
    { id: 'cpu', icon: Cpu, label: 'Cpu' }, // Changed from 'Tech'
    { id: 'anchor', icon: Anchor, label: 'Anchor' }, // Matches Id
];

export function Profile() {
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const { profileData, username, wsClient, friends } = useConnection();
  console.log("Profile Data:", profileData, username);
    const [friendInput, setFriendInput] = useState('');
    const [color, setColor] = useState(() => localStorage.getItem('userAvatar')?.color || 'white')
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [selectedIconId, setSelectedIconId] = useState(() => localStorage.getItem('userAvatar')?.id || 'user');
const lastFriendIn = friendInput;
    // --- NEW: Theme State ---
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');
useEffect(() => {
     if(!profileData?.username){
        setIsLoading(true);
        
     }else{
        setIsLoading(false);
     }


 }, [profileData]);
    // Persist Theme Logic
    useEffect(() => {
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    // Toggle Handler
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Generate Styles based on current theme
    const styles = useMemo(() => getStyles(theme), [theme]);

    const handleSendRequest = async () => {
        if (!friendInput.trim()) return;
       await wsClient.emit(METHODS.SEND_FRIEND_REQUESTS, {}, friendInput );
        setFriendInput('');
        setShowAddFriend(false);
        setIsOpen(true);
       ;
    };

    const handleIconSelect = (id) => {
        setSelectedIconId(id);
        localStorage.setItem('userAvatar', {id, color:color});
        setShowIconPicker(false);
    };

    const renderAvatar = (size = 48) => {
        const IconComponent = AVAILABLE_ICONS.find(i => i.id === selectedIconId)?.icon || User;
        // Icon color flips based on theme for better visibility
        const iconColor = theme === 'dark' ? '#fff' : '#1e293b';
        return <IconComponent size={size} color={color} />;
    };

    const userXP = profileData?.xp || 0;
    const userEmail = profileData?.email || 'No Email Linked';
    const userLeague = profileData?.league || 'Novice';
    const friendsList = friends || profileData?.friends || [];

    return isLoading?(<>
    <h2  >Loading Profile...</h2>
    
    </>): (
        <div style={styles.container}>
            <UniversalModal isOpen={isOpen} onClose={()=>setIsOpen(false)} title={'Friend Request'} >{(`Request sent to ${lastFriendIn}`)}</UniversalModal>
            {/* --- Header Section --- */}
            <div style={styles.header}>
                {/* Theme Toggle Button */}
                <button style={styles.themeToggle} onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} color="#64748b" />}
                </button>

                <div style={styles.avatarContainer} onClick={() => setShowIconPicker(true)}>
                    {renderAvatar(64)}
                    <div style={styles.editBadge}><Edit3 size={12} color={theme === 'dark' ? '#000' : '#fff'} /></div>
                </div>
                <h1 style={styles.username}>{profileData?.username|| 'Unknown User'}</h1>
                <div style={styles.leagueTag}>
                    <Shield size={14} style={{ marginRight: '0.4rem' }} />
                    {userLeague} League
                </div>
            </div>

            {/* --- Stats Grid --- */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><Zap size={20} color="#eab308" /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statLabel}>Experience</span>
                        <span style={styles.statValue}>{userXP.toLocaleString()} XP</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}><Mail size={20} color="#3b82f6" /></div>
                    <div style={styles.statInfo}>
                        <span style={styles.statLabel}>Email Address</span>
                        <span style={styles.statValue}>{userEmail}</span>
                    </div>
                </div>
            </div>

            {/* --- Friends Section --- */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <h3>Friends ({friendsList.length})</h3>
                    <button
                        style={styles.addFriendBtn}
                        onClick={() => setShowAddFriend(!showAddFriend)}
                    >
                        <UserPlus size={18} />
                        <span style={styles.btnText}>Add Friend</span>
                    </button>
                </div>

                {showAddFriend && (
                    <div style={styles.addFriendInputWrapper}>
                        <div style={styles.inputGroup}>
                            <Search size={18} style={styles.inputIcon} />
                            <input
                                style={styles.input}
                                placeholder="Enter username..."
                                value={friendInput}
                                onChange={(e) => setFriendInput(e.target.value)}
                            />
                            <button style={styles.sendBtn} onClick={handleSendRequest}>Send</button>
                        </div>
                    </div>
                )}

                <div style={styles.friendsList}>
                    {friendsList.length > 0 ? (
                        friendsList.map((friend, i) => (
                            <div key={i} style={styles.friendItem}>
                                <div style={styles.friendAvatar}><User size={20} /></div>
                                <span style={styles.friendName}>{typeof friend === 'string' ? friend : friend.username}</span>
                            </div>
                        ))
                    ) : (
                        <div style={styles.emptyState}>No friends yet. Add some!</div>
                    )}
                </div>
            </div>

            {/* --- Icon Picker Modal --- */}
                {/* <UniversalModal isOpen={showIconPicker} onClose={setShowIconPicker(false)} title='Pick an Icon'> */}
            {showIconPicker && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>Choose Avatar</h3>
                            
                        </div>
                        Change Color:
                                <input type='color' onChange={(e) => { setColor(e.target.value); localStorage.setItem('userAvatar', { id:selectedIconId, color: color }); }} value={color} />
                        <div style={styles.iconGrid}>
                            {AVAILABLE_ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    style={{
                                        ...styles.iconOption,
                                        borderColor: selectedIconId === item.id ? '#3b82f6' : 'transparent',
                                        backgroundColor: selectedIconId === item.id ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff') : 'transparent'
                                    }}
                                    onClick={() => handleIconSelect(item.id)}
                                >
                                    <item.icon size={32} color={selectedIconId === item.id ? '#3b82f6' : (theme === 'dark' ? '#94a3b8' : '#64748b')} />
                                    <span style={styles.iconLabel}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
                {/* </UniversalModal> */}
        </div>
    );
}

// --- Dynamic Styles Generator ---
const getStyles = (theme) => {
    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? '#0f172a' : '#f8fafc',
        text: isDark ? '#f8fafc' : '#1e293b',
        cardBg: isDark ? '#1e293b' : '#ffffff',
        cardBorder: isDark ? '#334155' : '#e2e8f0',
        subText: isDark ? '#94a3b8' : '#64748b',
        inputBg: isDark ? '#1e293b' : '#f1f5f9',
        headerGradient: isDark
            ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
        avatarBg: isDark ? '#334155' : '#e2e8f0',
        hoverBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    };

    return {
        container: {
            display: 'flex', flexDirection: 'column', minHeight: '100vh',
            backgroundColor: colors.bg, color: colors.text,
            fontFamily: 'system-ui, sans-serif', paddingBottom: '2rem',
            transition: 'background-color 0.3s ease, color 0.3s ease', // Smooth transition
        },
        header: {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '3rem 1.5rem 2rem', background: colors.headerGradient,
            borderBottom: `1px solid ${colors.cardBorder}`, position: 'relative'
        },
        themeToggle: {
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '8px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        avatarContainer: {
            position: 'relative', width: '6.5rem', height: '6.5rem',
            borderRadius: '50%', backgroundColor: colors.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', cursor: 'pointer',
            border: `4px solid ${isDark ? '#1e293b' : '#fff'}`,
            boxShadow: '0 0 0 2px #3b82f6', transition: 'transform 0.2s ease',
        },
        editBadge: {
            position: 'absolute', bottom: '0', right: '0',
            backgroundColor: isDark ? '#fff' : '#1e293b',
            borderRadius: '50%', padding: '0.4rem',
            display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        username: { fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0 0.25rem' },
        leagueTag: {
            display: 'flex', alignItems: 'center', color: colors.subText,
            fontSize: '0.9rem', backgroundColor: colors.hoverBg,
            padding: '0.25rem 0.75rem', borderRadius: '1rem',
        },
        statsGrid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
            gap: '1rem', padding: '1.5rem', maxWidth: '64rem', width: '100%',
            margin: '0 auto', boxSizing: 'border-box',
        },
        statCard: {
            backgroundColor: colors.cardBg, padding: '1.25rem',
            borderRadius: '1rem', border: `1px solid ${colors.cardBorder}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
        },
        statIcon: {
            padding: '0.75rem', backgroundColor: colors.hoverBg, borderRadius: '0.75rem',
        },
        statInfo: { display: 'flex', flexDirection: 'column' },
        statLabel: {
            fontSize: '0.8rem', color: colors.subText,
            textTransform: 'uppercase', letterSpacing: '0.05em',
        },
        statValue: { fontSize: '1.1rem', fontWeight: '600', color: colors.text },
        section: {
            padding: '0 1.5rem', maxWidth: '64rem', width: '100%',
            margin: '0 auto', boxSizing: 'border-box',
        },
        sectionHeader: {
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1rem',
        },
        addFriendBtn: {
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            backgroundColor: '#3b82f6', color: 'white', border: 'none',
            padding: '0.5rem 1rem', borderRadius: '0.5rem',
            cursor: 'pointer', fontWeight: '500',
        },
        btnText: { display: 'block' }, // Kept simple, can use media query logic if needed
        addFriendInputWrapper: { marginBottom: '1rem', animation: 'fadeIn 0.2s ease' },
        inputGroup: {
            display: 'flex', backgroundColor: colors.inputBg,
            borderRadius: '0.5rem', border: `1px solid ${colors.cardBorder}`, overflow: 'hidden',
        },
        input: {
            flex: 1, background: 'transparent', border: 'none',
            color: colors.text, padding: '0.75rem', outline: 'none',
        },
        inputIcon: { color: colors.subText, marginLeft: '0.75rem', alignSelf: 'center' },
        sendBtn: {
            backgroundColor: '#22c55e', color: 'white', border: 'none',
            padding: '0 1rem', cursor: 'pointer', fontWeight: '600',
        },
        friendsList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
        friendItem: {
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
            backgroundColor: colors.cardBg, borderRadius: '0.75rem',
            border: `1px solid ${colors.cardBorder}`,
        },
        friendAvatar: {
            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            backgroundColor: colors.avatarBg, display: 'flex',
            justifyContent: 'center', alignItems: 'center', color: colors.subText,
        },
        friendName: { fontWeight: '500', color: colors.text },
        emptyState: {
            textAlign: 'center', color: colors.subText, padding: '2rem', fontStyle: 'italic',
        },
        modalOverlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)',
        },
        modalContent: {
            backgroundColor: colors.cardBg, width: '90%', maxWidth: '25rem',
            borderRadius: '1rem', padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: `1px solid ${colors.cardBorder}`, color: colors.text
        },
        modalHeader: {
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '1.5rem',
        },
        closeBtn: {
            background: 'none', border: 'none', color: colors.subText, cursor: 'pointer',
        },
        iconGrid: {
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem',
        },
        iconOption: {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.25rem', padding: '0.75rem 0.25rem',
            border: '2px solid transparent', borderRadius: '0.5rem',
            cursor: 'pointer', transition: 'all 0.2s',
        },
        iconLabel: { fontSize: '0.7rem', color: colors.subText }
    };
};