import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectUserRole } from '../store/slices/authSlice.js';

export default function ProtectedRoute({ allowedRoles }) {
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectUserRole);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/organizer'} replace />;
  }
  return <Outlet />;
}
