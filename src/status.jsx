import React, { useState, useEffect, useCallback } from 'react'; // Import React and hooks
import { useConnection } from './connection.jsx'; // Import the custom connection hook

export function StatusOutputBox() { // Define the functional component
    const { wsClient, serverstate } = useConnection(); // Destructure socket client and connection state
    const [statusData, setStatusData] = useState(null); // State to store the stringified status
    const [isLoading, setIsLoading] = useState(false); // State to track the request progress

    // Using useCallback ensures the function reference stays stable
    const runStatusCheck = useCallback(async () => { // Define the fetching logic
        if (serverstate !== 'OPEN') return; // Prevent execution if the socket is not connected

        setIsLoading(true); // Start loading state
        try { // Start of the request attempt
            const response = await wsClient.emit('getCurStatus'); // Call the backend WssFuncs method
            if (response?.dTS?.status) { // Check if the response contains the status data
                // stringify the object with 2-space indentation for readability
                setStatusData(JSON.stringify(response.dTS.status, null, 2)); // Update the display state
            } // End of data check
        } catch (error) { // Handle potential network or parsing errors
            console.error('Status check failed:', error); // Log the error for developers
        } finally { // Run this block regardless of success or failure
            setIsLoading(false); // Reset loading state
        } // End of try/catch/finally
    }, [wsClient, serverstate]); // Dependencies for the callback

    // AUTOMATIC TRIGGER: Runs every time the serverstate changes
    useEffect(() => { // Initialize the effect hook
        if (serverstate === 'OPEN') { // Only trigger if the connection is active
            runStatusCheck(); // Execute the status check
        } // End of conditional
    }, [serverstate, runStatusCheck]); // Trigger dependencies

    return ( // Begin component render
        <div style={{ // Container styling
            display: 'flex', // Enable flexbox
            flexDirection: 'column', // Vertical layout
            width: '100%', // Mobile-first full width
            minHeight: '12.5rem', // Set a minimum height using rem
            padding: '1.25rem', // Consistent spacing
            gap: '1rem', // Space between elements
            backgroundColor: '#111827', // Slate-900 background
            borderRadius: '0.5rem' // Standard rounded corners
        }}> // End of container style

            <div style={{ // Header styling
                display: 'flex', // Enable flexbox for header
                justifyContent: 'space-between', // Separate title and button
                alignItems: 'center' // Align items vertically
            }}> // End of header style
                <h2 style={{ margin: 0, color: '#F3F4F6', fontSize: '1.25rem' }}>System Status</h2> // Title text

                {/* MANUAL TRIGGER BUTTON */}
                <button // Refresh button element
                    onClick={runStatusCheck} // Trigger the manual check on click
                    disabled={isLoading || serverstate !== 'OPEN'} // Disable if busy or disconnected
                    style={{ // Button styling
                        padding: '0.5rem 1rem', // Button sizing
                        backgroundColor: '#3B82F6', // Blue-500 color
                        color: '#FFFFFF', // White text
                        border: 'none', // Remove default border
                        borderRadius: '0.25rem', // Small corners
                        cursor: isLoading ? 'not-allowed' : 'pointer', // UX cursor feedback
                        opacity: (isLoading || serverstate !== 'OPEN') ? 0.5 : 1 // Visual feedback for disabled state
                    }} // End of button style
                > // Button content
                    {isLoading ? 'Checking...' : 'Run Status Check'} // Dynamic label
                </button> // End of button
            </div> // End of header row

            <pre style={{ // Output area for stringified data
                flexGrow: 1, // Allow the box to take up remaining space
                backgroundColor: '#000000', // Pitch black for code contrast
                color: '#10B981', // Emerald-500 text (terminal green)
                padding: '1rem', // Internal padding
                borderRadius: '0.375rem', // Rounded corners
                overflowX: 'auto', // Handle wide JSON objects
                fontSize: '0.875rem', // Slightly smaller text for code
                border: '1px solid #374151', // Subtle border
                margin: 0 // Remove browser default margin
            }}> // End of pre style
                {statusData || 'Waiting for connection...'} // Render data or fallback text
            </pre> // End of output area
        </div> // End of main container
    ); // End of component
} // End of StatusOutputBox