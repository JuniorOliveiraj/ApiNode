//outros
const multer = require('multer');
const upload = multer();
const key = '$2y$10MFKDgDBujKwY.VZi/DH6JuR58ISGjlS6mlEobHlmhX9zQ.Ha4c3qC2';
const router = require("express").Router();
//trabalho facull
const noticias = require('../controller/newsApiExterna');
const noticiasBuscar = require('../controller/noticiasBuscar');
//dashboard
const authController = require('../controller/authController');
const editarUser = require('../controller/user/editarUser')
const cartao = require('../controller/gastos/gastosCartao');
const agro = require('../controller/produtos');
const storage = require('../uploadImage');
//site 
const thema = require('../controller/user/theme');
const blog = require('../controller/blog/addBlog');
const tag = require('../controller/blog/BlogTags');
const sorteio = require('../controller/sorteio')
const jwt = require('jsonwebtoken');
//mirante
const mirante = require('../controller/MIRANTE/produtos');
const MIranteCupons = require('../controller/MIRANTE/cupons');
const Zpl =require('../controller/MIRANTE/zpl');
const charts = require('../controller/ChartsNotion/Banking')

// Analytics Banking
const mercadoPago = require('../controller/gastos/analytics/gastosMercadoPagoJson');
const AddCategorias = require('../controller/gastos/analytics/AddCategorias');





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
router.get('/users/list', authController.userList, authenticateToken);
router.get('/users/update', authController.updateUser, authenticateToken);
router.get('/users/userLoad', authController.loaduser, authenticateToken);
router.get('/users/tornar-adm', editarUser.updateuseradm, authenticateToken);
router.get('/set-theme', thema.listaridNoticia);
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
router.get('/gatos/adicionar-manual', cartao.adicionargastosmanual, authenticateToken );
router.get('/noticias/ler', noticiasBuscar.listaridNoticia);
router.get('/noticias/adicionar', noticiasBuscar.AdicionarNoticia);
router.get('/blog/adicionar', blog.addBlog);
router.get('/blog/update', blog.updateBlog);
router.get('/blog/list', blog.ListBlog);
router.get('/blog/read', blog.readBlog);
router.get('/blog/list/tags', tag.ListTags);
router.post('/storage/upload',upload.any() , storage.uploadImagem);
//mirante

router.get('/mirante/list', mirante.produtosMirante);
router.get('/mirante/list/bancoMirante', mirante.RequestMirante);
router.get('/mirante/dawloand', mirante.RequestDownload);
router.get('/mirante/list/Teste', mirante.ProdutosGaleria);
router.get('/mirante/list/cupons/atualizar', MIranteCupons.fetchData);
router.get('/mirante/list/cupons/list', MIranteCupons.ListCupons);
router.get('/mirante/list/cupons/chart01', MIranteCupons.ChartCupons);
router.get('/mirante/list/cupons/listNames', MIranteCupons.ListCuponsNames);
router.post('/mirante/zpl/convert', upload.array('files') , Zpl.zplConvert);
//sorteio

 
router.get('/sorteio/cadastrar', sorteio.CadastrarParticipante);
router.get('/sorteio/realizar', sorteio.RealizarSorteio);
router.get('/sorteio/visualizar', sorteio.VisualizarSorteio);
//Charts Notion
router.get('/charts/gastos', charts.GastosTotais);
router.get('/charts/saldo', charts.SaldoEmConta);

// gastos
router.post('/add/gastos/jsonMercadoPago', mercadoPago.PegarDadosMercadoPadoJsonPadrao);
router.get('/list/gastos/todos', mercadoPago.RetornarDadosMercadoPadoJsonMes);
router.get('/list/gastos/total', mercadoPago.BuscarGastosTotais);

router.get('/list/gastos/steste', AddCategorias.AtualizarCategorias);




module.exports = router;
