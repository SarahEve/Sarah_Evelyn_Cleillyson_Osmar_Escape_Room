const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');
  } catch (erro) {
    console.error('❌ Erro ao conectar MongoDB:', erro.message);
    process.exit(1); // Para o servidor se não conectar
  }
};

module.exports = connectDB;