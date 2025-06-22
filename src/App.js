import React, { useState, useEffect, useRef } from 'react';
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
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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

      const sortedTransactions = [...(data.transactions || [])].sort((a, b) => {
        return new Date(b.transactionTimeStamp) - new Date(a.transactionTimeStamp);
      });

      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions); // Initial für Anzeige
      setError(null);
    } catch (err) {
      setAccountData({
        accountNumber: accountNumber || '1234',
        description: 'Demo-Konto (API nicht erreichbar)',
        balance: '1,234.56 €'
      });

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
      setFilteredTransactions(mockTransactions);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountData();
  }, [user]);

  const handleRefresh = () => {
    fetchAccountData();
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredTransactions(transactions);
      return;
    }

    const results = transactions.filter((transaction) => {
      const text = (transaction.text || '').toLowerCase();
      const date = new Date(transaction.transactionTimeStamp).toLocaleDateString().toLowerCase();
      const amount = String(transaction.amount || '').toLowerCase();

      return (
        text.includes(query) ||
        date.includes(query) ||
        amount.includes(query)
      );
    });

    setFilteredTransactions(results);
  };

  const handleDeposit = () => {
    setIsDepositModalOpen(true);
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleLogout = () => {
    onLogout();
    setIsDropdownOpen(false);
  };

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

  const formatAmount = (amount, type) => {
    const isWithdrawal = type === 'W';
    const amountValue = isWithdrawal ? `-${amount}` : amount;

    return (
      <span style={{ color: isWithdrawal ? 'red' : 'inherit' }}>
        {amountValue}
      </span>
    );
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="app">
      <div className="search-container">
        <div className="header-container">
          <Logo />
          <div className="user-info" ref={dropdownRef}>
            <button className="user-icon-button" onClick={toggleDropdown}>👤</button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item">{user?.username || 'Unbekannt'}</div>
                <div className="dropdown-item">{user?.fullname || 'Unbekannt'}</div>
                <button className="dropdown-item logout-button" onClick={handleLogout}>Abmelden</button>
              </div>
            )}
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
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.uuid}>
                    <td>{transaction.text || ''}</td>
                    <td>{new Date(transaction.transactionTimeStamp).toLocaleDateString()}</td>
                    <td>{formatAmount(transaction.amount, transaction.transactionType)}</td>
                    <td>{transaction.uuid.substring(0, 8)}...</td>
                  </tr>
                ))
              ) : (
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
