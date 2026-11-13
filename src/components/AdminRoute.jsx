import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../auth/AuthContext';

const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, roles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  if (!isUserAdmin(user, roles)) {
    return <Navigate to="/admin/login" replace state={{ from: location, adminError: 'This account does not have admin access.' }} />;
  }
  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminRoute;
