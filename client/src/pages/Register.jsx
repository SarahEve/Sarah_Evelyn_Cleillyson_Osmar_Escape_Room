import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/auth/register', { nome, email, senha });
      alert('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '2rem auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Cadastro</h1>
      {erro && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{erro}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>Já tem conta? <Link to="/login">Faça login</Link></p>
    </div>
  );
}