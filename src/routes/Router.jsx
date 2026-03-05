import { createBrowserRouter, Link, Outlet, useLocation, useNavigate } from 'react-router-dom'; // Router utilities
import React, { createContext, useContext, useEffect, useState , useReducer, useMemo, useCallback} from 'react'; // React core
import { 
  User, 
  Settings, 
  Bell, 
  Menu, 
  X, 
  Activity,
  Loader2,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  AlertCircle,
  Users,
  Gamepad 
} from 'lucide-react'; // Professional icons
import {  METHODS } from './QuizStates.jsx'

import { getIconDataUri } from './Notifications.jsx';
// IMPORT FIX: Adjusting paths to match the environment structure (using .jsx extension)
import { useHeader, useConnection, wsClient, SERVER_STATES } from '../connection.jsx'; 
import QuizLoadingScreen from '../Loading.jsx';
import IndexPage from './IndexPage.jsx';
import { ServerDisconnectedPage } from '../serverLostConn.jsx';
// Configuration for connection UI with Lucide components
const CONNECTION_UI = {
  PENDING: { label: 'Connecting...', color: '#EAB308', icon: Loader2 },
  OPEN: { label: 'Connected', color: '#22C55E', icon: CheckCircle2 },
  RECONNECTING: { label: 'Retrying...', color: '#F97316', icon: RefreshCw },
  CLOSED: { label: 'Disconnected', color: '#EF4444', icon: WifiOff },
  ERROR: { label: 'Error', color: '#7F1D1D', icon: AlertCircle }
};

// Component to show current server health in the header
function ServerStatusBadge() {
  const { serverstate } = useConnection(); 
  const info = CONNECTION_UI[serverstate] || { label: 'Finding Status', color: '#6B7280', icon: Loader2 };
  const Icon = info.icon;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem', 
      backgroundColor: info.color, 
      padding: '0.25rem 0.75rem', 
      borderRadius: '1rem',
      color: 'white',
      fontSize: '0.75rem',
      transition: 'background-color 0.3s ease'
    }}>
      <Icon size="0.875rem" className={serverstate === 'PENDING' || serverstate === 'RECONNECTING' ? 'animate-spin' : ''} />
      <span>{info.label}</span>
    </div>
  );
}

// Fullscreen Menu Overlay
import './menu.css'; // Import the external stylesheet containing the layout rules

function FullMenu({ links, onClose }) { // Define the functional component with props
  const [isClosed, setIsClosed] = useState(false); // Initialize state to manage the closing sequence

  if (isClosed) return null; // Prevent rendering if the menu is flagged as closed

  return ( // Begin component render tree
    <div className="menu-overlay"> {/* Wrap the entire menu in the gradient background container */}
      <div className="menu-header"> {/* Top section to hold the close action */}
        <button // Interactive close button element
          className="close-btn" // Apply the circular app-button styling
          onClick={() => { // Define the click event handler
            setIsClosed(true); // Update internal state to hide the UI immediately
            onClose(); // Trigger the parent component's close logic
          }} // End of click handler
          aria-label="Close application menu" // Provide context for screen readers
        > {/* Begin button children */}
          <X size="2rem" strokeWidth={2.5} /> {/* Render the Lucide icon with a thicker, modern stroke */}
        </button> {/* End of button element */}
      </div> {/* End of header section */}

      <nav className="menu-link-container"> {/* Main navigation area using flex-grow */}
        {links.map((link, i) => ( // Iterate through the provided array of link objects
          link.tab && ( // Conditionally render only if the item is marked as a tab
            <Link // Utilize React Router's Link for seamless client-side navigation
              key={i} // Assign a unique key for React's reconciliation process
              to={link.path} // Set the destination URL path
              onClick={onClose} // Ensure the menu closes automatically upon navigation
              className="menu-tab" // Apply the elevated card styling
            > {/* Begin link children */}
              {/* Ensure icons passed in props are sized appropriately (e.g., 2.5rem) */}
              {link.icon} {/* Render the visual icon provided in the data array */}
              <span>{link.label}</span> {/* Render the text label for the route */}
            </Link> // End of Link component
          ) // End of conditional render block
        ))} {/* End of array mapping */}
      </nav> {/* End of navigation section */}
    </div> // End of main overlay container
  ); // End of component return
} // End of component definition// End of FullMenu component

export function Tab({ links = [] }) {
  const { headerSet, setHeaderSet } = useHeader();
  const [menuOpen, setMenuOpen] = useState(false);

  // Core functional tabs
  const coreTabs = [
    { label: 'Profile', icon: <User size="1.25rem" />, path: '/dashboard/profile' },
    { label: 'Notifications', icon: <Bell size="1.25rem" />, path: '/dashboard/notifications' },
    
  ];

  return headerSet ? (
    <div style={{ width: '100%', position: 'sticky', top: 0, zIndex: 1000 }}>
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(0.5rem, 2vw, 1rem) clamp(0.75rem, 3vw, 1.5rem)', 
        background: '#1e40af', 
        color: 'white',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minHeight: 'clamp(50px, 8vh, 80px)',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: 'clamp(1rem, 4vw, 1.5rem)', alignItems: 'center', flexWrap: 'wrap' }}>
          {coreTabs.map((tab, i) => (
            <Link key={i} to={tab.path} style={{ color: 'white', textDecoration: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                {tab.icon}
                <span style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)', fontWeight: '500' }}>{tab.label}</span>
              </div>
            </Link>
          ))}
          <button 
            onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}
          >
            <Menu size="clamp(1rem, 3vw, 1.25rem)" />
            <span style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)', fontWeight: '500' }}>Menu</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 0.75rem)', flexWrap: 'wrap' }}>
          <ServerStatusBadge />
          <button 
            onClick={() => setHeaderSet(false)}
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: 'white', 
              borderRadius: '4px', 
              padding: 'clamp(2px, 1vw, 4px) clamp(8px, 2vw, 12px)',
              fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
           <X size="1rem" style={{ marginRight: '4px' }} />
          </button>
        </div>
      </nav>

      {menuOpen && <FullMenu links={links} onClose={() => setMenuOpen(false)} />}
    </div>
  ) : (
    <div
      style={{
        width: '100%',
        height: 'clamp(1rem, 2vh, 1.5rem)', 
        cursor: 'pointer',
        backgroundColor: 'white', 
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)',
        opacity: 0.8
      }}
      onClick={() => setHeaderSet(true)}
    >
     
    </div>
  );
}

// Helper to convert Lucide icons to data URIs if needed for OS notifications


export function useNotifications() {
  const navigate = useNavigate();
  const { usersData , wsClient, setFriends} = useConnection();
  const [permission, setPermission] = useState(Notification.permission);

  // --- 1. Refined Reducer ---
  function reducer(state, action) {
    const { newData, del } = action;

    if (del) {
      const filtered = state.filter((n) => n.name !== del);
      localStorage.setItem('notifications', JSON.stringify(filtered));
      return filtered;
    }

    if (newData) {
      // Prevent Duplicate Notifications: Check if a notification with this name exists
      const exists = state.some((n) => n.name === newData.name);
      if (exists) return state;

      const updated = [...state, newData];
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    }

    return state;
  }

  // Initialize from LocalStorage
  const [notifications, setNotifications] = useReducer(reducer, [], () => {
    try {
      const saved = localStorage.getItem('notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // --- 2. Notification Mapping ---
  // We use useMemo so this object isn't recreated every render
  const NOTIFICATION_MAP = useMemo(() => ({
    friend: {
      type: 'friend',
      declineArgs: [usersData?.friendUser],
      declineMethod: METHODS.DECLINE_FRIEND_REQ,
      meta: usersData?.friend,
      data: {
        body: `User ${usersData?.friend?.username || 'Someone'} sent a friend request.`,
        icon: getIconDataUri(Users),
      },
      name: `FriendRequest_${usersData?.friendUser}`,
      title: 'Friend Request'
    },
    game: {
      type: 'game',
      declineArgs: [true, usersData?.game?.roomId],
      declineMethod: METHODS.ANSWER_INVITE,
      meta:usersData.game,
      data: {
        body: `User ${usersData?.game?.opponent || 'Someone'} challenged you!`,
        icon: getIconDataUri(Gamepad),
      },
      name: `GameChallenge_${usersData?.id}`,
      title: 'Game Challenge'
    }
  }), [usersData]);

  // Global notification handlers map
  

  // --- 3. Trigger Logic ---
  useEffect(() => {
    // Determine the type based on which data is actually present
    let type = null;
    if (usersData?.friend) type = 'friend';
    else if (usersData?.game) type = 'game';

    if (type && NOTIFICATION_MAP[type]) {
      const activeNotif = NOTIFICATION_MAP[type];

      // Update internal state
      setNotifications({ newData: activeNotif });

      // Handle Browser/OS level notifications
      handleBrowserNotification( activeNotif.title, activeNotif.data);
    }
  }, [usersData?.friend, usersData?.game]); // Explicit triggers

  const handleBrowserNotification = (title, options) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const n = new Notification(title, options);
      n.onclick = () => {
        navigate('/dashboard/notifications');
        window.focus();
      };
    } else if (Notification.permission !== "denied") {
      askPermission();
    }
  };

  const askPermission = () => {
    Notification.requestPermission().then((perm) => {
      setPermission(perm);
    });
  };

  const removeNotification = (name) => {
    setNotifications({ del: name });
  };

  return { notifications, removeNotification, permission, askPermission };
}
const dataContext = createContext()
function ServerData ({children}){
 
  const { profileData, usersData ,isServerRuning, setFriends, serverstate } = useConnection()
  const { notifications, removeNotification, permission, askPermission } = useNotifications()
  //const isServerRuning = profileData?.username;
  console.warn(isServerRuning);
  return isServerRuning ?(
    <>
    { serverstate === SERVER_STATES.OPEN ?
    (<>
      <dataContext.Provider value={{notifications, removeNotification, permission, askPermission}}>
    {children}
      </dataContext.Provider>
        </>) : <ServerDisconnectedPage/> }
    </>
  ):(
<>
        <QuizLoadingScreen />
</>
  )

}
export const useDataProvider = ()=>useContext(dataContext)
export function Nav({ links = [] }) {
  const location = useLocation();
  const isIndex = location.pathname === '/';
const isAuthPage = location.pathname.includes('/auth'); // Simple check for auth routes, adjust as needed 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
      {isIndex ? (
        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100dvh', // Use dynamic viewport height for mobile browsers
          width: '100%',
          // Professional background color
          overflowX: 'auto',
          
          backgroundColor: "#1e40af",
          color: "white",
          
        }}>
          {/* <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/home" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600' }}>Home</Link>
            <Link to="/about" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600' }}>About</Link>
          </div>
          <ServerStatusBadge /> */}
          <IndexPage />
                  </nav>
      ) : (

          <main style={{
            flex: 1, // This makes the main area grow to fill available space
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: isAuthPage ? 'center' : 'stretch', // Centers auth forms
            justifyContent: isAuthPage ? 'center' : 'flex-start',
            padding: isAuthPage ? '2rem' : '0'
}}>
            {isAuthPage && <Outlet />}
       {!isAuthPage && ( <ServerData>
          <Tab links={links} />
            
           
                 <Outlet />
              

                
            </ServerData>
            )}
          </main>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
        body { margin: 0; padding: 0; font-family: sans-serif; overflow-x: hidden; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

export const createRouterService = (routeConfig) => {
  const childRoutes = routeConfig.map((link) => {
    const isHome = link.path === '/';
    return {
      index: isHome,
      path: isHome ? undefined : link.path.replace(/^\//, '').toLowerCase(),
      element: <link.component />,
      errorElement: <NotFoundPage />,
    };
  });

  return createBrowserRouter([
    {
      path: '/',
      element: <Nav links={routeConfig} />,
      children: childRoutes,
    },
  ]);
};

export function NotFoundPage() { // Define the functional component
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Optional: Auto-redirect home after 10 seconds
  useEffect(() => { // Trigger on mount
    const timer = setTimeout(() => { // Start timeout
      navigate('/');
    }, 90000); // 10 second delay
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [navigate]); // Dependency array

  const containerStyle = { // Styling for the main container
    display: 'flex', // Use flexbox
    flexDirection: 'column', // Stack elements vertically
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    height: '100vh', // Full viewport height
    textAlign: 'center', // Center text
    padding: '20px', // Add padding
    backgroundColor: '#f9fbfd' // Light background color
  };

  const iconStyle = { // Styling for the visual icon
    fontSize: '80px', // Large icon size
    marginBottom: '20px' // Space below icon
  };

  return ( // Return JSX
    <div style={containerStyle}> {/* Main wrapper */}
      <div style={iconStyle}>🐑</div> {/* Thematic icon */}
      <h1 style={{ fontSize: '3rem', color: '#2c3e50' }}>404</h1> {/* Large error code */}
      <h2 style={{ color: '#7f8c8d' }}>"The Lost Sheep"</h2> {/* Thematic title */}
      <p style={{ maxWidth: '400px', margin: '15px 0', lineHeight: '1.6' }}> {/* Description */}
        Even the best quizzers take a wrong turn sometimes.
        The page you are looking for has wandered away from the site.
      </p> {/* End description */}
      <blockquote style={{ fontStyle: 'italic', color: '#95a5a6', borderLeft: '4px solid #3498db', paddingLeft: '10px' }}> {/* Scripture quote */}
        "Suppose one of you has a hundred sheep and loses one of them..." — Luke 15:4
      </blockquote> {/* End quote */}
      <Link
        to="/"
        style={{
          marginTop: '30px',
          padding: '10px 25px',
          backgroundColor: '#3498db',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}
      > {/* Link back to safety */}
        Return to the Home Page
      </Link> {/* End Link */}
    </div> // End main wrapper
  ); // End return
}