import { Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AppShell from './components/AppShell';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminPublicOnlyRoute from './components/AdminPublicOnlyRoute';

import Home from './pages/Home';
import ReceiveMoney from './pages/ReceiveMoney';
import ExchangeRates from './pages/ExchangeRates';
import Dashboard from './pages/Dashboard';
import Help from './pages/Help';
import Verify from './pages/Verify';
import SendMoney from './pages/SendMoney';
import Wallet from './pages/Wallet';
import History from './pages/History';
import Track from './pages/Track';
import Profile from './pages/Profile';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rates" element={<ExchangeRates />} />
        <Route path="help" element={<Help />} />
        <Route path="verify" element={<Verify />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="send" element={<SendMoney />} />
            <Route path="receive" element={<ReceiveMoney />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="history" element={<History />} />
            <Route path="track" element={<Track />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Route>

      {/* Separate admin area */}
      <Route path="/admin/login" element={<AdminPublicOnlyRoute><AdminLogin /></AdminPublicOnlyRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
