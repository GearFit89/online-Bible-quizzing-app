import React, { useState } from 'react';
import { useConnection } from '../connection.jsx'
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Cpu,
    Zap,
    ShieldCheck,
    Trophy,
    ChevronRight
} from 'lucide-react';

export default function IndexPage() {
    // Logic to handle hover effects for inline styles
    const [hoveredItem, setHoveredItem] = useState(null);
    const conn = useConnection();
    const signIn = conn.signIn || false;

    const styles = {
        page: {
            backgroundColor: '#f9fafb',
            color: '#1f2937',
            fontFamily: "'Poppins', sans-serif",
            minHeight: '100vh',
        },
        header: {
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '1rem 1.5rem',
        },
        nav: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            textDecoration: 'none',
        },
        hero: {
            background: 'linear-gradient(135deg, #312e81 0%, #581c87 100%)',
            color: '#ffffff',
            padding: '6rem 1rem',
            textAlign: 'center',
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
        },
        heroSubtitle: {
            fontSize: '1.25rem',
            color: '#e0e7ff',
            maxWidth: '700px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
        },
        btnPrimary: {
            backgroundColor: '#facc15',
            color: '#312e81',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '1.125rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        btnSecondary: {
            backgroundColor: 'transparent',
            border: '2px solid #ffffff',
            color: '#ffffff',
            padding: '1rem 2rem',
            borderRadius: '9999px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '1.125rem',
            marginLeft: '1rem',
        },
        section: {
            padding: '5rem 1rem',
            maxWidth: '1200px',
            margin: '0 auto',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem',
        },
        card: {
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            transition: 'all 0.3s ease',
        },
        iconWrapper: (color) => ({
            backgroundColor: color,
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '1.5rem',
        }),
        footer: {
            backgroundColor: '#111827',
            color: '#9ca3af',
            padding: '4rem 1rem',
            textAlign: 'center',
        }
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <nav style={styles.nav}>
                    <Link to="/" style={styles.logo}>
                        <BookOpen color="#4f46e5" size={28} />
                        <span>ScriptureSync</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <Link to="/auth/login" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
                        <Link to="/auth/signup" style={{ ...styles.btnPrimary, padding: '0.6rem 1.5rem', fontSize: '1rem' }}>Create Account</Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section style={styles.hero}>
                <h1 style={styles.heroTitle}>Master the Word. <br /><span style={{ color: '#facc15' }}>Win the Race.</span></h1>
                <p style={styles.heroSubtitle}>
                    The comprehensive tool for Bible Quizzing. Study solo, challenge our high-speed bots, or compete with your team in real-time.
                </p>
                {signIn ?<>
                
                <Link to="/dashboard/quizzing" style={styles.btnPrimary}>
                        <Zap size={20} /> Start Quizzing 
                    </Link>
                    <Link to="/dashboard/leaderboard" style={{ ...styles.btnSecondary, marginLeft: '1rem' }}>View Stats {"(comming soon)"}</Link>
                
                
                </>: (<div>
                    <Link
                        to="/auth/login"
                        style={styles.btnPrimary}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        <Zap size={20} /> Log In 
                    </Link>
                    <Link to="/auth/signup" style={styles.btnSecondary}>Sign Up</Link>
                </div>)}
            </section>

            {/* Features Grid */}
            <section style={styles.section}>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Built for Every Quizzer</h2>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Tailored modes to help you reach word-perfection.</p>
                </div>

                <div style={styles.grid}>
                    {/* Mode 1: Solo */}
                    <div style={styles.card}>
                        <div style={styles.iconWrapper('#3b82f6')}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Solo Practice</h3>
                        <p style={{ color: '#4b5563', lineHeight: 1.5 }}>
                            Focus on specific flights or chapters. Use our smart spell-checker to ensure your quotes are exactly as written.
                        </p>
                    </div>

                    {/* Mode 2: Computer */}
                    <div style={styles.card}>
                        <div style={styles.iconWrapper('#6366f1')}>
                            <Cpu size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Battle the Bot</h3>
                        <p style={{ color: '#4b5563', lineHeight: 1.5 }}>
                            Train your speed against AI opponents. From "Easy" to "Impossible" speeds, the bot won't wait for you!
                        </p>
                    </div>

                    {/* Mode 3: Multiplayer */}
                    <div style={styles.card}>
                        <div style={styles.iconWrapper('#a855f7')}>
                            <Users size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Team Sync</h3>
                        <p style={{ color: '#4b5563', lineHeight: 1.5 }}>
                            Join a room with your friends. Our socket-based system keeps every buzzer and verse in perfect sync.
                        </p>
                    </div>
                </div>
            </section>

            {/* Trust/Storage Info */}
            <section style={{ ...styles.section, backgroundColor: '#ffffff', borderRadius: '2rem', marginBottom: '5rem', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem' }}>Your Progress, Your Device</h2>
                        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                            We use <strong>Local Storage</strong> to keep your stats private. No need for bulky databases for your personal progress—it stays on your machine.
                        </p>
                        <ul style={{ color: '#4b5563', paddingLeft: '1.25rem', lineHeight: 2 }}>
                            <li>Instant feedback on misspelled words</li>
                            <li>Persistent scores for every chapter</li>
                            <li>Zero-latency offline practice</li>
                        </ul>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f3f4f6', padding: '2rem', borderRadius: '1rem', textAlign: 'center' }}>
                        <Trophy size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ready to beat your high score?</h4>
                        <Link to="/dashboard/quizzing" style={{ color: '#4f46e5', fontWeight: 600, display: 'block', marginTop: '1rem', textDecoration: 'none' }}>
                            Jump into a session <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.2rem' }}>ScriptureSync</span>
                </div>
                <p>&copy; {new Date().getFullYear()} The Bible Quizzing Companion. All rights reserved.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>"Thy word have I hid in mine heart..." — Psalm 119:11</p>
            </footer>
        </div>
    );
}
