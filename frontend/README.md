# Front-end do Sistema de Vendas Ar

## 📋 Descrição

Interface completa e responsiva para o Sistema de Vendas Ar, desenvolvida em React com Tailwind CSS.

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn

### Instalação

```bash
cd frontend
npm install
```

### Configuração

1. Crie um arquivo `.env` na pasta `frontend` baseado em `.env.example`:

```bash
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=10000
```

### Rodando o Projeto

```bash
npm start
```

O aplicativo abrirá em `http://localhost:3000` (ou outra porta disponível).

## 🏗️ Estrutura do Projeto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.js          # Cabeçalho com navegação
│   │   ├── Loading.js         # Componente de carregamento
│   │   ├── Modal.js           # Modal reutilizável
│   │   └── Toast.js           # Notificações
│   ├── context/
│   │   └── AuthContext.js     # Contexto de autenticação
│   ├── pages/
│   │   ├── Login.js           # Página de login
│   │   ├── Register.js        # Página de cadastro
│   │   ├── Dashboard.js       # Dashboard principal
│   │   ├── Products.js        # Listagem de produtos
│   │   ├── ProductDetail.js   # Detalhes do produto
│   │   ├── ProductForm.js     # Formulário de criação/edição
│   │   └── NotFound.js        # Página 404
│   ├── services/
│   │   └── api.js             # Integração com API
│   ├── App.js                 # Componente principal
│   ├── ProtectedRoute.js      # Rota protegida
│   ├── index.js               # Entry point
│   └── index.css              # Estilos globais
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## ✨ Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ Cadastro de novo usuário
- ✅ Armazenamento seguro de token JWT
- ✅ Logout automático quando token expira
- ✅ Redirecionamento para login se não autenticado

### Dashboard
- ✅ Página inicial com atalhos
- ✅ Informações do usuário logado
- ✅ Acesso rápido aos produtos

### Gerenciamento de Produtos
- ✅ Listar todos os produtos
- ✅ Buscar e filtrar produtos
- ✅ Criar novo produto (formulário com validação)
- ✅ Ver detalhes completos do produto
- ✅ Editar produto existente
- ✅ Deletar produto com confirmação

### UX/UI
- ✅ Design responsivo (Mobile, Tablet, Desktop)
- ✅ Loading spinners
- ✅ Toast notifications (sucesso, erro)
- ✅ Modais para confirmação
- ✅ Validação de formulários
- ✅ Feedback visual de operações

## 🔒 Segurança

- Token JWT armazenado em localStorage
- Interceptadores de erro para requisições não autorizadas
- Proteção de rotas (ProtectedRoute)
- Validação de entrada no client-side
- Headers HTTP apropriados

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilização
- **PostCSS** - Processador CSS
- **Autoprefixer** - Prefixos automáticos

## 📝 Variáveis de Ambiente

```env
# URL base da API
REACT_APP_API_URL=http://localhost:3000

# Timeout das requisições (em ms)
REACT_APP_API_TIMEOUT=10000
```

## 🚢 Deploy

Para fazer deploy do projeto em Vercel ou Netlify:

1. **Vercel:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Netlify:**
   - Conecte seu repositório GitHub
   - Defina build command: `npm run build`
   - Defina publish directory: `build`

## 🐛 Troubleshooting

**Erro de CORS:**
- Verifique se a API está rodando em `http://localhost:3000`
- Configure CORS na API se necessário

**Token expirado:**
- O usuário será redirecionado para login automaticamente
- Faça login novamente

**Produtos não carregam:**
- Verifique a conexão com a API
- Verifique se está autenticado
- Abra o console do navegador para ver erros

## 📞 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
