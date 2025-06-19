
import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Logo from './components/Logo';
import AccountInfo from './components/AccountInfo';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountData, setAccountData] = useState({
    accountNumber: '',
    description: 'Lade Daten...',
    saldo: 'Lade Saldo...'
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API-Aufruf, um Account-Daten zu laden
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
        description: data.description || 'Keine Beschreibung',
        balance: data.balance || 'Kein Saldo'
      });
      
      // Setze die Transaktionen aus der API-Antwort
      setTransactions(data.transactions || []);
      
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

  // Initialer Aufruf beim Laden der Komponente
  useEffect(() => {
    fetchAccountData();
  }, []); 

  // Refresh-Handler für den Button
  const handleRefresh = () => {
    fetchAccountData();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Sie haben nach "${searchQuery}" gesucht`);
    // Hier würde normalerweise die eigentliche Suchanfrage stattfinden
  };

  // Placeholder für die noch nicht implementierten Funktionen
  const handleDeposit = () => {
    alert('Einzahlen-Funktion noch nicht implementiert');
  };

  const handleWithdraw = () => {
    alert('Auszahlen-Funktion noch nicht implementiert');
  };

  // Formatiert den Betrag je nach Transaktionstyp
  const formatAmount = (amount, type) => {
    const isWithdrawal = type === 'W';
    const amountValue = isWithdrawal ? `-${amount}` : amount;
    
    return (
      <span style={{ color: isWithdrawal ? 'red' : 'inherit' }}>
        {amountValue}
      </span>
    );
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
          saldo={accountData.balance}
          isLoading={isLoading}
          error={error}
          onRefresh={handleRefresh}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      
         {/* Transaction Table */}
        <div className="transaction-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Text</th>
                <th>Datum</th>
                <th>Betrag</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.uuid}>
                  <td>{transaction.text || '-'}</td>
                  <td>{new Date(transaction.transactionTimeStamp).toLocaleDateString()}</td>
                  <td>{formatAmount(transaction.amount, transaction.transactionType)}</td>
                  <td>{transaction.uuid.substring(0, 8)}...</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="4">Keine Transaktionen vorhanden</td>
                </tr>
              )}
            </tbody>
          </table>
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

