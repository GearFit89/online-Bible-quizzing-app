
import { EyeClosed, LucideEye } from 'lucide-react'; // Import icons for password visibility
import React, {useState, useEffect} from 'react' // Import standard React hooks
import { useParams, useLocation , useNavigate, Link} from 'react-router-dom'; // Import router hooks for navigation
import { BASE_URL } from './config.js' // Import the base API configuration

const createUrl = BASE_URL +'/createAccount'; // Define the account creation endpoint
const loginUrl = BASE_URL +'/login'; // Define the user login endpoint

const errorMeanings = { // Map error codes to specific fields and messages
    '1': { message: 'Password must be at least 6 characters long', field: 'password' }, // Error code 1
    '2': { message: 'Password must contain uppercase, number, and symbol', field: 'password' }, // Error code 2
    '3': { message: 'Username must be at most 25 characters long', field: 'username' }, // Error code 3
    '4': { message: 'Please enter a valid email address', field: 'email' }, // Error code 4
    '5': { message: 'Passwords do not match', field: 'cpassword' }, // Error code 5
    '6': { message: 'Username is already taken', field: 'username' }, // Error code 6
    '7': { message: 'Authentication service error during sign-up', field: 'foot' }, // Error code 7
    '8': { message: 'Database error while saving new user', field: 'foot' }, // Error code 8
    '9': { message: 'Failed to save username to profile', field: 'username' }, // Error code 9
    '10': { message: 'General database error with user profile', field: 'foot' }, // Error code 10
    '11': { message: 'Invalid email or password', field: 'foot' }, // Error code 11
    '12': { message: 'Server error during login process', field: 'foot' }, // Error code 12
    '13': { message: 'Username retrieval error during login', field: 'username' }, // Error code 13
    '15': { message: 'Email field is required', field: 'email' }, // Error code 15
    '16': { message: 'Username field is required', field: 'username' }, // Error code 16
    '17': { message: 'Password field is required', field: 'password' }, // Error code 17
    '18': { message: 'Please confirm your password', field: 'cpassword' }, // Error code 18
    '19': { message: 'All fields are required', field: 'foot' }, // Error code 19
    '20': { message: 'Account data object is missing', field: 'foot' }, // Error code 20
    '21': { message: 'Failed to find server', field: 'foot' } // FIXED: Removed the extra colon from the key '21'
}; // End of errorMeanings object

function validateAccountInfoFrontEnd(accountData) { // Function to validate inputs before submission
    let errors = [] // Initialize a list to hold error codes
    if (!accountData) { // Check if data is missing entirely
        errors.push('20') // Push system error code
    } // End check

    const { email, password, username, cpassword } = accountData; // Destructure form fields

    if (!email) errors.push('15') // Check for empty email
    if (!username) errors.push('16') // Check for empty username
    if (!password) errors.push('17') // Check for empty password
    if (!cpassword) errors.push('18'); // Check for empty confirmation

    if (password !== cpassword) { // Check if passwords match
        errors.push('5') // Push mismatch code
    } // End check

    if (password.length < 6) { // Check minimum password length
        errors.push('1') // Push length code
    } // End check

    const passwRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-]).{6,40}$/; // Complexity pattern
    if (!passwRegex.test(password)) { // Check regex pattern
        errors.push('2') // Push complexity code
    } // End check

    if (username.length > 25) { // Check maximum username length
        errors.push('3') // Push username length code
    } // End check

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email format pattern
    if (!emailRegex.test(email)) { // Check email format
        errors.push('4'); // Push format error code
    } // End check

    return errors // Return found error codes
} // End function

const LogIn = ({ formData, handleInputChange, handleSubmit, setPasswordHidden, error, loading, passwordHidden }) => ( // Sub-component for login view
    <div className="auth-form">
        <h2>Log In</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('login'); }}>
            <input // Email input field
                type="email" // HTML type email
                name="email" // Key name for state
                placeholder="Email" // Placeholder text
                value={formData.email} // Controlled value
                onChange={handleInputChange} // Change listener
            />
            
            <div className="password-wrapper">
                <input // Password input field
                    type={passwordHidden ? "password" : "text"} // Conditional type toggle
                    name="password" // Key name
                    placeholder="Password" // Placeholder
                    value={formData.password} // Controlled value
                    onChange={handleInputChange} // Change listener
                />
                <button // Visibility toggle button
                    type="button" // Prevent form submission
                    onClick={() => setPasswordHidden(p => !p)} // Toggle boolean state
                    className="toggle-btn" // CSS class
                    aria-label={passwordHidden ? "Show password" : "Hide password"} // Accessibility
                >
                    {passwordHidden ? <LucideEye size="1.2rem" /> : <EyeClosed size="1.2rem" />} 
                </button>
            </div>
            
            {error && error.foot && <p className="error-text">{error.foot}</p>} 
            <button // Login submit button
                className="auth-submit-btn" // CSS class
                type="submit" // Trigger form onSubmit
                disabled={loading} // Prevent double clicks
            >
                {loading ? 'Logging in...' : 'Log In'} 
            </button>
        
        </form>
        <Link to='auth/sigin'>Don't have an account</Link>
    </div>
); // End LogIn

const CreateAccount = ({ formData, handleInputChange, handleSubmit, passwordHidden, setPasswordHidden, error, loading, onFocusChange }) => ( // Sub-component for account creation
    <div className="auth-form">
        <h2>Create Account</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit('create'); }}>
            {error && error.username && <p className="error-text">{error.username}</p>} 
            <input // Username input field
                type="text" // Standard text type
                name="username" // Key name
                placeholder="Username" // Placeholder
                value={formData.username} // Controlled value
                onChange={handleInputChange} // Change listener
                onBlur={onFocusChange} // Validation trigger on focus loss
            />
            
            {error && error.email && <p className="error-text">{error.email}</p>} 
            <input // Email input field
                type="email" // HTML type email
                name="email" // Key name
                placeholder="Email" // Placeholder
                value={formData.email} // Controlled value
                onChange={handleInputChange} // Change listener
                onBlur={onFocusChange} // Focus loss trigger
            />
            
            {error && error.password && <p className="error-text">{error.password}</p>} 
            <div className="password-wrapper"> 
                <input // Password input field
                    type={passwordHidden ? "password" : "text"} // Toggle type
                    name="password" // Key name
                    placeholder="Password" // Placeholder
                    value={formData.password} // Controlled value
                    onChange={handleInputChange} // Change listener
                    onBlur={onFocusChange} // Focus loss trigger
                />
                <button // FIXED: Unified password visibility toggle button
                    type="button" // Non-submitting button
                    onClick={() => setPasswordHidden(p => !p)} // Toggle logic
                    className="toggle-btn" // CSS class
                    aria-label={passwordHidden ? "Show password" : "Hide password"} // Accessibility
                >
                    {passwordHidden ? <LucideEye size="1.2rem" /> : <EyeClosed size="1.2rem" />} 
                </button>
            </div>
            
            {error && error.cpassword && <p className="error-text">{error.cpassword}</p>}
            <input // Confirm password input
                type={passwordHidden ? "password" : "text"} // FIXED: Linked to unified visibility state
                name="cpassword" // Key name
                placeholder="Confirm Password" // FIXED: Corrected spelling of "Confirm"
                value={formData.cpassword} // Controlled value
                onChange={handleInputChange} // Change listener
                onBlur={onFocusChange} // Focus loss trigger
            />
            
            {error && error.foot && <p className="error-text">{error.foot}</p>} 
            <button // Form submission button
                className="auth-submit-btn" // CSS class
                type="submit" // Trigger submit
                disabled={loading} // Disable during request
            > 
                {loading ? 'Creating...' : 'Create Account'} 
            </button> 
        </form>
        <Link to={'auth/login'}>All ready have an account?</Link>
    </div>
); // End CreateAccount

export default function AuthPage() { // Main container component
    const [passwordHidden, setPasswordHidden] = useState(true); // visibility toggle state
    const navigate = useNavigate(); // FIXED: Corrected variable name from navagate
    const { inittype } = useParams(); // Extract initial mode from route
    const [type, setType] = useState(inittype || 'login'); // Active auth mode state
    const [loading, setLoading] = useState(false); // Async request state
    const [error, setError] = useState({ foot: '', username: '', email: '', password: '', cpassword: '' }); // Field errors
    const [formData, setFormData] = useState({ username: '', email: '', password: '', cpassword: '' }); // Input data
    const location = useLocation(); // Location hook for route changes

    useEffect(() => { // Sync state with route parameters
        if (inittype) setType(inittype); // Update local state if URL changes
    }, [location, inittype]); // Re-run effect on route change

    const handleInputChange = (e) => { // Generic input listener
        const { name, value } = e.target; // Destructure target
        setError(prev => ({ ...prev, [name]: '' })); // Clear error for modified field
        setFormData(prev => ({ ...prev, [name]: value })); // Update form state
    }; // End handler

    const onFocusChange = (e) => { // Validation check on field blur
        const codes = validateAccountInfoFrontEnd(formData); // Execute validation
        setError({ foot: '', username: '', email: '', password: '', cpassword: '' }); // Clear existing errors
        for (let code of codes) { // Iterate through found error codes
            const field = errorMeanings[code].field; // Identify target UI field
            setError(prev => ({ ...prev, [field]: errorMeanings[code].message })); // Update field error
        } // End loop
    }; // End handler

    const handleSubmit = async (actionType) => { // Logic to send data to backend
        setError(prev => ({ ...prev, foot: '' })); // Reset generic error
        setLoading(true); // Begin loading
        const url = actionType === 'create' ? createUrl : loginUrl; // Select endpoint
        try { // Start network attempt
            const response = await fetch(url, { // Execute fetch call
                method: 'POST', // HTTP POST
                headers: { 'Content-Type': 'application/json' }, // Content header
                credentials: 'include', // Include session cookies
                body: JSON.stringify(formData) // Serialize payload
            }); // End fetch
            const data = await response.json(); // Parse response data
            if (!response.ok) { // Check for server-side failures
                const code = data.errorCode || '12'; // Fallback to general server error
                const field = errorMeanings[code]?.field || 'foot'; // Find field mapping
                const message = errorMeanings[code]?.message || 'An unexpected error occurred'; // Find message
                setError(prev => ({ ...prev, [field]: message })); // Display error in UI
                return; // Stop execution
            } // End failure check
            window.location.href = '/dashboard/profile'; // Redirect to user profile on success
        } catch (err) { // Handle network timeouts or failures
            setError(prev => ({ ...prev, foot: errorMeanings['21']?.message || 'Cannot reach server' })); // Show network error
        } finally { // Clean up
            setLoading(false); // Stop loading animation
        } // End try-catch-finally
    }; // End submission logic

    return ( // Main UI render
        <div className="auth-container"> 
            {type === 'login' ? ( // Toggle between sub-components
                <LogIn // Login view
                    formData={formData} // Pass form state
                    handleInputChange={handleInputChange} // Pass change logic
                    handleSubmit={handleSubmit} // Pass submit logic
                    passwordHidden={passwordHidden} // Pass visibility state
                    setPasswordHidden={setPasswordHidden} // Pass visibility setter
                    error={error} // Pass error state
                    loading={loading} // Pass loading state
                />
            ) : ( // Render registration view
                <CreateAccount // Account creation view
                    formData={formData} // Pass state
                    handleInputChange={handleInputChange} // Pass logic
                    handleSubmit={handleSubmit} // Pass logic
                    passwordHidden={passwordHidden} // Pass visibility
                    setPasswordHidden={setPasswordHidden} // Pass setter
                    error={error} // Pass errors
                    loading={loading} // Pass status
                    onFocusChange={onFocusChange} // Pass validation trigger
                />
            )} 

            <style>{`
                .auth-container { 
                    display: flex; /* Establish flex context */
                    flex-direction: column; /* Stack components vertically */
                    flex-grow: 1; /* Expand to fill available space */
                    width: 90%; /* Responsive mobile-first width */
                    max-width: 28rem; /* FIXED: Limits width on desktop using rem */
                    margin: 2rem auto; /* Center with rem margins */
                    padding: 2.5rem; /* rem padding for scaling */
                    background: white; /* Clean background */
                    border-radius: 0.75rem; /* rem-based corners */
                    box-shadow: 0 0.625rem 1.5rem -0.3rem rgba(0, 0, 0, 0.1); /* rem-based shadows */
                    min-height: 25rem; /* FIXED: Use px or rem for min height */
                }
                .auth-form h2 {
                    margin-top: 0;
                    color: #1e3a8a;
                    font-size: 1.875rem;
                    font-weight: 700;
                    text-align: center;
                    margin-bottom: 1.5rem;
                }
                .auth-form input { 
                    display: flex; /* Flex context for inputs */
                    width: 100%; /* Fill container width */
                    margin-bottom: 0.25rem; /* Spacing in rem */
                    padding: 0.75rem 1rem; /* Internal padding in rem */
                    border: 0.0625rem solid #d1d5db; /* rem border thickness */
                    border-radius: 0.375rem; /* rem border radius */
                    font-size: 1rem; /* font in rem */
                }
                .password-wrapper {
                    display: flex; /* Use flexbox for input and button alignment */
                    position: relative; /* Context for absolute positioning */
                    align-items: center; /* Center items vertically */
                    width: 100%; /* Full width */
                }
                .toggle-btn {
                    position: absolute; /* Place on top of input */
                    right: 0.5rem; /* Position from right in rem */
                    background: none; /* Transparent background */
                    border: none; /* No border */
                    cursor: pointer; /* Interaction feedback */
                    display: flex; /* Flex for icon centering */
                    align-items: center; /* Icon alignment */
                }
                .error-text { 
                    color: #dc2626; 
                    font-size: 0.75rem; /* Size in rem */
                    margin-bottom: 1rem; /* Bottom margin in rem */
                    font-weight: 500;
                }
                .auth-submit-btn { 
                    display: flex; /* Flex for button sizing */
                    justify-content: center; /* Center text */
                    width: 100%; /* Full width */
                    padding: 0.875rem; /* rem padding */
                    background: #2563eb; /* Primary color */
                    color: white; /* Contrast text */
                    border: none; /* Reset border */
                    border-radius: 0.375rem; /* rem radius */
                    cursor: pointer; /* User feedback */
                    font-weight: 600; /* Bold text */
                    font-size: 1rem; /* font in rem */
                    margin-top: 1rem; /* Top margin in rem */
                    flex-grow: 0; /* Prevent vertical stretching */
                }
                .auth-submit-btn:hover { background: #1d4ed8; }
                .auth-submit-btn:disabled { background: #93c5fd; cursor: not-allowed; }
            `}</style>
        </div>
    ); // End return
} // End AuthPage component
export const handleServerFetch = async (data = {}, Url = "https://api.example.com", method = "POST") => { // Defines the async fetch wrapper
    
    console.log('--- Account Submission Attempt ---'); // Logs the start of the submission process

    try { // Begins the try block to catch network or parsing errors
        console.log('Sending request to server:', Url); // Logs the target URL for the request
        
        const res = await fetch(Url, { // Initiates the network request using fetch
            method: method,
            credentials: 'include' // Specifies the HTTP method (default POST)
             // Converts the data object into a valid JSON string
        }); // Closes the fetch options object

        if (!res.ok) { // Checks if the HTTP status code is outside the 200-299 range
            console.error('Fetch or network error: res is not ok'); // Logs the failure to the console
            return { error: { message: `Server returned ${res.status}` } }; // Returns a formatted error object
        } // Closes the conditional check

        const resData = await res.json(); // Parses the response body as a JavaScript object
        return { data: resData }; // Returns the successfully parsed data

    } catch (error) { // Catches network failures or JSON parsing exceptions
        console.error('Fetch or network error (Promise rejected):', error); // Logs the actual error object
        return { error: error }; // Returns the error for the caller to handle
    } // Closes the catch block
};