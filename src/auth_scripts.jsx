
import React, {useState, useEffect} from 'react'
import { useParams, useLocation , useNavigate} from 'react-router-dom';
// Base URL for the create account endpoint
const createUrl = 'http://localhost:3000/createAccount'; ////  Defines the API endpoint for account creation
// Base URL for the login endpoint (if implemented)
const loginUrl = 'http://localhost:3000/login'; // Defines the API endpoint for user login


/// for dealing page reloads aby sending rediect from 
// Diagnostic Log: This executes immediately when the script loads, confirming successful file linking.
console.log('--- auth_scripts.js loaded successfully ---'); // Confirms the script file is loaded and running.
const errorMeanings = {
    '1': { message: 'Password must be at least 6 characters long', field: 'password' }, // Error: Length
    '2': { message: 'Password must contain uppercase, number, and symbol', field: 'password' }, // Error: Complexity
    '3': { message: 'Username must be at most 25 characters long', field: 'username' }, // Error: Length
    '4': { message: 'Please enter a valid email address', field: 'email' }, // Error: Format
    '5': { message: 'Passwords do not match', field: 'cpassword' }, // Error: Mismatch
    '6': { message: 'Username is already taken', field: 'username' }, // Auth: Taken
    '7': { message: 'Authentication service error during sign-up', field: 'foot' }, // Auth: Service
    '8': { message: 'Database error while saving new user', field: 'foot' }, // DB: User save
    '9': { message: 'Failed to save username to profile', field: 'username' }, // DB: Profile save
    '10': { message: 'General database error with user profile', field: 'foot' }, // DB: General
    '11': { message: 'Invalid email or password', field: 'foot' }, // Login: Credentials
    '12': { message: 'Server error during login process', field: 'foot' }, // Login: Server
    '13': { message: 'Username retrieval error during login', field: 'username' }, // Login: Retrieval
    '15': { message: 'Email field is required', field: 'email' }, // Empty: Email
    '16': { message: 'Username field is required', field: 'username' }, // Empty: Username
    '17': { message: 'Password field is required', field: 'password' }, // Empty: Password
    '18': { message: 'Please confirm your password', field: 'cpassword' }, // Empty: Confirmation
    '19': { message: 'All fields are required', field: 'foot' }, // Empty: General
    '20': { message: 'Account data object is missing', field: 'foot' }, // System: Data missing,
    '21:':{message:'Failed to find server', field: 'foot' }
};
// Elements for Create Account page

// --- UTILITY FUNCTIONS ---

// Function to display foot errors using the dedicated display element (prevents refresh)
/**
 * Validates account info on the frontend.
 * @param {Object} accountData - The user data ({email, password, username})
 * @returns {string|null} - Returns the error code string or null if valid.
 */
/**
 * Validates account info on the frontend.
 * @param {Object} accountData - The user data ({email, password, username, cpassword})
 * @returns {string|null} - Returns the error code string or null if valid.
 */
function validateAccountInfoFrontEnd(accountData) {
    // 0. Check if accountData exists
    let errors = []
    if (!accountData) { 
        errors.push('20') // Error: No data provided
    }

    const { email, password, username, cpassword } = accountData; // Destructure input data

    // 1. Check for empty fields (Existence checks)
    if (!email) errors.push('15') // Error: Email missing
    if (!username) errors.push('16') // Error: Username missing
    if (!password) errors.push('17') // Error: Password missing
    if (!cpassword) errors.push('18'); // Error: Password confirmation missing

    // 2. Check Password Match
    if (password !== cpassword) {
        errors.push('5') // Error: Passwords do not match
    }

    // 3. Check Password Length
    if (password.length < 6) {
        errors.push('1') // Error: Password too short
    }

    // 4. Check Password Complexity
    const passwRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\-]).{6,40}$/;
    if (!passwRegex.test(password)) {
        errors.push('2') // Error: Complexity requirements not met
    }

    // 5. Check Username Length
    if (username.length > 25) {
        errors.push('3') // Error: Username too long
    }

    // 6. Check Email Format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        errors.push('4'); // Error: Invalid email format
    }

    //errors.push('-1'); // Return -1: All validations passed
    return errors
}

// Function to clear any custom validation messages set by the browser and the foot server error


// Function to show the success message element temporarily

// Function to toggle password visibility


// --- CREATE ACCOUNT LOGIC ---
 // Function to handle the account creation process
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
}; // Closes the function
// i am working on this it will not be used now 
function AuthItem({item={}, auth={}, errors={}, type}){
    return (
        <div className='auth-item'>
        <h3 > {item.name}</h3>
        <input name={item.name} value={auth[item.name]} type={item.type} />
       <div className='error-item' >{errors[item.name]} </div>
        </div>
    )
}

// SVG Icon for the "Hide" (eye with slash) state
const HideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-closed">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
); // Defines the visual representation of hidden data

// SVG Icon for the "Show" (open eye) state
const ShowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-open">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
); // Defines the visual representation of visible data





// --- NEW COMPONENT: LogIn ---
const LogIn = ({ formData, handleInputChange, handleSubmit, error, loading }) => (
    <div className="auth-form">
        <h2>Log In</h2>
        <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleInputChange} 
        />
        
        <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleInputChange} 
        />
        
        {error && <p className="error-text">{error.foot}</p>}
        <button 
            className="auth-submit-btn" 
            onClick={() => handleSubmit('logIn')}
            disabled={loading}
        >
            {loading ? 'Logging in...' : 'Log In'}
        </button>
    </div>
);

// --- NEW COMPONENT: CreateAccount ---
const CreateAccount = ({ formData, handleInputChange, handleSubmit, error, loading , onFocusChange}) => (
    <div className="auth-form">
        
        <h2>Create Account</h2>
         {error && <p className="error-text">{error.username}</p>}
        <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={formData.username} 
            onChange={handleInputChange} 
            onBlur={onFocusChange}
        />
          {error && <p className="error-text">{error.email}</p>}
        <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            value={formData.email} 
            onChange={handleInputChange} 
             onBlur={onFocusChange}
        />
       {error && <p className="error-text">{error.password}</p>}
        <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleInputChange} 
             onBlur={onFocusChange}
        />
         {error && <p className="error-text">{error.cpassword}</p>}
          <input 
            type="password" 
            name="cpassword" 
            placeholder="Confrim Password" 
            value={formData.cpassword} 
            onChange={handleInputChange} 
             onBlur={onFocusChange}
        />
       
        {error && <p className="error-text">{error.foot}</p>}
        <button 
            className="auth-submit-btn" 
            onClick={() => handleSubmit('create')}
            disabled={loading}
        >
            {loading ? 'Creating...' : 'Create Account'}
        </button>
    </div>
);

// --- MAIN PARENT COMPONENT ---
export default function AuthPage() {
    const navagate = useNavigate();
    let  { inittype } = useParams();
    const [type, setType] = useState(inittype)// 'logIn' or 'create'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({
        foot:'',
         username: '', 
        email: '',
        password: '',
        cpassword:''
    });
    const [formData, setFormData] = useState({
        username: '', 
        email: '',
        password: '',
        cpassword:''
    });
    ///console.log(inittype, 'inittype')

    const handleInputChange = (e) => {
       
        const { name, value } = e.target;
         setError(prev=>({...prev, [name]:'' }));// resets the error when entering
         setFormData(prev => ({ ...prev, [name]: value }));
        
        
    };
    function onFocusChange({target}){
        const {name } = target;
        setError({
        username: '', 
        email: '',
        password: '',
        cpassword:''
    })
              const codes  = validateAccountInfoFrontEnd(formData);
       
        for (let code of codes){
        setError((prev) =>({...prev, [errorMeanings[code].field]:errorMeanings[code].message}))
        }
         console.log('code', codes, name, formData, 'feild.', error)
    }
    const location = useLocation()
    useEffect(()=>{
        
        setType(inittype)}, [location])
    

    const handleSubmit = async (actionType) => {
    setError(prev=>({
      ...prev,
      foot:''
    }))
    if(Object.values(error).some(e=>e !==  '')){return}
        setLoading(true);
        
        const url = actionType === 'create' ? createUrl : loginUrl;
        let errorCode = '21'
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log(data, 'data for auth');
          
            if (!response.ok) {
                // Use the specific error code from server or default to '12' (Server Error)
                const code = data.errorCode || '12';
                const field = errorMeanings[code]?.field || 'foot';
                const message = errorMeanings[code]?.message || 'An unexpected error occurred';

                setError(prev => ({ ...prev, [field]: message }));
                return; // Stop execution
            }

            // Success: Redirect
            window.location.href = '/dashboard/profile';
        } catch (err) {
            // Handle network/timeout errors
            setError(prev => ({ ...prev, foot: errorMeanings['21']?.message || 'Cannot reach server' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Professional Way: Clear conditional rendering instead of inline ternary */}
            {type === 'login' ? (
                <LogIn 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleSubmit={handleSubmit}
                    error={error}
                    loading={loading}
                />
            ) : (
                <CreateAccount 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleSubmit={handleSubmit}
                    error={error}
                    loading={loading}
                    onFocusChange={onFocusChange}
                />
            )}

            <style>{`
    .auth-container { 
        width: 90%; 
        max-width: 450px; /* Limits size on desktop */
        margin: auto; 
        padding: 2.5rem; 
        background: white;
        border-radius: 12px; 
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
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
        width: 100%; 
        margin-bottom: 0.25rem; 
        padding: 0.75rem 1rem; 
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s;
    }
    .auth-form input:focus {
        outline: none;
        border-color: #2563eb;
        ring: 2px #bfdbfe;
    }
    .error-text { 
        color: #dc2626; 
        font-size: 0.75rem; 
        margin-bottom: 1rem;
        margin-top: 0.1rem;
        font-weight: 500;
    }
    .auth-submit-btn { 
        width: 100%; 
        padding: 0.875rem; 
        background: #2563eb; 
        color: white; 
        border: none; 
        border-radius: 6px; 
        cursor: pointer; 
        font-weight: 600;
        font-size: 1rem;
        margin-top: 1rem;
        transition: background 0.2s;
    }
    .auth-submit-btn:hover { background: #1d4ed8; }
    .auth-submit-btn:disabled { background: #93c5fd; cursor: not-allowed; }
`}</style>
        </div>
    );
}