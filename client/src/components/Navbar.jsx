import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // <-- Importando o CSS

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/salas" className="navbar-brand">🎭 Scaperoom</Link>
        
        <Link to="/salas" className="nav-link">Salas</Link>
        <Link to="/meus-agendamentos" className="nav-link">Meus Agendamentos</Link>
        
        {usuario.role === 'admin' && (
          <Link to="/admin/pedidos" className="nav-link admin-link">
            Painel Admin
          </Link>
        )}
      </div>

      <div className="navbar-user">
        <span>
          Olá, <strong>{usuario.nome}</strong> ({usuario.role})
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Sair
        </button>
      </div>
    </nav>
  );
}