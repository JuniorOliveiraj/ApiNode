const connection = require('../models/bd');


const listaridNoticia = async (req, res) => {
  try {
    const id = req.query.id;
    // Verificar se o ID do usuário foi fornecido
    if (!id) {
      return res.status(400).json({ error: 'ID da noticias não fornecido' });
    }

    // Montar a query para buscar as notícias favoritas
    const query = `SELECT * FROM news where title = ? ORDER BY created_at`;
    const values = [id];
    const update = `UPDATE news SET lida = 1 WHERE title = ?`
    const result = await executeQuery(update, values);
    // Executar a query usando a conexão do pool
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Erro ao buscar as notícias favoritas:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

      // Formatar os resultados no formato desejado
      const noticias = results.map(noticia => ({
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

const AdicionarNoticia = async (req, res) => {
  const { noticia, urlImagen, id, name } = req.query;
  try{
  const data = new Date(); // Aqui você substituirá pela sua data
  const response = {
    user_id: id,
    title: noticia.title,
    description: noticia.description,
    content: noticia.content,
    url: noticia.url,
    image: urlImagen,
    publishedAt: data,
    source_name: name,
    source_url: noticia.url,
    status: 1,
  };
  const query = `INSERT INTO news (user_id, title, description, content, url, image, publishedAt, source_name, source_url, status, q)
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
    'noticias'
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

}

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
  listaridNoticia,
  AdicionarNoticia
}