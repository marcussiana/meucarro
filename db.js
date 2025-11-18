const mongoose = require('mongoose');
const path = require('path');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/garagem_conectada_db';
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB conectado em', uri);
    return true;
  } catch (err) {
    console.error('Falha ao conectar ao MongoDB:', err.message);
    return false;
  }
}

module.exports = { connectDB };