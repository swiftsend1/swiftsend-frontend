const DEMO_WALLETS_KEY = 'swiftsend.demoWallets';
const DEMO_TRANSACTIONS_KEY = 'swiftsend.demoTransactions';
const DEMO_USERS_KEY = 'swiftsend.demoUsers';
const VERIFIED_KEY = 'swiftsend.verified';
const SESSION_STORAGE_KEY = 'swiftsend.session';

const storage = () => {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
};

export const getCurrentUserEmail = () => {
  try {
    const session = JSON.parse(storage()?.getItem(SESSION_STORAGE_KEY) || 'null');
    return session?.user?.email || null;
  } catch {
    return null;
  }
};

const readDemoUsers = () => {
  try {
    const parsed = JSON.parse(storage()?.getItem(DEMO_USERS_KEY) || 'null');
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const getDemoUsers = () => {
  const stored = readDemoUsers();
  if (stored) return stored;
  const users = [];
  const current = getCurrentUserEmail();
  if (current) users.push(current);
  ['demo.alice@swiftsend.app', 'demo.bob@swiftsend.app', 'demo.carol@swiftsend.app'].forEach((email) => {
    if (!users.includes(email)) users.push(email);
  });
  storage()?.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  return users;
};

const readDemoWallets = () => {
  try {
    const parsed = JSON.parse(storage()?.getItem(DEMO_WALLETS_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getWalletBalance = (email) => {
  const wallets = readDemoWallets();
  const value = Number(wallets[email]);
  return Number.isFinite(value) ? value : 0;
};

export const adjustWalletBalance = (email, delta) => {
  const wallets = readDemoWallets();
  const amount = Number(delta) || 0;
  const next = { ...wallets, [email]: getWalletBalance(email) + amount };
  storage()?.setItem(DEMO_WALLETS_KEY, JSON.stringify(next));
  return next[email];
};

export const readDemoBalance = () => getWalletBalance(getCurrentUserEmail() || 'anonymous');

export const addDemoBalance = (amount) => adjustWalletBalance(getCurrentUserEmail() || 'anonymous', Number(amount) || 0);

export const setVerified = (value) => {
  storage()?.setItem(VERIFIED_KEY, String(Boolean(value)));
};

export const isVerified = () => {
  try {
    return storage()?.getItem(VERIFIED_KEY) === 'true';
  } catch {
    return false;
  }
};

export const formatWalletAmount = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value) || 0);

export const readDemoTransactions = () => {
  try {
    const parsed = JSON.parse(storage()?.getItem(DEMO_TRANSACTIONS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addDemoTransaction = (entry) => {
  const transactions = readDemoTransactions();
  const next = [
    ...transactions,
    {
      id: `SS-${Date.now().toString(36).toUpperCase()}`,
      status: 'completed',
      at: new Date().toISOString(),
      ...entry,
    },
  ];
  storage()?.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(next));
  return next;
};

export const runDemoTransfer = ({ from, to, amount }) => {
  const value = Number(amount) || 0;
  const senderBalance = adjustWalletBalance(from, -value);
  const recipientBalance = adjustWalletBalance(to, value);
  const transactions = addDemoTransaction({ from, to, amount: String(value), status: 'completed', at: new Date().toISOString() });
  return { senderBalance, recipientBalance, reference: transactions[transactions.length - 1]?.reference };
};
