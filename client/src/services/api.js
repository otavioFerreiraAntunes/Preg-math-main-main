import axios from 'axios';

// Define a URL base da API.
// Em produção na Vercel (onde frontend e backend rodam no mesmo domínio),
// uma string vazia '' faz as requisições irem para rotas relativas (/auth, /busca).
// Em desenvolvimento local, usa o localhost:3000 se VITE_API_URL não estiver definida.
const baseURL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : import.meta.env.PROD
    ? ''
    : 'http://localhost:3000';

// Cria uma instância do Axios com configurações padrão.
// Assim todas as requisições utilizam a mesma configuração.
const api = axios.create({
  baseURL,
  headers: {

    // Define que todas as requisições enviarão dados em formato JSON.
    'Content-Type': 'application/json',

  },
});

// Intercepta todas as requisições antes de serem enviadas ao backend.
api.interceptors.request.use((config) => {

  // Procura um JWT salvo no navegador.
  const token = localStorage.getItem('pregmath_token');

  // Se existir um token...
  if (token) {

    // ...ele é enviado automaticamente no cabeçalho Authorization.
    // O prefixo "Bearer" é o padrão utilizado na autenticação JWT.
    config.headers.Authorization = `Bearer ${token}`;

  }

  // Retorna a configuração da requisição para continuar normalmente.
  return config;

});

// Funções relacionadas à autenticação.
export const authApi = {

  // Envia os dados necessários para cadastrar um novo usuário.
  register: (name, email, password) => {
    return api.post('/auth/register', {
      name,
      email,
      password,
    });
  },

  // Envia o e-mail e a senha para o backend realizar o login.
  login: (email, password) => {
    return api.post('/auth/login', {
      email,
      password,
    });
  },

};

// Exporta a instância do Axios para ser utilizada em outras partes da aplicação.
export default api;