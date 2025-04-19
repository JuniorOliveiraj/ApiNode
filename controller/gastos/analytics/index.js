
const GraficosCategoria = require('./GraficosCategoria');
const AddCategorias = require('./AddCategorias');
const AtualizarCategorias = require('./AddCategorias');
const GastosCard = require('./gastosCard');
const gastosMercadoPago = require('./gastosMercadoPagoJson');

module.exports = {
    ...GraficosCategoria,
    ...AddCategorias,   
    ...GastosCard,
    ...gastosMercadoPago,
    ...AtualizarCategorias 

};
