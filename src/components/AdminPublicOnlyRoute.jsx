import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../auth/AuthContext';

const isUserAdmin = (user, roles = []) => {
  if (user?.is_staff || user?.is_superuser) return true;
  const allRoles = [...roles, ...(Array.isArray(user?.roles) ? user.roles : [])];
  return allRoles.some((r) => typeof r === 'string' && ['admin', 'staff', 'superuser', 'administrator'].includes(r.toLowerCase()));
};

const AdminPublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user, roles } = useAuth();
  const location = useLocation();
  if (isAuthenticated && isUserAdmin(user, roles)) {
    return <Navigate to="/admin" replace state={location.state} />;
  }
  return children;
};

AdminPublicOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminPublicOnlyRoute;
