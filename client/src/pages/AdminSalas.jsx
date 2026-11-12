import { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function AdminSalas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);

  // Buscar salas
  const carregarSalas = async () => {
    try {
      // Passamos ?todas=true para o backend saber que é o admin e trazer até as inativas
      const response = await api.get('/salas?todas=true');
      setSalas(response.data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarSalas();
  }, []);

  // Criar nova sala
  const handleCriarSala = async (e) => {
    e.preventDefault();
    setErro('');
    setCriando(true);

    try {
      await api.post('/salas', { 
        nome, 
        capacidade: Number(capacidade), 
        descricao 
      });
      
      // Limpa o formulário e recarrega a lista
      setNome('');
      setCapacidade('');
      setDescricao('');
      carregarSalas();
      alert('Sala cadastrada com sucesso!');
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao cadastrar sala';
      setErro(msg);
    } finally {
      setCriando(false);
    }
  };

  // Deletar sala
  const handleDeletarSala = async (id, nomeSala) => {
    if (!window.confirm(`Tem certeza que deseja excluir a "${nomeSala}"? Agendamentos vinculados podem ser perdidos.`)) return;
    
    try {
      await api.delete(`/salas/${id}`);
      carregarSalas();
      alert('Sala excluída com sucesso!');
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao excluir sala');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <h1 style={{ margin: 0 }}>Gerenciar Salas</h1>

      {/* FORMULÁRIO DE CRIAÇÃO */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.2rem' }}>Cadastrar Nova Sala</h2>
        
        {erro && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>{erro}</div>}

        <form onSubmit={handleCriarSala} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Nome da Sala (ex: Sala Pirata)" 
            value={nome} 
            onChange={e => setNome(e.target.value)} 
            required 
            style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <input 
            type="number" 
            placeholder="Capacidade (ex: 4)" 
            min="1"
            max="20"
            value={capacidade} 
            onChange={e => setCapacidade(e.target.value)} 
            required 
            style={{ flex: '0 1 150px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <input 
            type="text" 
            placeholder="Descrição curta (opcional)" 
            value={descricao} 
            onChange={e => setDescricao(e.target.value)} 
            style={{ flex: '2 1 250px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
          />
          <button 
            type="submit" 
            disabled={criando}
            style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: criando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {criando ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* LISTA DE SALAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {salas.map(sala => (
          <div key={sala._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{sala.nome}</h3>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>{sala.descricao || 'Sem descrição'}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>👥 Capacidade: {sala.capacidade}</p>
            </div>
            
            <button 
              onClick={() => handleDeletarSala(sala._id, sala.nome)}
              style={{ marginTop: '1rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Excluir Sala
            </button>
          </div>
        ))}
        {salas.length === 0 && <p>Nenhuma sala cadastrada.</p>}
      </div>

    </div>
  );
}