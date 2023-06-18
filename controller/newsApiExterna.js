
const axios = require('axios');
const connection = require('../models/bd');
const moment = require('moment');
const apiKey = '858b8bc2fbb7c677917c9b4e16c1d1cd' //'8fef4b47ef03be9ddfbf8ffd7c6793ca'; // //'858b8bc2fbb7c677917c9b4e16c1d1cd';//'c3d390da535fcbe6d328bb8cfcf6bfb5';  




const buscarNoticias = async (req, res) => {
  const data = new Date();
  const mes = moment(data).month() + 1;
  const semanas = 1;
  let q = req.query.q;
  const lang = req.query.lang;
  const country = req.query.country;
  const sortBy = 'relevancy';
  const max = req.query.max;
  try {

    const url = `https://gnews.io/api/v4/search?q=${q}&lang=${lang}&country=${country}&max=${max}&apikey=${apiKey}`;

    const response = await axios.get(url);
    if (q === 'esporte' || q === 'noticias' || q === 'Tecnologia') {
      if (response.data.articles) {
        const noticiasLimitadas = response.data.articles.slice(0, 100);

        const noticias = {
          totalArticles: response.data.totalArticles,
          articles: noticiasLimitadas,
        };

        const user_id = 0;

        for (const noticia of noticiasLimitadas) {
          const {
            title,
            description,
            content,
            url,
            image,
            publishedAt,
            source: { name: source_name, url: source_url },
          } = noticia;

          const sqlCheck = 'SELECT COUNT(*) AS count FROM news WHERE user_id = ? AND title = ? AND source_name = ? AND q = ?';
          const valuesCheck = [user_id, title, source_name, q];
          const result = await executeQuery(sqlCheck, valuesCheck);

          if (result[0].count === 0) {
            const sql = `INSERT INTO news (user_id, title, description, content, url, image, publishedAt, source_name, source_url, status, q) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const values = [
              user_id,
              title,
              description,
              content,
              url,
              image,
              publishedAt,
              source_name,
              source_url,
              1,
              q,
            ];
            await executeQuery(sql, values);
            // console.log('Notícia adicionada ao banco de dados.');
          } else {
            //  console.log('Notícia já existe, ignorando inserção.');
          }
        }

        const resultFromDB = await executeQuery(`SELECT * FROM news WHERE q=? AND MONTH(created_at) = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? WEEK) ORDER BY created_at DESC`, [q, mes, semanas]);

        const noticiasFromDB = resultFromDB.map(noticia => ({
          id: noticia.id,
          status: noticia.status,
          title: noticia.title,
          content: noticia.content,
          description: noticia.description,
          image: noticia.image,
          publishedAt: noticia.publishedAt,
          url: noticia.url,
          source: {
            name: noticia.source_name,
            url: noticia.source_url,
          },
        }));

        const noticiasFinal = {
          totalArticles: noticiasFromDB.length,
          articles: noticiasFromDB,
        };

        return res.json(noticiasFinal);
      }
    }

    if (response.data.articles) {
      const noticiasLimitadas = response.data.articles.slice(0, 100);

      const noticias = {
        totalArticles: response.data.totalArticles,
        articles: noticiasLimitadas,
      };

      const user_id = 0;

      for (const noticia of noticiasLimitadas) {
        const {
          title,
          description,
          content,
          url,
          image,
          publishedAt,
          source: { name: source_name, url: source_url },
        } = noticia;

        const sqlCheck = 'SELECT COUNT(*) AS count FROM news WHERE user_id = ? AND title = ? AND source_name = ? AND q = ?';
        const valuesCheck = [user_id, title, source_name, q];
        const result = await executeQuery(sqlCheck, valuesCheck);

        if (result[0].count === 0) {
          const sql = `INSERT INTO news (user_id, title, description, content, url, image, publishedAt, source_name, source_url, status, q) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          const values = [
            user_id,
            title,
            description,
            content,
            url,
            image,
            publishedAt,
            source_name,
            source_url,
            1,
            'noticias',
          ];
          await executeQuery(sql, values);
          //      console.log('Notícia adicionada ao banco de dados.');
        } else {
          //  console.log('Notícia já existe, ignorando inserção.');
        }
      }

      const noticiasFinal = {
        totalArticles: noticiasLimitadas.length,
        articles: noticiasLimitadas,
      };

      return res.json(noticiasFinal);
    } else if (response.data.errors) {
      const resultFromDB = await executeQuery(`SELECT * FROM news WHERE q=? AND MONTH(created_at) = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? WEEK) ORDER BY created_at DESC`, [q, mes, semanas]);
      const noticiasFromDB = resultFromDB.map(noticia => ({
        id: noticia.id,
        status: noticia.status,
        title: noticia.title,
        content: noticia.content,
        description: noticia.description,
        image: noticia.image,
        publishedAt: noticia.publishedAt,
        url: noticia.url,
        source: {
          name: noticia.source_name,
          url: noticia.source_url,
        },
      }));

      const noticiasFinal = {
        totalArticles: noticiasFromDB.length,
        articles: noticiasFromDB,
      };

      return res.json(noticiasFinal);
    }

    return res.json({});
  } catch (error) {
    // Trata a exceção aqui...
    // Exibe a mensagem de erro ou registra o erro em um arquivo de log
    const data = new Date();
    const mes = moment(data).month() + 1;
    console.error('Erro:', error.message);

    const resultFromDB = await executeQuery(`SELECT * FROM news WHERE q=? AND MONTH(created_at) = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? WEEK) ORDER BY created_at DESC`, [q, mes, semanas]);

    const noticiasFromDB = resultFromDB.map(noticia => ({
      id: noticia.id,
      status: noticia.status,
      title: noticia.title,
      content: noticia.content,
      description: noticia.description,
      image: noticia.image,
      publishedAt: noticia.publishedAt,
      url: noticia.url,
      source: {
        name: noticia.source_name,
        url: noticia.source_url,
      },
    }));

    const noticiasFinal = {
      totalArticles: noticiasFromDB.length,
      articles: noticiasFromDB,
    };

    if (!noticiasFromDB.length) {
      return res.status(500).json({ message: 'Erro ao buscar notícias' });
    }

    return res.json(noticiasFinal);
  }
};

const adicionarNoticias = async (req, res) => {
  try {
    const id = req.query.id;
    const noticia = req.query.noticia;
    const status = req.query.status;
    const news_id = req.query.news_id;

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
      news_id: news_id
    };

    // Execute a query para adicionar a notícia ao banco
    const query = `INSERT INTO favorite_news (user_id, title, description, content, url, image, publishedAt, source_name, source_url, status, news_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
      response.news_id
    ];

    const checkNews = 'select * from favorite_news where news_id = ?';
    const resultChekd = await executeQuery(checkNews, news_id);
    if (resultChekd.length < 1) {
      // Execute a query usando a conexão direta
      connection.query(query, values, (err, result) => {
        if (err) {
          console.error('Erro ao inserir a notícia no banco de dados:', err);
          return res.status(500).json({ error: 'Erro interno do servidor.' });
        }

        return res.json({ message: 'Notícia adicionada com sucesso' });
      });
    }
  } catch (error) {
    console.error('Erro:', error.message);
    return res.status(500).json({ error: 'Erro ao adicionar notícia' });
  }
};

const listarFavoritas = (req, res) => {
  try {
    const id = req.query.id;
    const news_id = req.query.id;
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
        id: noticia.news_id,
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
function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}


module.exports = {
  buscarNoticias,
  adicionarNoticias,
  listarFavoritas
};
