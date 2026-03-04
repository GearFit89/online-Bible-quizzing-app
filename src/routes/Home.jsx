import React from 'react';
import { Link } from 'react-router-dom';
import AuthPage from '../auth_scripts';
 // Optional: Add a CSS file for styling

const Home = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Welcome to Bible Quizzing App</h1>
                <p>Test your knowledge of the Bible and grow spiritually!</p>
            </header>
            <main className="home-main">
                <div className="home-buttons">
                    <Link to="/quiz" className="btn btn-primary">
                        Start Quiz
                    </Link>
                    <Link to="/about" className="btn btn-secondary">
                        Learn More
                    </Link>
                </div>
            </main>
          <button ><Link to='/auth/logIn'>Log In</Link> </button>
            <button ><Link to='/auth/create'>Create Account</Link> </button>
           
   
            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} Bible Quizzing App. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;