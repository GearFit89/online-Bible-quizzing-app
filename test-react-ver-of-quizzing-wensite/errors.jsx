import React from 'react'; // Import React for component functionality
import { useNavigate } from 'react-router-dom'; // Import hook for navigation



const ErrorPage = ({ // Create functional component
  title = "Something went wrong", // Default title value
  message = "We encountered an unexpected error. Please try again later.", // Default message value
  errorCode = "Error" // Default error code
}) => { // Start component body
  const navigate = useNavigate(); // Initialize navigation hook

  const handleGoHome = () => { // Define return-to-home function
    navigate('/'); // Redirect user to the root path
  };

  return ( // Start JSX return
    <div style={styles.container}> {/* Main wrapper with flex centering */}
      <h1 style={styles.code}>{errorCode}</h1> {/* Display status code */}
      <h2 style={styles.title}>{title}</h2> {/* Display title text */}
      <p style={styles.message}>{message}</p> {/* Display description text */}
      <button  // Button for user action
        onClick={handleGoHome} // Trigger navigation on click
        style={styles.button} // Apply button styling
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')} // Hover effect
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')} // Reset hover
      >
        Return to Home {/* Button label */}
      </button>
    </div>
  ); // End JSX return
}; // End component

const styles = { // Define inline styles
  container: { // Container styles
    display: 'flex', // Enable flexbox
    flexDirection: 'column', // Stack children vertically
    alignItems: 'center', // Center items horizontally
    justifyContent: 'center', // Center items vertically
    height: '100vh', // Full viewport height
    textAlign: 'center', // Center text alignment
    backgroundColor: '#f9fafb', // Light gray background
    padding: '20px', // Spacing around edges
  },
  code: { // Error code styles
    fontSize: '6rem', // Extra large text
    fontWeight: 'bold', // Thick font
    color: '#d1d5db', // Muted gray
    margin: '0', // Remove default margins
  },
  title: { // Title styles
    fontSize: '2rem', // Large title text
    color: '#111827', // Dark gray/black
    marginBottom: '10px', // Space below title
  },
  message: { // Message styles
    fontSize: '1.1rem', // Readable paragraph size
    color: '#4b5563', // Medium gray
    marginBottom: '30px', // Space below message
    maxWidth: '500px', // Prevent text from stretching too wide
  },
  button: { // Button styles
    padding: '12px 24px', // Internal button spacing
    fontSize: '1rem', // Standard text size
    backgroundColor: '#3b82f6', // Bright blue
    color: '#ffffff', // White text
    border: 'none', // Remove default border
    borderRadius: '8px', // Rounded corners
    cursor: 'pointer', // Pointer cursor on hover
    transition: 'background-color 0.2s', // Smooth color transition
  },
};

export default ErrorPage; // Export component for use in App.tsx