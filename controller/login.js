const axios = require('axios');

// Função para fazer a requisição à API
async function login(email, password) {
  const url = `http://localhost:8080/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
  
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

module.exports = login;
