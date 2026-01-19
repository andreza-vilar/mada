# 🎉 Carnaval 2026 - Sistema de Presença para Blocos

Sistema web para gerenciar presenças nos blocos de carnaval de Recife e Olinda 2026.

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

### 3. Acessar a aplicação

Abra seu navegador em: `http://localhost:3000`

## 📋 Funcionalidades

- ✅ Visualização de todos os blocos de carnaval
- ✅ Programação completa por dia da semana
- ✅ Sistema de presença em tempo real
- ✅ Perfis de usuário com avatar
- ✅ Banco de dados SQLite para persistência
- ✅ API REST para integração

## 🗄️ Banco de Dados

O sistema usa SQLite e cria automaticamente o arquivo `carnaval.db` na primeira execução.

### Estrutura:

- **users**: Armazena informações dos usuários (id, name, avatar)
- **attendances**: Armazena as presenças (user_id, show_id)

## 🔌 API Endpoints

### Usuários

- `POST /api/users` - Criar/atualizar usuário
- `GET /api/users/:id` - Buscar usuário por ID
- `GET /api/users` - Listar todos os usuários

### Presenças

- `POST /api/attendances` - Marcar/desmarcar presença
- `GET /api/attendances/show/:showId` - Buscar presenças de um show
- `GET /api/attendances` - Buscar todas as presenças
- `GET /api/attendances/check/:userId/:showId` - Verificar se usuário está presente
- `GET /api/attendances/user/:userId` - Buscar shows que usuário está presente

## 📦 Dependências

- **express**: Servidor web
- **sqlite3**: Banco de dados SQLite
- **cors**: Permissão de acesso cross-origin
- **body-parser**: Parser de requisições

## 🛠️ Desenvolvimento

O sistema atualiza automaticamente as presenças a cada 5 segundos para mostrar mudanças em tempo real.

## 📝 Notas

- O sistema mantém localStorage como fallback caso a API não esteja disponível
- Os avatares são armazenados como base64 ou URLs
- O ID do usuário é gerado a partir do nome (lowercase, sem espaços)
