# 🚀 Configuração para Vercel

## Passo a passo para deploy no Vercel

### 1. Instalar Vercel CLI (opcional, para desenvolvimento local)

```bash
npm install -g vercel
```

### 2. Configurar Redis (Banco de dados)

Você já tem uma URL do Redis configurada. Agora precisa adicionar como variável de ambiente no Vercel:

1. No projeto no Vercel, vá em **Settings** → **Environment Variables**
2. Adicione a variável:
   - **Nome**: `REDIS_URL`
   - **Valor**: `redis://default:NIaTC4JAt5KvPlI66T01KRlrO2SMSUQh@redis-13569.c8.us-east-1-2.ec2.cloud.redislabs.com:13569`
   - **Environment**: Production, Preview, Development (marque todos)

### 3. Alternativa: Se quiser usar Vercel KV

Se preferir usar o Vercel KV ao invés do Redis externo:

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Vá em **Storage** → **Create Database**
3. Escolha **KV** (Redis)
4. Crie um novo banco de dados
5. Copie as variáveis de ambiente:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 4. Deploy

#### Opção A: Via GitHub (recomendado)
1. Faça push do código para o GitHub
2. Conecte o repositório no Vercel
3. O Vercel fará deploy automaticamente

#### Opção B: Via CLI
```bash
vercel
```

### 5. Estrutura de arquivos

```
/
├── api/
│   ├── users.js          # API para usuários
│   └── attendances.js     # API para presenças
├── index.html            # Frontend
├── vercel.json           # Configuração do Vercel
└── package.json          # Dependências
```

## 🔧 Desenvolvimento local

Para testar localmente com Vercel:

```bash
npm install
vercel dev
```

Isso iniciará o servidor local em `http://localhost:3000`

## 📝 Notas importantes

- As Serverless Functions estão em `/api/`
- Cada arquivo `.js` em `/api/` vira uma rota `/api/[nome-do-arquivo]`
- O Vercel KV é usado para persistência (gratuito até certo limite)
- O frontend está em `index.html` e será servido como estático

## 🐛 Troubleshooting

- **Erro ao conectar ao KV**: Verifique se as variáveis de ambiente estão configuradas
- **Funções não funcionam**: Certifique-se de que os arquivos estão em `/api/`
- **CORS errors**: As funções já incluem headers CORS

## 🔄 Alternativas ao Vercel KV

Se preferir usar outro banco de dados:

1. **Supabase** (PostgreSQL gratuito)
2. **MongoDB Atlas** (MongoDB gratuito)
3. **PlanetScale** (MySQL gratuito)

Basta modificar as funções em `/api/` para usar o cliente do banco escolhido.
