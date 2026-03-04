import React, { useState, useEffect, useMemo } from 'react';
import { wsClient, useConnection } from './connection.jsx';
import { 
  User, Mail, Trophy, Zap, Shield, Settings, 
  LogOut, Star, CheckCircle, ExternalLink, Award 
} from 'lucide-react';

const ProfilePage = () => {
  const { serverstate } = useConnection();
  // Initialize profile from serverstate (main data sent on load)
  const [profile, setProfile] = useState(serverstate?.profile || null);

  // Listen for real-time profile updates
  useEffect(() => {
    if (typeof wsClient.addGlobalListener === 'function') {
      const unsubscribe = wsClient.addGlobalListener((msg) => {
        if (msg.payload?.update === 'profile' && msg.payload?.data) {
          setProfile(prev => ({ ...prev, ...msg.payload.data }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleLogout = () => {
    // Clear cookies/localstorage as per your auth logic
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  if (!profile) {
    return <div style={styles.loading}>Loading Divine Profile...</div>;
  }

  return (
    <div style={styles.screen}>
      {/* Header Section */}
      <header style={styles.header}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}>
            {profile.avatar?.url ? (
              <img src={profile.avatar.url} alt="Avatar" style={styles.avatarImg} />
            ) : (
              <User size={48} color="#007acc" />
            )}
          </div>
          <div style={styles.badgeCount}>
            <Award size={16} /> {profile.badges?.length || 0}
          </div>
        </div>
        <h1 style={styles.username}>{profile.username}</h1>
        <p style={styles.leagueText}>
          <Shield size={14} style={{ marginRight: 4 }} />
          {profile.league || 'Novice'} League
        </p>
      </header>

      {/* Main Content Grid */}
      <main style={styles.mainGrid}>
        
        {/* Stats Card */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}><Zap size={18} color="#f1c40f" /> Statistics</h3>
          <div style={styles.statsRow}>
            <StatItem label="XP" value={profile.xp?.toLocaleString()} />
            <StatItem label="Streak" value={`${profile.streak || 0} Days`} />
            <StatItem label="Role" value={profile.role} />
          </div>
        </section>

        {/* Info Card */}
        <section style={styles.card}>
          <h3 style={styles.cardTitle}><Mail size={18} color="#3498db" /> Contact & Account</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>{profile.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Team</span>
              <span style={styles.infoValue}>{profile.team_name || 'Free Agent'}</span>
            </div>
          </div>
        </section>

        {/* Modules/Progress Card */}
        <section style={{...styles.card, gridColumn: 'span 1'}}>
          <h3 style={styles.cardTitle}><CheckCircle size={18} color="#2ecc71" /> Completion</h3>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${(profile.modules_completed?.length / 20) * 100}%`}} />
            </div>
            <p style={styles.progressText}>{profile.modules_completed?.length || 0} Modules Finished</p>
          </div>
        </section>

      </main>

      {/* Footer Actions */}
      <footer style={styles.footer}>
        <button style={styles.settingsBtn}>
          <Settings size={20} /> Settings
        </button>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} /> Sign Out
        </button>
      </footer>
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div style={styles.statItem}>
    <span style={styles.statValue}>{value}</span>
    <span style={styles.statLabel}>{label}</span>
  </div>
);

// --- CSS-in-JS Styles ---
const styles = {
  screen: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: '16px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    border: '3px solid #38bdf8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  badgeCount: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f59e0b',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  username: { margin: '0 0 4px 0', fontSize: '24px', fontWeight: 'bold' },
  leagueText: { margin: 0, color: '#94a3b8', display: 'flex', alignItems: 'center', fontSize: '14px' },
  
  mainGrid: {
    flex: 1,
    padding: '20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid
    gap: '20px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #334155',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  cardTitle: { 
    margin: '0 0 15px 0', 
    fontSize: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    color: '#cbd5e1'
  },
  statsRow: { display: 'flex', justifyContent: 'space-between', textAlign: 'center' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' },
  statLabel: { fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' },
  
  infoList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '8px' },
  infoLabel: { color: '#94a3b8', fontSize: '14px' },
  infoValue: { fontSize: '14px', fontWeight: '500' },

  progressBar: { width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' },
  progressFill: { height: '100%', backgroundColor: '#2ecc71', transition: 'width 0.5s ease-out' },
  progressText: { fontSize: '12px', color: '#94a3b8', marginTop: '8px' },

  footer: {
    padding: '20px',
    display: 'flex',
    gap: '10px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  settingsBtn: {
    backgroundColor: '#334155',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  loading: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#38bdf8' }
};

export default ProfilePage;