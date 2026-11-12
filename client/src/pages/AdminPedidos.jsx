import { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function AdminPedidos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca todos os agendamentos no backend
  const carregarAgendamentos = async () => {
    try {
      const response = await api.get('/agendamentos');
      setAgendamentos(response.data);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
      alert('Erro ao carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  // Função para aprovar ou recusar
  const mudarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/agendamentos/${id}/${novoStatus}`);
      // Atualiza a lista na tela
      carregarAgendamentos();
    } catch (err) {
      alert('Erro ao atualizar o status.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Painel do Administrador</h1>
      
      {agendamentos.length === 0 ? (
        <p>Nenhum agendamento encontrado no sistema.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agendamentos.map((ag) => (
            <div key={ag._id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              
              <div>
                {/* Como o backend usa populate, podemos acessar ag.sala.nome */}
                <h3 style={{ margin: 0 }}>{ag.sala?.nome || 'Sala Desconhecida'}</h3>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  Data: <strong>{new Date(ag.data).toLocaleDateString('pt-BR')}</strong> às <strong>{ag.hora}</strong>
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Cliente: {ag.usuario?.nome} ({ag.usuario?.email})
                </p>
                <span style={{ 
                  display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                  background: ag.status === 'aprovado' ? '#dcfce7' : ag.status === 'recusado' ? '#fee2e2' : '#fef3c7',
                  color: ag.status === 'aprovado' ? '#166534' : ag.status === 'recusado' ? '#991b1b' : '#92400e'
                }}>
                  {ag.status.toUpperCase()}
                </span>
              </div>

              {/* Botões de ação (só aparecem se estiver pendente) */}
              {ag.status === 'pendente' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => mudarStatus(ag._id, 'aprovar')}
                    style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Aprovar
                  </button>
                  <button 
                    onClick={() => mudarStatus(ag._id, 'recusar')}
                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}