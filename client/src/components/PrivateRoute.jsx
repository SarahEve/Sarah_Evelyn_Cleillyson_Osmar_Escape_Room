import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { usuario, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}