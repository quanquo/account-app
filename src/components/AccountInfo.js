import React from 'react';

function AccountInfo({ 
  accountNumber, 
  description, 
  isLoading, 
  error, 
  onRefresh, 
  onDeposit, 
  onWithdraw 
}) {
  return (
    <div className={`account-info ${isLoading ? 'loading' : ''} ${error ? 'error' : ''}`}>
      <div className="account-details">
        <div className="account-label">Account:</div>
        <div className="account-id">
          {isLoading ? '...' : accountNumber}
        </div>
        <div className="account-description">
          {error || description}
        </div>
      </div>
      
      <div className="account-actions">
        <button 
          className="action-button refresh-button" 
          onClick={onRefresh} 
          disabled={isLoading}
          title="Refresh"
        >
          <span role="img" aria-label="Aktualisieren">🔄</span>
        </button>
        <button 
          className="action-button deposit-button" 
          onClick={onDeposit}
          title="Deposit"
        >
          <span role="img" aria-label="Einzahlen">💰</span>
        </button>
        <button 
          className="action-button withdraw-button" 
          onClick={onWithdraw}
          title="Withdraw"
        >
          <span role="img" aria-label="Auszahlen">💸</span>
        </button>
      </div>
    </div>
  );
}

export default AccountInfo;