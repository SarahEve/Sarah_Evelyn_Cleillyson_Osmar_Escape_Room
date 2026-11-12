import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const usuario = await login(email, senha);
      
      if (usuario.role === 'admin') {
        navigate('/admin/pedidos');
      } else {
        navigate('/salas');
      }
    } catch (err) {
      // 🕵️‍♂️ A MÁGICA ESTÁ AQUI: Tenta ler o erro de todas as formas possíveis
      let mensagem = 'E-mail ou senha incorretos';
      
      if (err.response && err.response.data) {
        // Se o backend mandou { erro: "..." } ou { mensagem: "..." } ou { message: "..." }
        mensagem = err.response.data.erro || err.response.data.mensagem || err.response.data.message || mensagem;
      } else if (err.message) {
        // Se for um erro de rede (ex: backend desligado)
        mensagem = 'Erro de conexão: ' + err.message;
      }
      
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h1>
      
      {/* CAIXA VERMELHA DE ERRO */}
      {erro !== '' && (
        <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
          {erro}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={e => setSenha(e.target.value)} 
          required 
          style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: '0.75rem', background: loading ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>Não tem conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
}