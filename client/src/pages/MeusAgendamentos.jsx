import { useState, useEffect } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarAgendamentos = async () => {
    try {
      const response = await api.get('/agendamentos/meus');
      setAgendamentos(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const cancelarAgendamento = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    
    try {
      await api.patch(`/agendamentos/${id}/cancelar`);
      carregarAgendamentos(); // Recarrega a lista após cancelar
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao cancelar');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Meus Agendamentos</h1>
      
      {agendamentos.length === 0 ? (
        <p>Você ainda não tem nenhum agendamento.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {agendamentos.map((ag) => (
            <div key={ag._id} style={{ background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{ag.sala?.nome || 'Sala'}</h3>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  {new Date(ag.data).toLocaleDateString('pt-BR')} às {ag.hora}
                </p>
                <span style={{ 
                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                  background: ag.status === 'aprovado' ? '#dcfce7' : ag.status === 'recusado' ? '#fee2e2' : ag.status === 'cancelado' ? '#f3f4f6' : '#fef3c7',
                  color: ag.status === 'aprovado' ? '#166534' : ag.status === 'recusado' ? '#991b1b' : ag.status === 'cancelado' ? '#374151' : '#92400e'
                }}>
                  {ag.status.toUpperCase()}
                </span>
              </div>
              
              {/* Só permite cancelar se estiver pendente */}
              {ag.status === 'pendente' && (
                <button 
                  onClick={() => cancelarAgendamento(ag._id)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}