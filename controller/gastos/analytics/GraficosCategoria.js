const execut = require('../../../models/executQuery');
async function BuscarCategoriaDoMesTotal(req, res) {
    const { mes, ano } = req.query;
    try {
        const mesAtual = !mes ? new Date().getMonth() + 1 : mes;
        const anoAtual = !ano ? new Date().getFullYear() : ano;

        const queryGastosPorCategoria = `
        SELECT 
            C.nome_categoria name ,
            C.id_categoria id,
            ROUND(SUM(A.valor), 2) AS saved,
            C.icon
                FROM  gastos_mensais_notion A 
                JOIN 
                    compra_categoria B ON A.id = B.id_compra
                JOIN 
                    categorias_compras C ON B.id_categoria = C.id_categoria    
                WHERE     
                    YEAR(A.data) = ? AND 
                    MONTH(A.data) = ?       
                    group by C.nome_categoria , C.icon, C.id_categoria order by saved desc
        `;

        const queryGastos = `
        SELECT  
             ROUND(SUM(A.valor), 2) AS   goal 
                FROM  gastos_mensais_notion A 
                JOIN 
                    compra_categoria B ON A.id = B.id_compra
                JOIN 
                    categorias_compras C ON B.id_categoria = C.id_categoria    
                WHERE     
                    YEAR(A.data) = ? AND 
                    MONTH(A.data) = ? 
        `
        const resultadoGastosPorCategoria = await execut.executeQuery(queryGastosPorCategoria, [anoAtual, mesAtual]);
        const resultadoGastos = await execut.executeQuery(queryGastos, [anoAtual, mesAtual]);

        const totalGastos = resultadoGastos[0]?.['goal'] || 0; 


        const resultadoComTotal = resultadoGastosPorCategoria.map(item => ({
            ...item,
            Total: totalGastos
        }));

        return res.status(200).json({
            mensagem: 'ok',
            total: resultadoComTotal,

        });

    } catch (error) {
        console.error('Erro ao executar a query:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

async function BuscarCategoriaDoMes(req, res) {
    const { mes, ano } = req.query;
    try {
        const mesAtual = !mes ? new Date().getMonth() + 1 : mes;
        const anoAtual = !ano ? new Date().getFullYear() : ano;

        const queryGastosPorCategoria = `
        SELECT 
            C.nome_categoria name 
                FROM  gastos_mensais_notion A 
                JOIN 
                    compra_categoria B ON A.id = B.id_compra
                JOIN 
                    categorias_compras C ON B.id_categoria = C.id_categoria    
                WHERE     
                    YEAR(A.data) = ? AND 
                    MONTH(A.data) = ?       
                    group by C.nome_categoria 
        `;


        const resultadoGastosPorCategoria = await execut.executeQuery(queryGastosPorCategoria, [anoAtual, mesAtual]);
        const listaCategorias = resultadoGastosPorCategoria.map(item => item.name);
 

        return res.status(200).json({
            mensagem: 'ok',
            category: listaCategorias,

        });

    } catch (error) {
        console.error('Erro ao executar a query:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }


}

module.exports = { BuscarCategoriaDoMes, BuscarCategoriaDoMesTotal };
