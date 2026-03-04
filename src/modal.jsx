import React, { useRef, useState, createContext, useContext } from 'react'; // Import necessary React hooks and Context

// 1. Create a Context to share the toggle function with all children
const ModalContext = createContext(); 

// Custom hook to make it easy for children to access the close function
export const useModal = () => useContext(ModalContext); 

export default function Modal({ children, trigger }) {
    const modalRef = useRef(null); // Reference to the native <dialog> element
    const [isVisible, setIsVisible] = useState(false); // Track visibility state

    // Improved toggle function that handles the native dialog API
    const toggleModal = () => {
        if (isVisible) {
            setIsVisible(false); // Set state to hidden
            modalRef.current?.close(); // Call native close method
        } else {
            setIsVisible(true); // Set state to visible
            modalRef.current?.showModal(); // Call native showModal method
        }
    };

    return (
        // 2. Provide the toggle function to the entire component tree
        <ModalContext.Provider value={{ toggleModal }}>
            {/* 3. Flexible Trigger: Instead of a button, we can pass any element */}
            {trigger ? (
                React.cloneElement(trigger, { onClick: toggleModal }) 
            ) : (
                <button onClick={toggleModal}>Open Modal</button>
            )}

            <dialog 
                ref={modalRef} 
                onClose={() => setIsVisible(false)} // Update state if user hits 'Esc' key
                style={{ padding: '20px', borderRadius: '8px' }}
            >
                {/* 4. Render children inside the provider */}
                {children}
            </dialog>
        </ModalContext.Provider>
    );
} 