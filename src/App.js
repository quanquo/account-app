import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Logo from './components/Logo';
import AccountInfo from './components/AccountInfo';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountData, setAccountData] = useState({
    accountNumber: '',
    description: 'Lade Daten...'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API-Aufruf, um Account-Daten zu laden
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8080/api/accounts/8920');
        
        if (!response.ok) {
          throw new Error(`API-Fehler: ${response.status}`);
        }
        
        const data = await response.json();
        setAccountData({
          accountNumber: data.accountNumber || 'Keine Nummer',
          description: data.description || 'Keine Beschreibung'
        });
        setError(null);
      } catch (err) {
        console.error('Fehler beim Abrufen der Account-Daten:', err);
        setError('Konnte Konto-Informationen nicht laden');
        // Fallback zu Mock-Daten bei Fehler
        setAccountData({
          accountNumber: '1234',
          description: 'Mock-Beschreibung (API nicht erreichbar)'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, []); // Leeres Dependency-Array = nur einmal beim Laden ausführen

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Sie haben nach "${searchQuery}" gesucht`);
    // Hier würde normalerweise die eigentliche Suchanfrage stattfinden
  };

  return (
    <div className="app">
      <div className="search-container">
        <Logo />
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
        
        {/* Account Information Box mit Lade-Status */}
        <AccountInfo 
          accountNumber={accountData.accountNumber}
          description={accountData.description}
          isLoading={isLoading}
          error={error}
        />
        
        <div className="buttons">
          <button className="search-button">Google Suche</button>
          <button className="search-button">Auf gut Glück!</button>
        </div>
      </div>
      <footer>
        <div className="footer-links">
          <a href="#">Über Google</a>
          <a href="#">Werbung</a>
          <a href="#">Unternehmen</a>
          <a href="#">Wie funktioniert die Google Suche?</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
