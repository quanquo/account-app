import React, { useState, useEffect } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import Logo from './components/Logo';
import AccountInfo from './components/AccountInfo';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';

function App({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountData, setAccountData] = useState({
    accountNumber: '',
    description: 'Lade Daten...',
    saldo: 'Lade Saldo...'
  });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  // API-Aufruf, um Account-Daten zu laden
  const fetchAccountData = async () => {
    const possibleAccountKeys = ['accountNumber', 'accountId', 'id', 'account', 'number'];
    let accountNumber = null;
    
    if (user) {
      for (const key of possibleAccountKeys) {
        if (user[key]) {
          accountNumber = user[key];
          break;
        }
      }
    }
    
    if (!accountNumber) {
      accountNumber = user?.accountNumber;
    }
    
    if (!user) {
      setError('Benutzer nicht verfügbar');
      setIsLoading(false);
      return;
    }
    
    if (!accountNumber || accountNumber === '') {
      setError('Keine Kontonummer verfügbar - Bitte prüfen Sie die Anmeldedaten');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const apiUrl = `http://localhost:8080/api/accounts/${accountNumber}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API-Fehler: ${response.status} - ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      setAccountData({
        accountNumber: data.accountNumber || accountNumber || 'Keine Nummer',
        description: data.description || 'Keine Beschreibung',
        balance: data.balance || data.saldo || 'Kein Saldo'
      });
      
      // Setze die Transaktionen aus der API-Antwort und sortiere sie nach Datum absteigend
      const sortedTransactions = [...(data.transactions || [])].sort((a, b) => {
        return new Date(b.transactionTimeStamp) - new Date(a.transactionTimeStamp);
      });
      
      setTransactions(sortedTransactions);
      setError(null);
      
    } catch (err) {
      // Verwende Mock-Daten für Demo-Zwecke wenn API nicht verfügbar
      setAccountData({
        accountNumber: accountNumber || '1234',
        description: 'Demo-Konto (API nicht erreichbar)',
        balance: '1,234.56 €'
      });
      
      // Mock-Transaktionen für Demo
      const mockTransactions = [
        {
          uuid: 'mock-1',
          text: 'Demo Einzahlung',
          transactionTimeStamp: new Date().toISOString(),
          amount: '100.00',
          transactionType: 'D'
        },
        {
          uuid: 'mock-2',
          text: 'Demo Auszahlung',
          transactionTimeStamp: new Date(Date.now() - 86400000).toISOString(),
          amount: '50.00',
          transactionType: 'W'
        }
      ];
      
      setTransactions(mockTransactions);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialer Aufruf beim Laden der Komponente
  useEffect(() => {
    fetchAccountData();
  }, [user]);

  // Refresh-Handler für den Button
  const handleRefresh = () => {
    fetchAccountData();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Sie haben nach "${searchQuery}" gesucht`);
  };

  const handleDeposit = () => {
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleLogout = () => {
    onLogout();
  };

  // Verarbeitet die Einzahlung nach Absenden des Formulars
  const handleDepositSubmit = async (depositData) => {
    try {
      setIsLoading(true);
      
      const accountNumber = user?.accountNumber || user?.accountId || user?.id;
      
      const response = await fetch('http://localhost:8080/api/accounts/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...depositData,
          accountId: accountNumber,
          accountNumber: accountNumber
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Einzahlung fehlgeschlagen: ${response.statusText}`);
      }
      
      await fetchAccountData();
      return { success: true, message: 'Einzahlung erfolgreich!' };
      
    } catch (error) {
      return { success: false, message: `Fehler: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  // Verarbeitet die Auszahlung nach Absenden des Formulars
  const handleWithdrawSubmit = async (withdrawData) => {
    try {
      setIsLoading(true);
      
      const accountNumber = user?.accountNumber || user?.accountId || user?.id;
      
      const response = await fetch('http://localhost:8080/api/accounts/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...withdrawData,
          accountId: accountNumber,
          accountNumber: accountNumber
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Auszahlung fehlgeschlagen: ${response.statusText}`);
      }
      
      await fetchAccountData();
      return { success: true, message: 'Auszahlung erfolgreich!' };
      
    } catch (error) {
      return { success: false, message: `Fehler: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
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
        <div className="header-container">
          <Logo />
          <div className="user-info">
            <span>Angemeldet als: {user?.username || 'Unbekannt'}</span>
            <button className="logout-button" onClick={handleLogout}>Abmelden</button>
          </div>
        </div>
        
        <SearchBar 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
        />
        
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
      
        <DepositModal 
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
          onSubmit={handleDepositSubmit}
          accountNumber={accountData.accountNumber}
        />

        <WithdrawModal 
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          onSubmit={handleWithdrawSubmit}
          accountNumber={accountData.accountNumber}
        />
      
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