import React, { useState, useEffect } from 'react';

const SessionExpiredPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Define the event handler
    const handleSessionExpired = () => {
      setIsOpen(true);
    };

    // Listen for the event from api.js
    window.addEventListener('session-expired', handleSessionExpired);

    // Cleanup listener
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const handleLoginRedirect = () => {
    // Redirect to your login page or trigger Google OAuth directly
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'; 
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Session Expired</h2>
        <p style={styles.message}>
          Your security session has ended. Please log in again to continue managing your products.
        </p>
        <button onClick={handleLoginRedirect} style={styles.button}>
          Log In Again
        </button>
      </div>
    </div>
  );
};

// Simple Inline Styles for the "Big Pop Up"
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it sits on top of everything
  },
  modal: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  title: {
    color: '#d32f2f', // Red for alert
    marginBottom: '15px',
    fontSize: '24px',
  },
  message: {
    marginBottom: '25px',
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.5',
  },
  button: {
    backgroundColor: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  }
};

export default SessionExpiredPopup;