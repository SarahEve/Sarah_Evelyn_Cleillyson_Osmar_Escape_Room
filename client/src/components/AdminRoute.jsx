import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { usuario, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  if (!usuario) return <Navigate to="/login" replace />;
  
  return usuario.role === 'admin' ? <Outlet /> : <Navigate to="/salas" replace />;
}