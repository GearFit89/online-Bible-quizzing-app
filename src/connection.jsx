import React, {useState, useEffect, useContext, createContext, useMemo, useCallback} from "react";
import { handleServerFetch } from './auth_scripts.jsx'
import { decode } from "@msgpack/msgpack";


const sesssionUrl = 'http://localhost:3000/session'
const  AppContext = createContext()
const HeaderContex = createContext();
const wsserverUrl = 'localhost:3000';
export const SERVER_STATES = {
    CONNECTING:'CONNECTING',
    PENDING: 'PENDING',     // Connection is being established
    OPEN: 'OPEN',           // Active and ready for data
    CLOSING: 'CLOSING',     // Graceful shutdown in progress
    CLOSED: 'CLOSED',       // Connection is dead
    RECONNECTING: 'RECONNECTING', // Attempting to recover link
    ERROR:"ERROR"
};
//import React, { useState, useEffect } from 'react'; // Import React hooks
import { Loader2, CheckCircle2, RefreshCw, WifiOff, AlertCircle } from 'lucide-react'; // Import professional icons

// Configuration object for UI states
export const CONNECTION_UI = {
    PENDING: {
        label: 'Connecting...',
        color: '#EAB308', // Yellow
        icon: Loader2, // Spinning loader icon
        className: 'status-pending'
    },
    OPEN: {
        label: 'Connected',
        color: '#22C55E', // Green
        icon: CheckCircle2, // Checkmark icon
        className: 'status-open'
    },
    RECONNECTING: {
        label: 'Retrying Connection',
        color: '#F97316', // Orange
        icon: RefreshCw, // Refresh icon
        className: 'status-reconnect'
    },
    CLOSED: {
        label: 'Disconnected',
        color: '#EF4444', // Red
        icon: WifiOff, // Wifi off icon
        className: 'status-closed'
    },
    ERROR: {
        label: 'Connection Error',
        color: '#7F1D1D', // Dark Red
        icon: AlertCircle, // Alert icon
        className: 'status-error'
    }
};

// Reusable Rectangle UI Component
const StatusRectangle = ({ status, isPersistent }) => {
    // Get configuration based on current server state
    const info = CONNECTION_UI[status] || { label: 'Unknown', color: '#6B7280', icon: AlertCircle };
    // Extract the specific icon component
    const IconComponent = info.icon;

    return (
        <div style={{
            display: 'flex', // Use flexbox for layout
            alignItems: 'center', // Center items vertically
            backgroundColor: info.color, // Set background to status color
            color: '#FFFFFF', // Set text to white for contrast
            padding: '0.75rem 1.25rem', // Scalable padding in rem
            borderRadius: '0.5rem', // Scalable corners in rem
            marginBottom: '0.5rem', // Spacing between blocks
            flexGrow: 1, // Allow it to fill screen width
            width: '50%', // Mobile-first full width
            transition: 'all 0.3s ease', // Smooth transition for color changes
            opacity: isPersistent ? 0.9 : 1 // Slight transparency for persistent bar
        }}>
            {/* Render the icon with a spinning animation if pending or reconnecting */}
            <IconComponent
                size="1.2rem"
                className={(status === 'PENDING' || status === 'RECONNECTING') ? 'animate-spin' : ''}
                style={{ marginRight: '0.75rem' }}
            />
            {/* Status Label */}
            <span style={{ fontWeight: '600', fontSize: '1rem' }}>{info.label}</span>
        </div>
    );
};

export function DisplayConnectionStatus({ serverstate }) {
    // State to control visibility of the dynamic notification
    const [showAlert, setShowAlert] = useState(true);

    // Effect to handle the auto-hide timeout
    useEffect(() => {
        // If the connection opens, wait 3 seconds then hide the alert
        if (serverstate === 'OPEN') {
            const timer = setTimeout(() => {
                setShowAlert(false); // Hide the rectangle
            }, 3000); // 3000ms = 3 seconds
            return () => clearTimeout(timer); // Cleanup timer on state change
        } else {
            // For any other state (Error, Pending, Closed), show the alert immediately
            setShowAlert(true);
        }
    }, [serverstate]); // Trigger whenever serverstate changes

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minHeight: '2rem' // Use px only for min-constraints
        }}>
            {/* 1. Dynamic Notification (Disappears when connected) */}
            {showAlert && (
                <div style={{ flexGrow: 1 }}>
                    <StatusRectangle status={serverstate} isPersistent={false} />
                </div>
            )}

            {/* 2. Permanent Indicator (Always visible) */}
            <div style={{ flexGrow: 1, opacity: 0.6 }}>
                <StatusRectangle status={serverstate} isPersistent={true} />
            </div>
        </div>
    );
}
// To make this object "Read-Only" so it can't be changed later:
Object.freeze(CONNECTION_UI);
// To make this object "Read-Only" so it can't be changed later:
Object.freeze(SERVER_STATES);
 class Sockets {
    // COMMENT: Defines the constructor to initialize the connection and state.
    constructor(url   =wsserverUrl, onopen, onerror ) {
      this.url = url; 
        this.clientWs = null;
        this._connectionPromise = null;
        this.globalListeners = new Set(); // CO.
       
        // COMMENT: No need for this.sessionWs = {}; as response tracking is handled by the Promise.
    }

    // COMMENT: Sets up essential error and close handlers. No need for await/async here.
   handleConnection(onOpen, onClose, onError) {
        // COMMENT: Prevent multiple connections if already connecting
        if (this.clientWs && this.clientWs.readyState === 0) return;

        this.clientWs = new WebSocket('ws://' + this.url);

        this._connectionPromise = new Promise((resolve, reject) => {
            this.clientWs.onopen = (event) => {
                console.log('Connection established.');
                if (typeof onOpen === 'function') onOpen(this.clientWs);
                resolve(this.clientWs);
            };
            this.clientWs.onerror = (error) => {
                console.error('WebSocket Error:', error);
                if (typeof onError === 'function') onError(this.clientWs, error);
                reject(error);
            };
        });

        this.clientWs.onclose = (event) => {
            if (!event.wasClean) console.error('Error with unclean close', event);
            if (typeof onClose === 'function') onClose(this.clientWs);
        };

        // COMMENT: Attach the global listener "sniffer" for the Debug Console
        this.clientWs.addEventListener('message', (event) => {
            this.globalListeners.forEach(listener => listener(event));
        });
    }

    // COMMENT: New method to let the Debug Console subscribe to the raw stream
    addGlobalListener(callback) {
        this.globalListeners.add(callback);
        // Return a cleanup function
        return () => this.globalListeners.delete(callback);
    }
      
        // NOTE: The onopen hdandler is handled in the constructor via _connectionPromise.
    

    // COMMENT: Primary method for sending a message and awaiting a specific response.
     async emit(func, data = ()=>{}, ...eventArgs ) {
         // 1. Await the connection readiness promise (The most critical fix).
         if (!this._connectionPromise) {
             console.error("Cannot emit: No connection initiated.");
             return {
                 error: "Cannot emit: No connection initiated.", success: false
             };
         }
         await this._connectionPromise; // COMMENT: Pauses execution until the WebSocket is confirmed to be OPEN (readyState = 1).

         return new Promise((resolve, reject) => {
             // 2. Create a unique ID for this request.
             const requestId = Date.now().toString() + Math.random().toString(36).substring(2, 9); // COMMENT: Generates a reliable unique request identifier.

             // 3. Define the temporary listener to wait for the specific response.
             const messageListener = (messageEvent) => {
                 let res;
                 try {
                     res = JSON.parse(messageEvent.data);
                 } catch (e) {
                     //if (typeof data === 'function') data(res, e); // Pass the error to the callback if data is a function
                     resolve({ success: false, data: {}, error: e.message })
                     console.error("Failed to parse incoming message:", e);
                     return;
                 }

                 // 4. Check if the incoming message is the response we are waiting for.
                 if (res.responseToId === requestId) {
                     // 5. Success! Remove the temporary listener to clean up.
                     this.clientWs.removeEventListener('message', messageListener); // COMMENT: Removes the specific listener instance to prevent memory leaks and confusion.
                     delete res.responseToId;
                     if(typeof data === 'function') data(res);
                     // 6. Resolve the Promise with the response data.
                     resolve({ data: res, success: true, error: 'none' }); // COMMENT: Returns the server response to the calling code.
                 }
             };

             // 7. Attach the temporary listener *before* sending the request.
             this.clientWs.addEventListener('message', messageListener); // COMMENT: Attaches the message listener specifically for this request's resolution.

             // 8. Send the message payload.
             const payload = {
                 func: func,
                 args: eventArgs,
                 payload: data,
                 requestId: requestId // COMMENT: Includes the unique ID for the server to reference in its response.
             };
             this.clientWs.send(JSON.stringify(payload)); // COMMENT: Transmits the final JSON payload.
         });
     }

}
 export const wsClient = new Sockets(wsserverUrl);

export function Connection({children}){
    const [friends, setFriends] = useState([]); //this is arr of objs of all userers
    const [userProfile, setUserProfile] = useState({});
const [headerSet, setHeaderSet] = useState(true);
    const [username, setUsername] = useState('')
 const [serverstate, setServerState] = useState(SERVER_STATES.PENDING)
const [profileData, setProfileData] = useState({})
const [streamData, setStreamData] = useState({});
const [isServerRuning, setRuning] = useState(false)
const [quizScore, setQuizScore] = useState({});
const [confrimedMSGs, setConfrimedMSGs] = useState([]);
const [usersData, setUsersData] = useState([{}]);
const [signIn, setSignedIn] = useState(false) //this is arr of objs of all userers
const [quizData, setQuizData] = useState({});
const [cleanUpS, setCleanUp] = useState(() => () => {});
const [chars, setChars] = useState('');
const [leaderboardData, setLeaderboardData] = useState([]);
const UPDATE_TYPES = useMemo(()=>({
    PROFILE:'profile',
    USERS:'users',
    QUIZ:'quiz',
    STREAM:'stream',
    SCORE:'score',
    CHAR:'char',
    LEADERBOARD:'leaderboard'
}),[])
    const stateMap = useMemo(() => ({
        [UPDATE_TYPES.LEADERBOARD]: setLeaderboardData,
        [UPDATE_TYPES.PROFILE]: setProfileData,
        [UPDATE_TYPES.USERS]: setUsersData,
        [UPDATE_TYPES.QUIZ]: setQuizData,
        [UPDATE_TYPES.STREAM]: setStreamData,
        [UPDATE_TYPES.SCORE]: setQuizScore,
        [UPDATE_TYPES.CHAR]: setChars
    }), []);

    // 2. Wrap the listener in useCallback
    const msglistner = useCallback((msg) => {
        console.log('Received message:', msg.data); // Log the raw message for debugging
        let res;
        try {
            res = JSON.parse(msg.data);
        } catch (e) {
            console.error("Failed to parse incoming message:", e);
            return;
        }

        if (!res.payload?.update && res?.success) {
            setConfrimedMSGs(prev => [...prev, res]);
            
        }
        if (Array.isArray(res)) {
        
            // window.dispatchEvent(new CustomEvent('fast-char-update', {
            //     detail: res
            // }));
            setChars(res);
            return;
        };
        const updateType = res.payload?.update;
        const dataPayload = res.payload
        const setter = stateMap[updateType];

        // Character update bypass
        
          


           

        if (updateType === UPDATE_TYPES.PROFILE && dataPayload?.username) {
            console.error('Profile update received with username:', dataPayload.username);//this is not an error just a log to confirm the profile update is working and the username is being received correctly
            setSignedIn(true);
            setRuning(true);
            setUsername(dataPayload.username);
            localStorage.setItem('username', dataPayload.username || 'Guest');
            setFriends(dataPayload.friends || []);
            setUserProfile(dataPayload || {});
        }
if(updateType === UPDATE_TYPES.LEADERBOARD){
    setLeaderboardData(prev=>[...prev, dataPayload ]);
}
        if (setter) {
            setter(dataPayload);
        }
    }, [stateMap]); // stateMap is a dependency because it's used inside
 async function clientConnectToServer( ...startArgs){
try {
    //let error =''
//sets up the web socket for the client, creates a new connection amptemt in case the connection was closed by an error.
    const {data, error}  = await handleServerFetch(null, sesssionUrl, "GET");
   if(error || !data || !data?.success){
   setServerState(SERVER_STATES.ERROR);
    console.error('errrpr ', error)
   return {error};

}
if(data?.success){console.log('sucess with  session')
 console.log(data, 'success with session')
    
   setSignedIn(true);
}

} catch(error){
    setServerState(SERVER_STATES.ERROR);
    console.error('errrpr ', error)
   return {error};
}finally{
  /**
 * Establishes a WebSocket connection and handles lifecycle states.
 * Automatically attempts to reconnect if the connection is closed.
 */
const connectToBus = (cleanUp) => {
  wsClient.handleConnection(
    // 1. Success Callback
    () => {
      console.log("WebSocket Connected");
      setServerState(SERVER_STATES.OPEN);
      
    },

    // 2. Close Callback (Triggers Reconnection)
    () => {
      console.warn("WebSocket Closed. Attempting to reconnect...");
      setServerState(SERVER_STATES.CLOSED);
      
      // Retry connection after a 2-second delay to avoid infinite rapid loops
      setTimeout(() => {
        connectToBus();
      }, 2000);
    },

    // 3. Error Callback
    (w, e) => {
      setServerState(SERVER_STATES.ERROR);
      console.error('WS Error:', e?.message || 'Unknown Error', w);
    }
  );
};
const cleanUp = wsClient.addGlobalListener(msglistner);
connectToBus();
return cleanUp
// Initial call to start the process

}

    
  

}

useEffect(() => {
    let activeCleanUp = null;
    let isMounted = true; // Track the cleanup function locally for this effect run

    // COMMENT: Call the async function and handle the returned cleanup promise
    if(isMounted){clientConnectToServer().then(cleanupFn => {
      if (cleanupFn && isMounted) {
        activeCleanUp = cleanupFn;
        // Store it in state for the next effect trigger
        setCleanUp(() => cleanupFn); 
      }
    })}

    return () => {
        isMounted = false;
      // COMMENT: Run the local cleanup if it exists
      if (activeCleanUp) activeCleanUp();
      // PROFESSIONAL ADVICE (React): Alternatively, run the state version if the effect re-runs
      setCleanUp((prev) => {
        if (typeof prev === 'function') prev();
        return () => {};
      });
    };
  }, []);
   const USERNAME= username;
    return (<>
    <HeaderContex.Provider value={{headerSet, setHeaderSet}}>
    <AppContext.Provider value={{leaderboardData, confrimedMSGs,chars, setFriends, isServerRuning,friends,userProfile ,SERVER_STATES, profileData, usersData, wsClient, signIn, quizData, serverstate, streamData, quizScore, username }}>{children}</AppContext.Provider>
  </HeaderContex.Provider >
    </>);
}
export function  useHeader(){
    return useContext(HeaderContex)
  }
export function useConnection (){
    return  useContext(AppContext)
  }
  export const USER_STATES ={
  CONNECTED:'connected',
  QUIZZING:'quzzing',
  VIEWING:'viewing',
   DISCONNECTED:'disconnected',
   ANSWERING:'answering',
  WAITINGNEXT: 'users waiting for next question',
  AWAITJUMPS:'waiting for jumps from the user',
   APPEALING:'appealing',
  WAITCHALLANGE:"waiting challaenage"

}
export const boolean = {
  'T':true,
  "F":false,
}
export const ROOM_STATES ={
  PENDING:"pending", //waiting for the users to join
  
  ACTIVEQUIZ:'quizzing',
  
  DONE:'done'
}
export const RoomTypes = {
  //SOLO_L: 'singles',//not used
  TEAM: 'team_challenge' ,
  // TEAM_L: 'team_live' ,//not used
  SOLO:'solo',
  COMPUTER:'com',
  MULTI:'mutiliplayer',
  INVITES:'invite only'
} 