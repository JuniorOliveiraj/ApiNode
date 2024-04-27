const router = require("express").Router();
const multer = require('multer');
const upload = multer();
const mirante = require('../controller/MIRANTE/produtos');
const MIranteCupons = require('../controller/MIRANTE/cupons');
const Zpl =require('../controller/MIRANTE/zpl')

router.get('/list', mirante.produtosMirante);
router.get('/list/bancoMirante', mirante.RequestMirante);
router.get('/dawloand', mirante.RequestDownload);
router.get('/list/Teste', mirante.ProdutosGaleria);
router.get('/list/cupons/atualizar', MIranteCupons.fetchData);
router.get('/list/cupons/list', MIranteCupons.ListCupons);
router.get('/list/cupons/chart01', MIranteCupons.ChartCupons);
router.get('/list/cupons/listNames', MIranteCupons.ListCuponsNames);
router.post('/zpl/convert', upload.array('files') , Zpl.zplConvert);

module.exports = router;