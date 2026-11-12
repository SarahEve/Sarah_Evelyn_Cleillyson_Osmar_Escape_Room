# 🎭 Sistema de Agendamento de Scaperoom

Projeto Full Stack desenvolvido para a disciplina de Arquitetura Web. O sistema permite que usuários consultem salas de scaperoom, solicitem agendamentos e acompanhem o status, enquanto administradores gerenciam a agenda, aprovam/recusam pedidos e gerenciam as salas.

## 🛠️ Tecnologias Utilizadas

**Backend (API):**
- Node.js & Express
- MongoDB & Mongoose
- Autenticação com JWT (JSON Web Token)
- Criptografia de senhas com Bcrypt
- Validação de dados com Joi
- Arquitetura MVC (Model, View, Controller)

**Frontend (SPA):**
- React.js (criado com Vite)
- React Router DOM (navegação sem recarregar a página)
- Axios (consumo da API)
- Context API (gerenciamento de estado do usuário)
- CSS Flexbox/Grid (layout responsivo)

---

## 🚀 Como rodar o projeto localmente

O projeto está dividido em duas pastas principais: `/server` (Backend) e `/client` (Frontend). Você precisará de **dois terminais abertos** para rodar ambos simultaneamente.

### 1. Configurando o Backend (API)

```bash
# 1. Acesse a pasta do backend
cd server

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
# Copie o arquivo .env.example para .env e preencha os dados:
# MONGO_URI=sua_string_de_conexao_do_mongodb
# JWT_SECRET=uma_string_longa_e_secreta
# PORT=4000

# 4. Inicie o servidor (com nodemon para desenvolvimento)
npm run dev