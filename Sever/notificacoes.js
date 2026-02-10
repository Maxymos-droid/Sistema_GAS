/**
 * @fileoverview NOTIFICAÇÕES DO SISTEMA
 * Funções para criar e listar notificações globais.
 */

/**
 * Cria uma notificação do sistema
 * @param {string} titulo
 * @param {string} mensagem
 * @returns {Object}
 */
function criarNotificacaoSistema(titulo, mensagem) {
  try {
    if (!titulo || !mensagem) {
      return { status: "erro", msg: "Título e mensagem são obrigatórios" };
    }
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NOTIFICACOES);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NOTIFICACOES);
      sheet.appendRow(['ID', 'TITULO', 'MENSAGEM', 'DATA', 'ATIVO']);
    }

    const id = gerarIdSequencial(SHEET_NOTIFICACOES);
    const data = new Date();
    sheet.appendRow([id, titulo, mensagem, data, "sim"]);
    return { status: "ok", msg: "Notificação criada", id: id };
  } catch (error) {
    Logger.log('Erro ao criar notificação: ' + error);
    return { status: "erro", msg: "Erro ao criar notificação: " + error.message };
  }
}

/**
 * Lista notificações do sistema (ativas)
 * @returns {Array<Object>}
 */
function listarNotificacoesSistema() {
  try {
    const sheet = getSheet(SHEET_NOTIFICACOES);
    if (!sheet || sheet.getLastRow() <= 1) return [];

    const dados = sheet.getDataRange().getValues();
    const lista = [];
    for (let i = 1; i < dados.length; i++) {
      const ativo = String(dados[i][4] || '').toLowerCase();
      if (ativo && ativo !== 'sim') continue;
      lista.push({
        id: String(dados[i][0]).endsWith(".0") ? String(dados[i][0]).replace(/\.0$/, "") : String(dados[i][0]),
        titulo: String(dados[i][1] || ''),
        mensagem: String(dados[i][2] || ''),
        data: (dados[i][3] instanceof Date) ? dados[i][3].toISOString() : String(dados[i][3] || '')
      });
    }
    // Mais recentes primeiro
    lista.sort((a, b) => Number(b.id) - Number(a.id));
    return lista;
  } catch (error) {
    Logger.log('Erro ao listar notificações: ' + error);
    return [];
  }
}

/**
 * Conta notificações do sistema mais novas que um ID
 * @param {string|number} ultimoIdLido
 * @returns {number}
 */
function contarNotificacoesSistema(ultimoIdLido) {
  try {
    const sheet = getSheet(SHEET_NOTIFICACOES);
    if (!sheet || sheet.getLastRow() <= 1) return 0;
    const last = Number(ultimoIdLido || 0);
    const dados = sheet.getDataRange().getValues();
    let count = 0;
    for (let i = 1; i < dados.length; i++) {
      const ativo = String(dados[i][4] || '').toLowerCase();
      if (ativo && ativo !== 'sim') continue;
      const id = Number(String(dados[i][0]).replace(/\.0$/, ""));
      if (id > last) count++;
    }
    return count;
  } catch (error) {
    Logger.log('Erro ao contar notificações: ' + error);
    return 0;
  }
}
