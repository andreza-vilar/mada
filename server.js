const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Inicializar banco de dados
const db = new sqlite3.Database('./carnaval.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        initializeDatabase();
    }
});

// Criar tabelas
function initializeDatabase() {
    db.serialize(() => {
        // Tabela de usuários
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            avatar TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabela de presenças
        db.run(`CREATE TABLE IF NOT EXISTS attendances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            show_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, show_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Índices para melhor performance
        db.run(`CREATE INDEX IF NOT EXISTS idx_attendances_show_id ON attendances(show_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_attendances_user_id ON attendances(user_id)`);
    });
}

// ========== ROTAS DE USUÁRIOS ==========

// Criar ou atualizar usuário
app.post('/api/users', (req, res) => {
    const { id, name, avatar } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: 'ID e nome são obrigatórios' });
    }

    db.run(
        `INSERT INTO users (id, name, avatar, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET 
         name = excluded.name, 
         avatar = excluded.avatar, 
         updated_at = CURRENT_TIMESTAMP`,
        [id, name, avatar || null],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ 
                id, 
                name, 
                avatar,
                message: 'Usuário salvo com sucesso' 
            });
        }
    );
});

// Buscar usuário por ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    
    db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json(row);
        }
    );
});

// Buscar todos os usuários (útil para debug)
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ========== ROTAS DE PRESENÇAS ==========

// Marcar ou desmarcar presença
app.post('/api/attendances', (req, res) => {
    const { userId, showId } = req.body;
    
    if (!userId || !showId) {
        return res.status(400).json({ error: 'userId e showId são obrigatórios' });
    }

    // Verificar se já existe
    db.get(
        'SELECT * FROM attendances WHERE user_id = ? AND show_id = ?',
        [userId, showId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                // Remover presença
                db.run(
                    'DELETE FROM attendances WHERE user_id = ? AND show_id = ?',
                    [userId, showId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ 
                            userId, 
                            showId, 
                            attending: false,
                            message: 'Presença removida' 
                        });
                    }
                );
            } else {
                // Adicionar presença
                db.run(
                    'INSERT INTO attendances (user_id, show_id) VALUES (?, ?)',
                    [userId, showId],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: err.message });
                        }
                        res.json({ 
                            userId, 
                            showId, 
                            attending: true,
                            message: 'Presença confirmada' 
                        });
                    }
                );
            }
        }
    );
});

// Buscar presenças de um show específico
app.get('/api/attendances/show/:showId', (req, res) => {
    const { showId } = req.params;
    
    db.all(
        `SELECT a.*, u.name, u.avatar 
         FROM attendances a
         JOIN users u ON a.user_id = u.id
         WHERE a.show_id = ?
         ORDER BY a.created_at DESC`,
        [showId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        }
    );
});

// Buscar todas as presenças (agrupadas por show)
app.get('/api/attendances', (req, res) => {
    db.all(
        `SELECT a.show_id, a.user_id, u.name, u.avatar, a.created_at
         FROM attendances a
         JOIN users u ON a.user_id = u.id
         ORDER BY a.show_id, a.created_at DESC`,
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            
            // Agrupar por show_id
            const grouped = {};
            rows.forEach(row => {
                if (!grouped[row.show_id]) {
                    grouped[row.show_id] = [];
                }
                grouped[row.show_id].push({
                    userId: row.user_id,
                    name: row.name,
                    avatar: row.avatar,
                    createdAt: row.created_at
                });
            });
            
            res.json(grouped);
        }
    );
});

// Verificar se um usuário está presente em um show
app.get('/api/attendances/check/:userId/:showId', (req, res) => {
    const { userId, showId } = req.params;
    
    db.get(
        'SELECT * FROM attendances WHERE user_id = ? AND show_id = ?',
        [userId, showId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ attending: !!row });
        }
    );
});

// Buscar todos os shows que um usuário está presente
app.get('/api/attendances/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.all(
        'SELECT show_id FROM attendances WHERE user_id = ?',
        [userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows.map(row => row.show_id));
        }
    );
});

// ========== ROTA PARA SERVER ESTÁTICO ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Banco de dados: carnaval.db`);
});

// Fechar banco ao encerrar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com banco de dados fechada.');
        process.exit(0);
    });
});
