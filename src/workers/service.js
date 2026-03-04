//background worker
import { decode } from "@msgpack/msgpack";

const wsserverUrl = 'localhost:3000';
export const SERVER_STATES = {
    CONNECTING: 'CONNECTING',
    PENDING: 'PENDING',     // Connection is being established
    OPEN: 'OPEN',           // Active and ready for data
    CLOSING: 'CLOSING',     // Graceful shutdown in progress
    CLOSED: 'CLOSED',       // Connection is dead
    RECONNECTING: 'RECONNECTING', // Attempting to recover link
    ERROR: "ERROR"
};
function parseMsg(msg){
    try {
      const data =   JSON.parse(msg);
      return data;
    } catch (error) {
        console.error(error)
        return {error:error.message};
    }
}
function setServerState(state){
    self.postMessage({type:'state', name:'serverState', newState:state, success:true});
}
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
class Sockets {
    // COMMENT: Defines the constructor to initialize the connection and state.
    constructor(url = wsserverUrl, onopen, onerror) {
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
    async emit(func, data = {}, ...eventArgs) {
        // 1. Await the connection readiness promise (The most critical fix).
        if (!this._connectionPromise) {
            console.error("Cannot emit: No connection initiated.");
            return {
                error: "Cannot emit: No connection initiated.", success:false};
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
                   resolve({success:false, data:{}, error:e.message})
                    console.error("Failed to parse incoming message:", e);
                    return;
                }

                // 4. Check if the incoming message is the response we are waiting for.
                if (res.responseToId === requestId) {
                    // 5. Success! Remove the temporary listener to clean up.
                    this.clientWs.removeEventListener('message', messageListener); // COMMENT: Removes the specific listener instance to prevent memory leaks and confusion.
                    delete res.responseToId;
                    // 6. Resolve the Promise with the response data.
                    resolve({data:res, success:true, error:'none'}); // COMMENT: Returns the server response to the calling code.
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
let socket = null;
self.onmessage(async ({data})=>{
   try{
    const {isConnected, payload} = data;
    if(!isConnected)return;
    switch (payload.action) {
        case 'start':
            socket = new Sockets();
            socket.handleConnection( () => {
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
            socket.addGlobalListener((rawdata)=>{
              const data =   parseMsg(rawdata);
                if(data?.char){
                    self.postMessage({ type: 'render_char',name:'char_sent', char: char[1], id:char[0], i:char[2] });
                    return;
                }
                self.postMessage({ type: 'render_data', name: 'data_sent', ...data});
              })
            break;
    case 'emit': 
   const {success, error, data} =  await   socket.emit(...payload.args ?? []);
    self.postMessage({type:'emit_result', success, data, func:payload.args, error})
    break;
        default:
            break;
    }
}
catch(e){
 self.postMessage({type:'error', error:e, errMsg:e.message})
}

})