import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import i18n from './i18n';
import SearchBar from './components/SearchBar';
import Logo from './components/Logo';
import AccountInfo from './components/AccountInfo';
import DepositModal from './components/DepositModal';
import WithdrawModal from './components/WithdrawModal';

function App({ user, onLogout }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [accountData, setAccountData] = useState({
    accountNumber: '',
    description: t('loadingData'),
    balance: t('loadingBalance')
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
    const accountKeys = ['accountNumber', 'accountId', 'id', 'account', 'number'];
    let accountNumber = accountKeys.find(key => user?.[key]) && user[accountKeys.find(key => user?.[key])];

    if (!user) {
      setError(t('noUser'));
      setIsLoading(false);
      return;
    }

    if (!accountNumber) {
      setError(t('noNumber'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8080/api/accounts/${accountNumber}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      setAccountData({
        accountNumber: data.accountNumber || accountNumber,
        description: data.description || t('noDescription'),
        balance: data.balance || data.saldo || t('noBalance')
      });

      const sortedTransactions = [...(data.transactions || [])].sort(
        (a, b) => new Date(b.transactionTimeStamp) - new Date(a.transactionTimeStamp)
      );

      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
      setError(null);
    } catch (err) {
      setAccountData({
        accountNumber: accountNumber || '1234',
        description: t('demoAccount'),
        balance: '1,234.56 €'
      });

      const mockTransactions = [
        {
          uuid: 'mock-1',
          text: t('demoDeposit'),
          transactionTimeStamp: new Date().toISOString(),
          amount: '100.00',
          transactionType: 'D'
        },
        {
          uuid: 'mock-2',
          text: t('demoWithdraw'),
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
  if (user?.language && user.language !== i18n.language) {
    i18n.changeLanguage(user.language);
  }
}, [user]);

  useEffect(() => {
    fetchAccountData();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredTransactions(transactions);
      return;
    }

    const results = transactions.filter((t) => {
      const text = (t.text || '').toLowerCase();
      const date = new Date(t.transactionTimeStamp).toLocaleDateString().toLowerCase();
      const amount = String(t.amount || '').toLowerCase();
      return text.includes(query) || date.includes(query) || amount.includes(query);
    });

    setFilteredTransactions(results);
  };

  const handleDepositSubmit = async (data) => {
    try {
      setIsLoading(true);
      const accountNumber = user?.accountNumber || user?.accountId || user?.id;

      const response = await fetch('http://localhost:8080/api/accounts/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountId: accountNumber, accountNumber })
      });

      if (!response.ok) {
        throw new Error(t('depositFailed'));
      }

      await fetchAccountData();
      return { success: true, message: t('depositSuccess') };
    } catch (error) {
      return { success: false, message: `${t('error')}: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawSubmit = async (data) => {
    try {
      setIsLoading(true);
      const accountNumber = user?.accountNumber || user?.accountId || user?.id;

      const response = await fetch('http://localhost:8080/api/accounts/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, accountId: accountNumber, accountNumber })
      });

      if (!response.ok) {
        throw new Error(t('withdrawFailed'));
      }

      await fetchAccountData();
      return { success: true, message: t('withdrawSuccess') };
    } catch (error) {
      return { success: false, message: `${t('error')}: ${error.message}` };
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount, type) => {
    const isWithdrawal = type === 'W';
    const formatted = isWithdrawal ? `-${amount}` : amount;
    return <span style={{ color: isWithdrawal ? 'red' : 'inherit' }}>{formatted}</span>;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
                <div className="dropdown-item">{user?.username || t('unknown')}</div>
                <div className="dropdown-item">{user?.fullname || t('unknown')}</div>
                <button
                  className="dropdown-item logout-button"
                  onClick={() => {
                    onLogout();
                    setIsDropdownOpen(false);
                  }}
                >
                  {t('logout')}
                </button>
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
          onRefresh={fetchAccountData}
          onDeposit={() => setIsDepositModalOpen(true)}
          onWithdraw={() => setIsWithdrawModalOpen(true)}
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
                <th>{t('text')}</th>
                <th>{t('date')}</th>
                <th>{t('amount')}</th>
                <th>{t('id')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.uuid}>
                    <td>{t.text}</td>
                    <td>{new Date(t.transactionTimeStamp).toLocaleDateString()}</td>
                    <td>{formatAmount(t.amount, t.transactionType)}</td>
                    <td>{t.uuid.slice(0, 8)}...</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">{t('noTransactions')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer>
        <div className="footer-links">
          <a href="#">{t('aboutGoogle')}</a>
          <a href="#">{t('ads')}</a>
          <a href="#">{t('company')}</a>
          <a href="#">{t('howSearchWorks')}</a>
        </div>
      </footer>
    </div>
  );
}

export default App;