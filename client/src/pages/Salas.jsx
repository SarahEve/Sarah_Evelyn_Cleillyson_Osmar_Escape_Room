import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Salas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarSalas = async () => {
      try {
        const response = await api.get('/salas');
        setSalas(response.data);
      } catch (err) {
        console.error('Erro ao buscar salas:', err);
      } finally {
        setLoading(false);
      }
    };
    buscarSalas();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando salas...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Escolha sua Sala</h1>
      
      {salas.length === 0 ? (
        <p>Nenhuma sala disponível no momento.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {salas.map((sala) => (
            <div key={sala._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>{sala.nome}</h2>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>{sala.descricao}</p>
                <p style={{ fontSize: '0.9rem', color: '#334155' }}>👥 Capacidade: <strong>{sala.capacidade} pessoas</strong></p>
              </div>
              <Link 
                to={`/novo-agendamento?salaId=${sala._id}`} // Passa o ID da sala pela URL
                style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', background: '#2563eb', color: '#fff', padding: '0.75rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
              >
                Agendar Horário
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}