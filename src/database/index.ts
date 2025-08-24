import mongoose from 'mongoose';

const { MONGO_URL: mondoUrl } = process.env;

export async function setupMongo() {
  try {
    // Verifica se o mongo esta conectado
    if (mongoose.connection.readyState === 1) {
      // "return" trava para não ficar iniciando
      return;
    }

    console.log('🎲 Connecting to database');
    await mongoose.connect(String(mondoUrl), {
      serverSelectionTimeoutMS: 3000, //3 sec
    });
    console.error('✅ Database  connected...');
  } catch (error) {
    // Estora uma menssage de erro se não conectar
    throw new Error('❌ Database not connected');
  }
}
