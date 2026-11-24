const DEMO_BALANCE_KEY = 'swiftsend.demoBalance';
const VERIFIED_KEY = 'swiftsend.verified';
const DEMO_TRANSACTIONS_KEY = 'swiftsend.demoTransactions';

const storage = () => {
  try {
    return sessionStorage;
  } catch {
    return null;
  }
};

export const readDemoBalance = () => {
  try {
    const value = Number(storage()?.getItem(DEMO_BALANCE_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

export const addDemoBalance = (amount) => {
  const increment = Number(amount);
  const next = readDemoBalance() + (Number.isFinite(increment) ? increment : 0);
  storage()?.setItem(DEMO_BALANCE_KEY, String(next));
  return next;
};

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
