require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importar o arquivo de conexão (se você tiver criado o config/db.js)
const connectDB = require('./config/db');

// Importar as rotas
const authRoutes = require('./routes/authRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const salaRoutes = require('./routes/salaRoutes'); // Descomente quando criar

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conectar ao Banco
connectDB();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/salas', salaRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API do Scaperoom funcionando 🎭' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});