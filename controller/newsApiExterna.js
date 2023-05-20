
const axios = require('axios');
const connection = require('../models/bd');
const apiKey = '8fef4b47ef03be9ddfbf8ffd7c6793ca'; //'858b8bc2fbb7c677917c9b4e16c1d1cd';//'c3d390da535fcbe6d328bb8cfcf6bfb5';  
const buscarNoticias = async (req, res) => {
    try {
        // Chave de API para acessar a GNews.io


        // Parâmetros da consulta de busca
        const q = req.query.q;
        const lang = req.query.lang;
        const country = req.query.country;
        const sortBy = 'relevancy';
        const max = req.query.max;

        // URL da API GNews.io
        const url = `https://gnews.io/api/v4/search?q=${q}&lang=${lang}&country=${country}&max=${max}&apikey=${apiKey}`;

        // Faz a requisição GET à API usando o Axios
        const response = await axios.get(url);

        // Verifica se a resposta contém dados de notícias
        if (response.data.articles) {
            // Limita o número de notícias a um máximo de 100
            const maxNoticias = Math.min(response.data.articles.length, 100);

            // Seleciona somente as primeiras 100 notícias
            const noticiasLimitadas = response.data.articles.slice(0, maxNoticias);

            // Cria um novo objeto com as notícias limitadas
            const noticias = {
                totalArticles: response.data.totalArticles,
                articles: noticiasLimitadas,
            };

            // Retorna a resposta
            return res.json(noticias);
        } else if (response.data.errors) {
            // Verifica se a resposta contém uma mensagem de erro de limite excedido
            const errorMessage =
                'You have reached your request limit for today, the next reset will be tomorrow at midnight UTC. If you need more requests, you can upgrade your subscription here: https://gnews.io/#pricing';

            if (response.data.errors[0] === errorMessage) {
                return res.json({ message: 'Limite de requisições diárias excedido' });
            }
        }

        // Caso contrário, retorna uma resposta vazia
        return res.json({});
    } catch (error) {
        // Trata a exceção aqui...
        // Exibe a mensagem de erro ou registra o erro em um arquivo de log
        console.error('Erro:', error.message);
        return res.status(500).json({ message: 'Erro ao buscar notícias' });
    }
}

const adicionarNoticias = async (req, res) => {
    try {
      const id = req.query.id;
      const noticia = req.query.noticia;
      const status = req.query.status;
  
      if (!id || !noticia || !status) {
        return res.status(401).json({ error: 'Algum parâmetro está vazio.' });
      }
  
      const response = {
        user_id: id,
        title: noticia.title,
        description: noticia.description,
        content: noticia.content,
        url: noticia.url,
        image: noticia.image,
        publishedAt: noticia.publishedAt,
        source_name: noticia.source.name,
        source_url: noticia.source.url,
        status: status,
      };
  
      // Execute a query para adicionar a notícia ao banco
      const query = `INSERT INTO favorite_news (user_id, title, description, content, url, image, publishedAt, source_name, source_url, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        response.user_id,
        response.title,
        response.description,
        response.content,
        response.url,
        response.image,
        response.publishedAt,
        response.source_name,
        response.source_url,
        response.status,
      ];
  
      // Execute a query usando a conexão direta
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error('Erro ao inserir a notícia no banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }
  
        return res.json({ message: 'Notícia adicionada com sucesso' });
      });
    } catch (error) {
      console.error('Erro:', error.message);
      return res.status(500).json({ error: 'Erro ao adicionar notícia' });
    }
  };

  const listarFavoritas = (req, res) => {
    try {
      const id = req.query.id;
  
      // Verificar se o ID do usuário foi fornecido
      if (!id) {
        return res.status(400).json({ error: 'ID do usuário não fornecido' });
      }
  
      // Montar a query para buscar as notícias favoritas
      const query = `SELECT * FROM favorite_news WHERE user_id = ? AND status = 0`;
      const values = [id];
  
      // Executar a query usando a conexão do pool
      connection.query(query, values, (err, results) => {
        if (err) {
          console.error('Erro ao buscar as notícias favoritas:', err);
          return res.status(500).json({ error: 'Erro interno do servidor' });
        }
  
        // Formatar os resultados no formato desejado
        const noticias = results.map(noticia => ({
          status: noticia.status,
          title: noticia.title,
          content: noticia.content,
          description: noticia.description,
          image: noticia.image,
          publishedAt: noticia.publishedAt,
          url: noticia.url,
          source: {
            name: noticia.source_name,
            url: noticia.source_url
          }
        }));
  
        // Retornar as notícias favoritas em formato JSON
        return res.json(noticias);
      });
    } catch (error) {
      console.error('Erro:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar as notícias favoritas' });
    }
  };
  
  



//adicionar 


module.exports = {
    buscarNoticias,
    adicionarNoticias,
    listarFavoritas
};
