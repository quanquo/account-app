import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';
import LoginPage from './LoginPage';

function Main() {
  const [user, setUser] = useState(null);
  
  const handleLogin = (userData) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
  };
  
  return (
    <>
      {user ? (
        <App user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
