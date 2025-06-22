import React, { useState } from 'react';
import './LoginPage.css';
import Logo from './components/Logo';
import { useTranslation } from 'react-i18next';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!username || !password) {
        setError(t('fillRequired'));
        return;
      }
    } else {
      if (!username || !fullName) {
        setError(t('fillRequired'));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        if (username === username && password === 'admin') {
          try {
            const userApiUrl = `http://localhost:8080/api/users/${username}`;
            const userResponse = await fetch(userApiUrl);

            if (!userResponse.ok) {
              const errorText = await userResponse.text();
              if (userResponse.status === 404) {
                throw new Error(t('userNotFound', { username }));
              } else if (userResponse.status >= 500) {
                throw new Error(t('unexpectedError'));
              } else {
                throw new Error(`API-Fehler: ${userResponse.status} - ${errorText}`);
              }
            }

            const userData = await userResponse.json();
            let fullname = userData.name;
            let accountNumber = null;

            if (userData.bankAccount && userData.bankAccount.accountNumber) {
              accountNumber = userData.bankAccount.accountNumber;
            } else if (userData.accountNumber) {
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
            } else if (userData.account && typeof userData.account === 'object') {
              accountNumber = userData.account.accountNumber || userData.account.accountId || userData.account.id || userData.account.number;
            } else if (Array.isArray(userData.accounts) && userData.accounts.length > 0) {
              const firstAccount = userData.accounts[0];
              accountNumber = firstAccount.accountNumber || firstAccount.accountId || firstAccount.id || firstAccount.number;
            }

            if (!accountNumber || accountNumber === '' || accountNumber === 'null' || accountNumber === 'undefined') {
              throw new Error(t('noAccountNumber'));
            }

            setSuccess(t('loginSuccess'));
            setTimeout(() => {
              onLogin({
                username,
                fullname,
                accountNumber: String(accountNumber)
              });
            }, 1000);
          } catch (error) {
            setError(error.message);
          }
        } else {
          setError(t('invalidLogin'));
        }
      } else {
        try {
          const registerResponse = await fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, name: fullName })
          });

          if (!registerResponse.ok) {
            throw new Error(`${t('registerFailed')}: ${registerResponse.statusText}`);
          }

          const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000);

          const accountResponse = await fetch('http://localhost:8080/api/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              accountNumber,
              description: "Basic Account",
              cashBalance: 0
            })
          });

          if (!accountResponse.ok) {
            throw new Error(`${t('registerFailed')}: ${accountResponse.statusText}`);
          }

          setSuccess(t('registerSuccess'));
          setIsLogin(true);
          setUsername('');
          setFullName('');
        } catch (error) {
          setError(`${t('registerFailed')}: ${error.message}`);
        }
      }
    } catch (err) {
      setError(t('unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLoginMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setFullName('');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lng', lng);
  };

  return (
    <div className="login-container">

      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button onClick={() => changeLanguage('de')} disabled={i18n.language === 'de'}>DE</button>
        <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'} style={{ marginLeft: '0.5rem' }}>EN</button>
        <button onClick={() => changeLanguage('vi')} disabled={i18n.language === 'vi'} style={{ marginLeft: '0.5rem' }}>VI</button>
      </div>

      <div className="login-card">
        <div className="login-header">
          <Logo />
          <h2>{isLogin ? t('login') : t('register')}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('username')}:</label>
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
              <label htmlFor="password">{t('password')}:</label>
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
              <label htmlFor="fullName">{t('fullName')}:</label>
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
                ? t('processing')
                : isLogin ? t('login') : t('register')}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <button
            className="toggle-button"
            onClick={toggleLoginMode}
            disabled={isSubmitting}
          >
            {isLogin ? t('createAccount') : t('backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;