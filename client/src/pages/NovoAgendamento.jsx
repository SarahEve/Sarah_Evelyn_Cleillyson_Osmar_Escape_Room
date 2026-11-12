import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function NovoAgendamento() {
  const [searchParams] = useSearchParams();
  const salaIdParam = searchParams.get('salaId');

  const [salas, setSalas] = useState([]);
  const [salaId, setSalaId] = useState(salaIdParam || '');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const horariosDisponiveis = ['10:00', '14:00', '16:00', '19:00'];

  useEffect(() => {
    const buscarSalas = async () => {
      try {
        const response = await api.get('/salas');
        setSalas(response.data);
        if (!salaIdParam && response.data.length > 0) {
          setSalaId(response.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    buscarSalas();
  }, [salaIdParam]);

  // Busca os horários ocupados sempre que a sala ou a data mudar
  useEffect(() => {
    if (!salaId || !data) return;

    const buscarHorarios = async () => {
      setBuscandoHorarios(true);
      setHora(''); 
      try {
        const response = await api.get(`/salas/${salaId}/horarios?data=${data}`);
      
        // 👇 A MÁGICA ESTÁ AQUI (para ler qualquer formato que o backend mandar)
        let ocupados = response.data;
        if (response.data && response.data.horarios) {
          ocupados = response.data.horarios; // Se o backend mandou { horarios: [...] }
        }
        
        setHorariosOcupados(ocupados);
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
      } finally {
        setBuscandoHorarios(false);
      }
    };

    buscarHorarios();
  }, [salaId, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hora) return setErro('Selecione um horário disponível');
    
    setErro('');
    setLoading(true);

    try {
      await api.post('/agendamentos', { sala: salaId, data, hora });
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
      
      {erro && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{erro}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sala:</label>
          <select value={salaId} onChange={e => setSalaId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
            {salas.map(s => <option key={s._id} value={s._id}>{s.nome}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Data:</label>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        {/* GRADE DE HORÁRIOS */}
        {data && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Horário:</label>
            {buscandoHorarios ? (
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Verificando disponibilidade...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {horariosDisponiveis.map(h => {
                  const ocupado = horariosOcupados.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={ocupado}
                      onClick={() => setHora(h)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '4px',
                        border: hora === h ? '2px solid #2563eb' : '1px solid #ccc',
                        background: ocupado ? '#e2e8f0' : hora === h ? '#dbeafe' : '#fff',
                        color: ocupado ? '#94a3b8' : '#1e293b',
                        cursor: ocupado ? 'not-allowed' : 'pointer',
                        textDecoration: ocupado ? 'line-through' : 'none',
                        fontWeight: hora === h ? 'bold' : 'normal'
                      }}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            )}
            {horariosOcupados.length > 0 && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>* Horários riscados já estão ocupados.</p>}
          </div>
        )}

        <button type="submit" disabled={loading || !hora} style={{ marginTop: '1rem', padding: '0.75rem', background: (loading || !hora) ? '#94a3b8' : '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: (loading || !hora) ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Enviando...' : 'Solicitar Agendamento'}
        </button>
      </form>
    </div>
  );
}