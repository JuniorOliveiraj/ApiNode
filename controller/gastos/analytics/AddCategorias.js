const connection = require('../../../models/bd');
const jsonCategoras = require('./categoria.json');

// Usando o JSON importado para as palavras reservadas
const palavrasReservadas = jsonCategoras;

// Array para armazenar o log de operações
let logs = [];

// Função genérica para executar queries
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

// Função para adicionar categorias (e suas palavras, se necessário) na tabela categorias_compras
async function adicionarCategoriasEPalavras() {
  for (const [categoria, palavras] of Object.entries(palavrasReservadas)) {
    // Converter o nome da categoria para lowercase
    const categoriaLower = categoria.toLowerCase().trim();

    // Verificar se a categoria já existe na tabela 'categorias_compras'
    const categoriaExistente = await executeQuery(
      'SELECT id_categoria FROM categorias_compras WHERE LOWER(nome_categoria) = ?',
      [categoriaLower]
    );

    if (categoriaExistente.length === 0) {
      await executeQuery(
        'INSERT INTO categorias_compras (nome_categoria) VALUES (?)',
        [categoriaLower]
      );
      const msg = `Categoria "${categoriaLower}" foi criada na tabela categorias_compras.`;
      logs.push(msg);
      console.log(msg);
    } else {
      const msg = `Categoria "${categoriaLower}" já existe na tabela categorias_compras.`;
      logs.push(msg);
      console.log(msg);
    }
  }
}

// Função para limpar o nome da compra (remover caracteres especiais)
function limparNomeCompra(nome) {
  if (typeof nome !== 'string') {
    return ''; // Retorna uma string vazia se o nome não for válido
  }
  return nome
    .replace(/[^a-zA-Z0-9\s]/g, ' ')  // Remove caracteres especiais
    .replace(/\s+/g, ' ')             // Substitui múltiplos espaços por um único espaço
    .trim();                          // Remove espaços no início e no final
}

// Função para verificar e adicionar categoria às compras
async function AtualizarCategorias() {
  logs = []; // Reinicia os logs a cada execução
  try {
    // Adiciona todas as categorias (e palavras) do JSON ao banco, se ainda não existirem
    await adicionarCategoriasEPalavras();

    // Consulta as compras que ainda não foram categorizadas
    const compras = await executeQuery(
      'SELECT id, name FROM gastos_mensais_notion WHERE categoriastatus IS NULL LIMIT 100',
      []
    );

    for (const compra of compras) {
      let categoriaEncontrada = null;
      // Limpa e converte o nome da compra para lowercase
      const nomeLimpo = limparNomeCompra(compra.name).toLowerCase();

      // Verifica se o nome da compra contém alguma palavra reservada (ignorando case)
      for (const [categoria, palavras] of Object.entries(palavrasReservadas)) {
        // Se alguma palavra (convertida para lowercase) for encontrada no nome da compra
        if (palavras.some(palavra => nomeLimpo.includes(palavra.toLowerCase()))) {
          // Converte também o nome da categoria para lowercase
          categoriaEncontrada = categoria.toLowerCase().trim();
          break;
        }
      }

      // Se não encontrar uma categoria, define como "outros" (em lowercase)
      if (!categoriaEncontrada) {
        categoriaEncontrada = "outros";
      }

      // Obtém o id da categoria correspondente usando LOWER para comparação
      const categorias = await executeQuery(
        'SELECT id_categoria FROM categorias_compras WHERE LOWER(nome_categoria) = ?',
        [categoriaEncontrada]
      );

      if (categorias.length > 0) {
        const idCategoria = categorias[0].id_categoria;

        // Verifica se a associação entre a compra e a categoria já existe
        const associacaoExistente = await executeQuery(
          'SELECT 1 FROM compra_categoria WHERE id_compra = ? AND id_categoria = ?',
          [compra.id, idCategoria]
        );

        if (associacaoExistente.length === 0) {
          await executeQuery(
            'INSERT INTO compra_categoria (id_compra, id_categoria) VALUES (?, ?)',
            [compra.id, idCategoria]
          );

          // Atualiza o status da compra para indicar que já foi categorizada
          await executeQuery(
            'UPDATE gastos_mensais_notion SET categoriastatus = 1 WHERE id = ?',
            [compra.id]
          );

          const msg = `Compra ${compra.id} associada à categoria ${categoriaEncontrada}.`;
          logs.push(msg);
          console.log(msg);
        } else {
          const msg = `Associação já existente para a compra ${compra.id} e a categoria ${categoriaEncontrada}.`;
          logs.push(msg);
          console.log(msg);
        }
      } else {
        const msg = `Categoria "${categoriaEncontrada}" não encontrada para a compra ${compra.id}: ${compra.name}.`;
        logs.push(msg);
        console.log(msg);
      }
    }
  } catch (err) {
    const msg = `Erro ao atualizar categorias: ${err}`;
    logs.push(msg);
    console.error(msg);
  }

  // Retorna o log de todas as operações realizadas
  return logs;
}

async function Testesql(req, res) {
  const queryMesGasto = `
    SELECT id, name FROM gastos_mensais_notion WHERE categoriastatus IS NULL LIMIT 100
  `;
  const result2 = await executeQuery(queryMesGasto, []);
  return res.status(200).json({
    mensagem: 'ok',
    response: result2,
  });
}

module.exports = { AtualizarCategorias, Testesql };
