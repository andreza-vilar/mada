// Vercel Serverless Function para gerenciar presenças
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
      // Marcar ou desmarcar presença
      const { userId, showId } = req.body;
      
      if (!userId || !showId) {
        return res.status(400).json({ error: 'userId e showId são obrigatórios' });
      }

      const attendanceKey = `attendance:${showId}:${userId}`;
      const showAttendancesKey = `show:${showId}:attendances`;
      
      // Verificar se já existe
      const exists = await redis.exists(attendanceKey);
      
      if (exists) {
        // Remover presença
        await redis.del(attendanceKey);
        
        // Remover da lista do show
        await redis.sRem(showAttendancesKey, userId);
        
        // Remover da lista de shows do usuário
        const userShowsKey = `user:${userId}:shows`;
        await redis.sRem(userShowsKey, String(showId));
        
        res.json({ 
          userId, 
          showId, 
          attending: false,
          message: 'Presença removida' 
        });
      } else {
        // Adicionar presença
        const attendanceData = {
          userId,
          showId,
          createdAt: new Date().toISOString()
        };
        
        await redis.set(attendanceKey, JSON.stringify(attendanceData));
        
        // Adicionar à lista do show (usando Set para evitar duplicatas)
        await redis.sAdd(showAttendancesKey, userId);
        
        // Adicionar à lista de shows do usuário
        const userShowsKey = `user:${userId}:shows`;
        await redis.sAdd(userShowsKey, String(showId));
        
        // Adicionar à lista global de shows
        await redis.sAdd('all:shows', String(showId));
        
        res.json({ 
          userId, 
          showId, 
          attending: true,
          message: 'Presença confirmada' 
        });
      }
    } 
    else if (req.method === 'GET') {
      const { showId, userId, check } = req.query;
      
      if (check && userId && showId) {
        // Verificar se usuário está presente
        const attendanceKey = `attendance:${showId}:${userId}`;
        const exists = await redis.exists(attendanceKey);
        res.json({ attending: exists === 1 });
      }
      else if (showId) {
        // Buscar presenças de um show específico
        const showAttendancesKey = `show:${showId}:attendances`;
        const userIds = await redis.sMembers(showAttendancesKey);
        
        // Buscar dados dos usuários
        const attendees = await Promise.all(
          userIds.map(async (uid) => {
            const userData = await redis.get(`user:${uid}`);
            if (!userData) return null;
            
            const user = JSON.parse(userData);
            
            const attendanceKey = `attendance:${showId}:${uid}`;
            const attendanceData = await redis.get(attendanceKey);
            const attendance = attendanceData ? JSON.parse(attendanceData) : null;
            
            return {
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              createdAt: attendance?.createdAt || new Date().toISOString()
            };
          })
        );
        
        res.json(attendees.filter(a => a !== null));
      }
      else if (userId) {
        // Buscar shows que usuário está presente
        const userShowsKey = `user:${userId}:shows`;
        const showIds = await redis.sMembers(userShowsKey);
        res.json(showIds.map(id => parseInt(id)));
      }
      else {
        // Buscar todas as presenças (agrupadas por show)
        const showIds = await redis.sMembers('all:shows');
        
        const grouped = {};
        
        await Promise.all(
          showIds.map(async (sid) => {
            const showAttendancesKey = `show:${sid}:attendances`;
            const userIds = await redis.sMembers(showAttendancesKey);
            
            grouped[sid] = await Promise.all(
              userIds.map(async (uid) => {
                const userData = await redis.get(`user:${uid}`);
                if (!userData) return null;
                
                const user = JSON.parse(userData);
                
                const attendanceKey = `attendance:${sid}:${uid}`;
                const attendanceData = await redis.get(attendanceKey);
                const attendance = attendanceData ? JSON.parse(attendanceData) : null;
                
                return {
                  userId: user.id,
                  name: user.name,
                  avatar: user.avatar,
                  createdAt: attendance?.createdAt || new Date().toISOString()
                };
              })
            );
          })
        );
        
        // Filtrar nulls
        Object.keys(grouped).forEach(key => {
          grouped[key] = grouped[key].filter(a => a !== null);
        });
        
        res.json(grouped);
      }
    } 
    else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de presenças:', error);
    res.status(500).json({ error: error.message });
  }
}
