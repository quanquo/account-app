import React, { useState } from 'react';
import './LoginPage.css';
import Logo from './components/Logo';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validierung für Login
    if (isLogin) {
      if (!username || !password) {
        setError('Bitte alle Pflichtfelder ausfüllen');
        return;
      }
    } else {
      // Validierung für Registrierung
      if (!username || !fullName) {
        setError('Bitte alle Pflichtfelder ausfüllen');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Zunächst Login-Credentials überprüfen
        if (username === username && password === 'admin') {
          try {
            // API aufrufen, um die Kontonummer des Benutzers zu erhalten
            const userApiUrl = `http://localhost:8080/api/users/${username}`;
            const userResponse = await fetch(userApiUrl);

            if (!userResponse.ok) {
              const errorText = await userResponse.text();
              
              // Wenn User API fehlschlägt, dann ist das ein echter Fehler
              if (userResponse.status === 404) {
                throw new Error(`Benutzer '${username}' nicht gefunden. Bitte registrieren Sie sich zuerst.`);
              } else if (userResponse.status >= 500) {
                throw new Error('Server ist nicht erreichbar. Bitte versuchen Sie es später erneut.');
              } else {
                throw new Error(`Fehler beim Abrufen der Benutzerdaten: ${userResponse.status} - ${errorText}`);
              }
            }

            const userData = await userResponse.json();

            let fullname = userData.name;
            
            // Extract account number from the API response structure
            let accountNumber = null;
            
            // Check for bankAccount.accountNumber (based on your API response)
            if (userData.bankAccount && userData.bankAccount.accountNumber) {
              accountNumber = userData.bankAccount.accountNumber;
            }
            // Fallback checks for other possible structures
            else if (userData.accountNumber) {
              accountNumber = userData.accountNumber;
            } else if (userData.accountId) {
              accountNumber = userData.accountId;
            } else if (userData.account_number) {
              accountNumber = userData.account_number;
            } else if (userData.id) {
              accountNumber = userData.id;
            } else if (userData.userId) {
              accountNumber = userData.userId;
            } else if (userData.kontonummer) {
              accountNumber = userData.kontonummer;
            }
            // Check nested account objects
            else if (userData.account) {
              if (typeof userData.account === 'object') {
                accountNumber = userData.account.accountNumber || 
                              userData.account.accountId || 
                              userData.account.id || 
                              userData.account.number;
              }
            }
            // Check if accounts is an array
            else if (userData.accounts && Array.isArray(userData.accounts)) {
              if (userData.accounts.length > 0) {
                const firstAccount = userData.accounts[0];
                accountNumber = firstAccount.accountNumber || 
                              firstAccount.accountId || 
                              firstAccount.id || 
                              firstAccount.number;
              }
            }

            // Wenn immer noch keine Kontonummer gefunden wurde
            if (!accountNumber || accountNumber === '') {
              throw new Error('Keine Kontonummer für diesen Benutzer gefunden. Bitte wenden Sie sich an den Administrator.');
            }

            // Verify the account number is valid (not empty, null, undefined)
            if (!accountNumber || accountNumber === '' || accountNumber === 'null' || accountNumber === 'undefined') {
              throw new Error('Keine gültige Kontonummer gefunden');
            }

            setSuccess('Anmeldung erfolgreich');
            setTimeout(() => {
              onLogin({
                username,
                fullname,
                accountNumber: String(accountNumber) // Ensure it's a string
              });
            }, 1000);

          } catch (error) {
            setError(error.message);
          }
        } else {
          setError('Ungültige Anmeldedaten');
        }
      } else {
        // Bei Registrierung
        try {
          // Schritt 1: User anlegen
          const registerResponse = await fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username,
              name: fullName
            })
          });

          if (!registerResponse.ok) {
            throw new Error(`Benutzer-Registrierung fehlgeschlagen: ${registerResponse.statusText}`);
          }

          // Schritt 2: Account für den User anlegen
          // Generiere zufällige 10-stellige Kontonummer
          const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);

          const accountResponse = await fetch('http://localhost:8080/api/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username,
              accountNumber: accountNumber,
              description: "Basic Account",
              cashBalance: 0
            })
          });

          if (!accountResponse.ok) {
            throw new Error(`Account-Erstellung fehlgeschlagen: ${accountResponse.statusText}`);
          }

          setSuccess('Registrierung erfolgreich! Sie können sich jetzt anmelden.');
          setIsLogin(true);
          setUsername('');
          setFullName('');
        } catch (error) {
          setError(`Registrierung fehlgeschlagen: ${error.message}`);
        }
      }

    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoginMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    // Reset all form fields when switching modes
    setUsername('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Logo />
          <h2>{isLogin ? 'Anmelden' : 'Registrieren'}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Benutzername:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {isLogin ? (
            <div className="form-group">
              <label htmlFor="password">Passwort:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="fullName">Vollständiger Name:</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="button-group">
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Wird verarbeitet...'
                : isLogin ? 'Anmelden' : 'Registrieren'}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <button
            className="toggle-button"
            onClick={toggleLoginMode}
            disabled={isSubmitting}
          >
            {isLogin
              ? 'Neuen Account erstellen'
              : 'Zurück zur Anmeldung'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;