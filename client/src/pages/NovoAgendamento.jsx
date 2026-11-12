import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function NovoAgendamento() {
  const [searchParams] = useSearchParams();
  const salaIdParam = searchParams.get('salaId'); // Pega o ID que passamos na tela anterior

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState(salaIdParam || '');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Carrega as salas para o select (caso o usuário entre direto pela rota)
  useEffect(() => {
    const buscarSalas = async () => {
      try {
        const response = await api.get('/salas');
        setSalas(response.data);
        if (!salaIdParam && response.data.length > 0) {
          setSalaId(response.data[0]._id); // Seleciona a primeira por padrão
        }
      } catch (err) {
        console.error(err);
      }
    };
    buscarSalas();
  }, [salaIdParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/agendamentos', {
        sala: salaId,
        data, // O backend espera YYYY-MM-DD, o input type="date" já manda assim
        hora
      });
      alert('Agendamento solicitado com sucesso! Aguarde a aprovação.');
      navigate('/meus-agendamentos');
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao criar agendamento';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '2rem auto', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Novo Agendamento</h1>
      
      {erro && (
        <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sala:</label>
          <select value={salaId} onChange={e => setSalaId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            {salas.map(s => (
              <option key={s._id} value={s._id}>{s.nome} (Até {s.capacidade} pessoas)</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Data:</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Horário:</label>
          <select value={hora} onChange={e => setHora(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="">Selecione um horário</option>
            <option value="10:00">10:00</option>
            <option value="14:00">14:00</option>
            <option value="16:00">16:00</option>
            <option value="19:00">19:00</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Enviando...' : 'Solicitar Agendamento'}
        </button>
      </form>
    </div>
  );
}