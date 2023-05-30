const router = require("express").Router();
const authController = require('../controller/authController');
const noticias = require('../controller/newsApiExterna');
const noticiasBuscar = require('../controller/noticiasBuscar');
const agro = require('../controller/produtos');
const cartao = require('../controller/gastos/gastosCartao');
const jwt = require('jsonwebtoken');

const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';

// Middleware para liberar os headers
const allowHeadersMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite acesso de qualquer origem
  res.header('Access-Control-Allow-Headers', '*'); // Define os cabeçalhos permitidos
  next();
};

router.use(allowHeadersMiddleware);
router.get('/', (req, res) => {
  //res.json({message:'api funcionando 2'})
  res.redirect('https://canaa.vercel.app');
});
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso não fornecido.' });
  }
  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token de acesso inválido ou expirado.' });
    }
    // Token válido, passar para a próxima função
    next();
  });
}
router.get('/register', authController.register);
router.get('/login', authController.login);
router.get('/noticias/buscarNoticias', noticias.buscarNoticias);
router.get('/favoritos/adicionar', noticias.adicionarNoticias);
router.get('/favoritos/listar', noticias.listarFavoritas);
router.get('/private', authenticateToken, authController.privateFunction);
router.get('/produtos/adicionar', agro.addProdutos);
router.get('/produtos/listar-todos', agro.allProduct, authenticateToken);
router.get('/produtos/delet', agro.deletProduto);
router.get('/produtos/prvate', authController.privateFunction, authenticateToken);
router.get('/gatos/cartao', cartao.FaturaCaro);
router.get('/gatos/list-gastos-total', cartao.buscarGastosUsuario, authenticateToken );
router.get('/noticias/ler', noticiasBuscar.listaridNoticia);




module.exports = router;
