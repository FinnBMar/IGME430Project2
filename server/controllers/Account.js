// server/controllers/Account.js
const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/app' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username is already in use.' });
    }

    return res.status(500).json({ error: 'An error occurred creating your account.' });
  }
};

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password.' });
    }

    req.session.account = Account.toAPI(account);
    return res.json({ redirect: '/app' });
  });
};

// Render account/settings page
const accountPage = (req, res) => res.render('account');

// Return basic account data as JSON
const getAccount = async (req, res) => {
  try {
    const doc = await Account.findById(req.session.account._id)
      .select('username isPremium')
      .lean()
      .exec();

    if (!doc) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    return res.json({ account: doc });
  } catch (err) {
    return res.status(500).json({ error: 'Error retrieving account data.' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { oldPass, newPass, newPass2 } = req.body;

  if (!oldPass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  try {
    const { username } = req.session.account;

    // Verify old password
    return Account.authenticate(username, oldPass, async (err, accountDoc) => {
      if (err || !accountDoc) {
        return res.status(401).json({ error: 'Old password is incorrect.' });
      }

      const hash = await Account.generateHash(newPass);

      // ✅ Avoid no-param-reassign by not doing accountDoc.password = hash
      accountDoc.set({ password: hash });
      await accountDoc.save();

      return res.json({ message: 'Password updated successfully.' });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error changing password.' });
  }
};

// Toggle premium flag and update session
const togglePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();
    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.isPremium = !account.isPremium;
    await account.save();

    // Update session
    req.session.account = Account.toAPI(account);

    return res.json({ isPremium: account.isPremium });
  } catch (err) {
    return res.status(500).json({ error: 'Error updating premium status.' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  accountPage,
  getAccount,
  changePassword,
  togglePremium,
};
