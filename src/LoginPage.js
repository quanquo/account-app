import React, { useState } from 'react';
import './LoginPage.css';
import Logo from './components/Logo';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validierung
    if (!username || !password) {
      setError('Bitte alle Pflichtfelder ausfüllen');
      return;
    }

    // Bei Registrierung: Prüfe, ob Passwörter übereinstimmen
    if (!isLogin && password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setIsSubmitting(true);

    try {
      // Hier würde normalerweise ein API-Aufruf erfolgen
      // Beispiel-API-Call (simuliert)
      const endpoint = isLogin ? '/api/login' : '/api/register';

      // Simulierter API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 800));


      if (isLogin) {
        try {
          // Zunächst Login überprüfen
          if (username === username && password === 'admin') {
            setSuccess('Anmeldung erfolgreich');

            // API aufrufen, um die Kontonummer des Benutzers zu erhalten
            try {
              const userResponse = await fetch(`http://localhost:8080/api/users/${username}`);

              if (!userResponse.ok) {
                throw new Error('Fehler beim Abrufen der Benutzerdaten');
              }

              const userData = await userResponse.json();

              setTimeout(() => {
                // Benutzer samt Kontonummer an Parent-Komponente übergeben
                onLogin({
                  username,
                  accountNumber: userData.accountNumber
                });
              }, 1000);
            } catch (error) {
              console.error('Fehler beim Laden der Benutzerdaten:', error);
              // Falls API-Aufruf fehlschlägt, trotzdem einloggen aber ohne Kontonummer
              setTimeout(() => {
                onLogin({ username });
              }, 1000);
            }
          } else {
            setError('Ungültige Anmeldedaten');
          }
        } catch (err) {
          setError('Ein Fehler ist beim Login aufgetreten. Bitte versuchen Sie es später erneut.');
        }
      } else {
        // Bei Registrierung
        setSuccess('Registrierung erfolgreich! Sie können sich jetzt anmelden.');
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }

    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoginMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
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

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Passwort bestätigen:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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