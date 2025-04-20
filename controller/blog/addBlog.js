const connection = require('../../models/bd');
const jwt = require('jsonwebtoken');
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';

// Utils
function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

async function verifyToken(req) {
  const token = req.headers.authorization;
  if (!token) throw { status: 401, message: 'Token de acesso não fornecido.' };
  return jwt.verify(token, key);
}

// Adicionar Blog
async function addBlog(req, res) {
  try {
    const { userId, dadosBlog, urlCapa } = req.query;
    await verifyToken(req);

    if (!userId || !dadosBlog) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    const { title, description, content, tags, comments, publish, metaTitle, metaDescription, blogType } = dadosBlog;

    if (!title || !description || !content || !tags) {
      return res.status(400).json({ error: 'Dados obrigatórios do blog ausentes.' });
    }

    const blogQuery = `
      INSERT INTO blogs (title, description, content, cover_link, publish, meta_title, meta_description, user_id, comments, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const blogValues = [
      title, description, content, urlCapa,
      publish ? 1 : 0,
      metaTitle, metaDescription,
      userId, comments ? 1 : 0,
      blogType === 'true' ? 'BLOG' : 'PORTIFOLIO'
    ];

    const blogResult = await executeQuery(blogQuery, blogValues);
    const blogId = blogResult.insertId;

    if (tags?.length) {
      for (const tag of tags) {
        await executeQuery('INSERT INTO blog_tags (blog_id, tag_value) VALUES (?, ?)', [blogId, tag]);
      }
    }

    res.status(200).json({ message: 'Blog adicionado com sucesso.' });
  } catch (error) {
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erro ao adicionar blog.' });
  }
}

// Atualizar Blog
async function updateBlog(req, res) {
  try {
    const { userId, dadosBlog, urlCapa, idBlog } = req.query;
    await verifyToken(req);

    if (!userId || !idBlog || !dadosBlog) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    const { title, description, content, tags, comments, publish, metaTitle, metaDescription, blogType } = dadosBlog;
    if (!title || !description || !content || !tags) {
      return res.status(400).json({ error: 'Dados obrigatórios do blog ausentes.' });
    }

    await executeQuery('START TRANSACTION', []);

    const updateQuery = `
      UPDATE blogs
      SET title = ?, description = ?, content = ?, cover_link = ?, publish = ?, 
          meta_title = ?, meta_description = ?, user_id = ?, comments = ?, type = ?
      WHERE id = ?
    `;
    const updateValues = [
      title, description, content, urlCapa,
      publish === 'true' ? 1 : 0,
      metaTitle, metaDescription,
      userId, comments ? 1 : 0,
      blogType === 'true' ? 'BLOG' : 'PORTIFOLIO',
      idBlog
    ];
    await executeQuery(updateQuery, updateValues);

    const currentTags = await executeQuery('SELECT tag_value FROM blog_tags WHERE blog_id = ?', [idBlog]);
    const currentTagValues = currentTags.map(tag => tag.tag_value);

    const tagsToAdd = tags.filter(tag => !currentTagValues.includes(tag));
    const tagsToRemove = currentTagValues.filter(tag => !tags.includes(tag));

    for (const tag of tagsToAdd) {
      await executeQuery('INSERT INTO blog_tags (blog_id, tag_value) VALUES (?, ?)', [idBlog, tag]);
    }

    for (const tag of tagsToRemove) {
      await executeQuery('DELETE FROM blog_tags WHERE blog_id = ? AND tag_value = ?', [idBlog, tag]);
    }

    await executeQuery('COMMIT', []);
    res.status(200).json({ message: 'Blog atualizado com sucesso.' });
  } catch (error) {
    await executeQuery('ROLLBACK', []);
    console.error(error);
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Erro ao atualizar blog.' });
  }
}

// Listar Blogs
async function ListBlog(req, res) {
  try {
    const { type, tag, dashboard } = req.query;

    const isDashboard = dashboard === '1';
    const values = tag ? [tag, type] : [type || 'BLOG'];

    const query = tag
      ? `SELECT blogs.id, blogs.cover_link, blogs.title, blogs.type, Z_USUARIOS.NOME, Z_USUARIOS.FOTO
         FROM blogs 
         INNER JOIN Z_USUARIOS ON blogs.user_id = Z_USUARIOS.ID
         INNER JOIN blog_tags ON blog_tags.blog_id = blogs.id
         GROUP BY blogs.id
         HAVING MAX(CASE WHEN blog_tags.tag_value = ? THEN 1 ELSE 0 END) = 1
         AND blogs.type = ?
         ${!isDashboard ? 'AND blogs.publish = 1' : ''}`
      : `SELECT blogs.id, blogs.cover_link, blogs.title, Z_USUARIOS.NOME, Z_USUARIOS.FOTO 
         FROM blogs 
         INNER JOIN Z_USUARIOS ON blogs.user_id = Z_USUARIOS.ID 
         WHERE blogs.type = ? 
         ${!isDashboard ? 'AND blogs.publish = 1' : ''} 
         ORDER BY blogs.created_at`;

    const result = await executeQuery(query, values);
    const data = new Date();

    const blogs = result.map(blog => ({
      id: blog.id,
      cover: blog.cover_link,
      title: blog.title,
      createdAt: data,
      view: 2,
      comment: 0,
      share: 2,
      favorite: 1,
      author: {
        name: blog.NOME,
        photoURL: blog.FOTO
      }
    }));

    res.status(200).json({ message: 'Todos os blogs', BLOG: blogs });
  } catch (error) {
    console.error('Erro ao listar blogs:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

// Ler blog por ID
async function readBlog(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID do blog não fornecido.' });

  try {
    const query = `
      SELECT 
        blogs.id, blogs.title, blogs.description, blogs.content, blogs.cover_link, blogs.comments,
        blogs.meta_title, blogs.created_at, blogs.meta_description,
        Z_USUARIOS.NOME, Z_USUARIOS.PAPEL, Z_USUARIOS.FOTO,
        GROUP_CONCAT(blog_tags.tag_value) as tag_values
      FROM blogs
      INNER JOIN Z_USUARIOS ON blogs.user_id = Z_USUARIOS.ID
      INNER JOIN blog_tags ON blog_tags.blog_id = blogs.id
      WHERE blogs.id = ?
      GROUP BY blogs.id
    `;
    const result = await executeQuery(query, [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Blog não encontrado.' });
    }

    const blog = result[0];

    res.status(200).json({
      message: 'Blog encontrado',
      BLOG: {
        id: blog.id,
        cover: blog.cover_link,
        title: blog.title,
        description: blog.description,
        createdAt: blog.created_at,
        view: 50,
        comment: blog.comments,
        share: 52,
        favorite: 53,
        like: true,
        author: {
          name: blog.NOME,
          photoURL: blog.FOTO,
          role: blog.PAPEL
        },
        tags: blog.tag_values.split(','),
        body: blog.content,
        favoritePerson: [],
        comments: [
          {
            id: 1,
            name: 'Usuário Teste',
            photoURL: 'https://i.pravatar.cc/150?img=32',
            postedAt: new Date().toISOString(),
            message: 'Comentário de teste...',
            replyComment: [],
            users: []
          }
        ],
        meta: [
          {
            title: blog.meta_title,
            description: blog.meta_description
          }
        ]
      }
    });
  } catch (error) {
    console.error('Erro ao buscar blog:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

module.exports = {
  addBlog,
  updateBlog,
  ListBlog,
  readBlog
};
