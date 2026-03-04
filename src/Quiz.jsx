import React from 'react';

const Quiz = ({ quizzes }) => {
    return (
        <div>
            <h1>Bible Quizzing</h1>
            {quizzes && quizzes.length > 0 ? (
                quizzes.map((quiz, index) => (
                    <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                        <h2>{quiz.title}</h2>
                        <p>{quiz.description}</p>
                        <ul>
                            {quiz.options.map((option, id) => (
                                <li key={i}>
                                    <button>{option}</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No quizzes available.</p>
            )}
        </div>
    );
};

export default Quiz;