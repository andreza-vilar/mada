# 📖 Instruções de Uso

## Para iniciar o sistema:

1. **Instalar Node.js** (se ainda não tiver):
   - Acesse: https://nodejs.org/
   - Baixe e instale a versão LTS

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Iniciar o servidor**:
   ```bash
   npm start
   ```

4. **Acessar no navegador**:
   - Abra: http://localhost:3000

## Como funciona:

### Para usuários:
1. Clique em "Entrar no Bloco"
2. Digite seu nome e opcionalmente faça upload de uma foto
3. Navegue pelos blocos e clique em "Marcar presença" nos que você vai participar
4. Veja quem mais está confirmado em cada bloco!

### Funcionalidades:
- ✅ Visualização de todos os blocos de carnaval
- ✅ Programação completa por dia da semana
- ✅ Sistema de presença em tempo real (atualiza a cada 5 segundos)
- ✅ Perfis de usuário com avatar
- ✅ Banco de dados compartilhado - todos veem as presenças de todos!

## Estrutura de arquivos:

- `server.js` - Servidor Node.js com API REST
- `index.html` - Interface web
- `package.json` - Dependências do projeto
- `carnaval.db` - Banco de dados SQLite (criado automaticamente)

## API disponível:

O servidor expõe uma API REST em `http://localhost:3000/api/`:

- `POST /api/users` - Criar/atualizar usuário
- `GET /api/users/:id` - Buscar usuário
- `POST /api/attendances` - Marcar/desmarcar presença
- `GET /api/attendances/show/:showId` - Presenças de um show
- `GET /api/attendances` - Todas as presenças

## Troubleshooting:

- **Erro ao iniciar**: Verifique se a porta 3000 está livre
- **Banco de dados não cria**: Verifique permissões de escrita na pasta
- **API não responde**: Certifique-se de que o servidor está rodando
