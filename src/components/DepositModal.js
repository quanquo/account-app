import React, { useState } from 'react';
import './DepositModal.css';

function DepositModal({ isOpen, onClose, onSubmit, accountNumber }) {
  const [amount, setAmount] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validierung
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Bitte geben Sie einen gültigen Betrag ein (größer 0)');
      setSuccess('');
      return;
    }
    
    // Submit starten
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Submit und auf Antwort warten
      const result = await onSubmit({
        accountNumber,
        text: text || '', // Falls leer, leeren String senden
        amount: numAmount
      });
      
      if (result && result.success) {
        // Bei Erfolg Nachricht anzeigen
        setSuccess(result.message);
        // Felder zurücksetzen
        setAmount('');
        setText('');
      } else {
        // Bei Fehler Fehlermeldung anzeigen
        setError(result?.message || 'Einzahlung fehlgeschlagen');
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Zurücksetzen und schließen
    setAmount('');
    setText('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Einzahlung</h2>
        
        {success ? (
          <div>
            <div className="success-message">{success}</div>
            <div className="button-group">
              <button type="button" onClick={handleClose} className="close-button">
                Schließen
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="amount">Betrag:</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="text">Beschreibung (optional):</label>
              <input
                type="text"
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="button-group">
              <button 
                type="button" 
                onClick={handleClose} 
                className="cancel-button"
                disabled={isSubmitting}
              >
                Abbrechen
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Wird verarbeitet...' : 'Einzahlen'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DepositModal;