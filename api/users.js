// Vercel Serverless Function para gerenciar usuários
import { getRedisClient } from './redis.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const redis = await getRedisClient();

    if (req.method === 'POST') {
      // Criar ou atualizar usuário
      const { id, name, avatar } = req.body;
      
      if (!id || !name) {
        return res.status(400).json({ error: 'ID e nome são obrigatórios' });
      }

      const userData = {
        id,
        name,
        avatar: avatar || null,
        updated_at: new Date().toISOString()
      };

      // Salvar no Redis
      await redis.set(`user:${id}`, JSON.stringify(userData));
      
      // Adicionar à lista de usuários
      const usersList = await redis.sAdd('users:list', id);

      res.json({ 
        ...userData,
        message: 'Usuário salvo com sucesso' 
      });
    } 
    else if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id) {
        // Buscar usuário específico
        const userData = await redis.get(`user:${id}`);
        if (!userData) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(JSON.parse(userData));
      } else {
        // Listar todos os usuários
        const usersList = await redis.sMembers('users:list');
        const users = await Promise.all(
          usersList.map(async (userId) => {
            const userData = await redis.get(`user:${userId}`);
            return userData ? JSON.parse(userData) : null;
          })
        );
        res.json(users.filter(u => u !== null));
      }
    } 
    else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de usuários:', error);
    res.status(500).json({ error: error.message });
  }
}
