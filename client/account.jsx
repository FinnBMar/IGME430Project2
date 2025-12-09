// client/account.jsx
const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const AccountInfo = ({ account, onTogglePremium, premiumUpdating }) => {
  if (!account) {
    return (
      <div className="panel">
        <p className="muted">Loading account...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Account</h2>
      <p><strong>Username:</strong> {account.username}</p>
      <p>
        <strong>Status:</strong>{' '}
        {account.isPremium ? 'Premium' : 'Free'}
      </p>
      <button
        type="button"
        className="button"
        onClick={onTogglePremium}
        disabled={premiumUpdating}
      >
        {premiumUpdating
          ? 'Updating...'
          : account.isPremium
            ? 'Disable Premium (demo)'
            : 'Enable Premium (demo)'}
      </button>
      <p className="muted" style={{ marginTop: '8px', fontSize: '0.85rem' }}>
        Premium is a demo toggle only. No real payments are processed.
      </p>
    </div>
  );
};

const handlePasswordChange = (e, onSuccess) => {
  e.preventDefault();
  helper.hideError();

  const oldPass = e.target.querySelector('#oldPass').value;
  const newPass = e.target.querySelector('#newPass').value;
  const newPass2 = e.target.querySelector('#newPass2').value;

  if (!oldPass || !newPass || !newPass2) {
    helper.handleError('All fields are required.');
    return false;
  }
  if (newPass !== newPass2) {
    helper.handleError('New passwords do not match.');
    return false;
  }

  helper.sendPost('/account/changePassword', { oldPass, newPass, newPass2 }, (res) => {
    if (res.message) {
      // Clear fields
      e.target.reset();
      helper.handleError(res.message); // reuse alert box as a general message
      const alertBox = document.getElementById('alertMessage');
      if (alertBox) {
        alertBox.classList.remove('hidden');
      }
      if (onSuccess) onSuccess();
    }
  });

  return false;
};

const PasswordForm = ({ onPasswordChanged }) => (
  <form
    id="passwordForm"
    name="passwordForm"
    onSubmit={(e) => handlePasswordChange(e, onPasswordChanged)}
    className="panel form-panel"
  >
    <h2>Change Password</h2>

    <label htmlFor="oldPass">Current Password:</label>
    <input id="oldPass" type="password" name="oldPass" />

    <label htmlFor="newPass">New Password:</label>
    <input id="newPass" type="password" name="newPass" />

    <label htmlFor="newPass2">Confirm New Password:</label>
    <input id="newPass2" type="password" name="newPass2" />

    <input className="button primary" type="submit" value="Update Password" />
  </form>
);

const AccountApp = () => {
  const [account, setAccount] = useState(null);
  const [premiumUpdating, setPremiumUpdating] = useState(false);

  const loadAccount = async () => {
    const response = await fetch('/account/data');
    const data = await response.json();
    setAccount(data.account);
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const onTogglePremium = () => {
    setPremiumUpdating(true);
    helper.sendPost('/account/togglePremium', {}, (res) => {
      if (res && typeof res.isPremium === 'boolean') {
        setAccount((prev) => ({
          ...prev,
          isPremium: res.isPremium,
        }));
      }
      setPremiumUpdating(false);
    });
  };

  return (
    <div className="layout">
      <section className="column">
        <AccountInfo
          account={account}
          onTogglePremium={onTogglePremium}
          premiumUpdating={premiumUpdating}
        />
      </section>
      <section className="column">
        <PasswordForm onPasswordChanged={() => {}} />
      </section>
    </div>
  );
};

const init = () => {
  const rootElem = document.getElementById('accountRoot');
  if (!rootElem) return;

  const root = createRoot(rootElem);
  root.render(<AccountApp />);
};

window.onload = init;
