import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('@scaperoom:token');
    const userStorage = localStorage.getItem('@scaperoom:usuario');

    if (token && userStorage) {
      setUsuario(JSON.parse(userStorage));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    const { token, usuario } = response.data;

    localStorage.setItem('@scaperoom:token', token);
    localStorage.setItem('@scaperoom:usuario', JSON.stringify(usuario));
    setUsuario(usuario);

    return usuario;
  };

  const logout = () => {
    localStorage.removeItem('@scaperoom:token');
    localStorage.removeItem('@scaperoom:usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}