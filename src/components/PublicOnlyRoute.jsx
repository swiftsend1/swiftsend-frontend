import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from;
  const fromPath = from?.pathname;
  const destination = fromPath && !['/', '/login', '/register'].includes(fromPath)
    ? `${fromPath}${from?.search || ''}${from?.hash || ''}`
    : '/dashboard';

  return isAuthenticated ? <Navigate to={destination} replace /> : <Outlet />;
};

export default PublicOnlyRoute;
