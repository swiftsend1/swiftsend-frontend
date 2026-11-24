const DEMO_BALANCE_KEY = 'swiftsend.demoBalance';
const VERIFIED_KEY = 'swiftsend.verified';

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
