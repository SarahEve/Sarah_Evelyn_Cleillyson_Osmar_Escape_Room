import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Salas from './pages/Salas';
import MeusAgendamentos from './pages/MeusAgendamentos';
import AdminPedidos from './pages/AdminPedidos';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rotas Protegidas (User e Admin) */}
      <Route element={<PrivateRoute />}>
        <Route path="/salas" element={<Salas />} />
        <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
      </Route>

      {/* Rotas Exclusivas Admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/pedidos" element={<AdminPedidos />} />
      </Route>

      {/* Redirecionamento padrão */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;