/**
 * @fileoverview SISTEMA DE TICKETS
 * Funções para criar, gerenciar e acompanhar tickets
 * de ocorrências, sugestões e solicitações de usuários.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== GESTÃO DE TICKETS ====================

/**
 * Cria um novo ticket no sistema
 * 
 * @function criarTicket
 * @param {Object} ticket - Objeto com dados do ticket
 * @param {string} ticket.tipo - Tipo: "ocorrencia" ou "sugestao"
 * @param {string} ticket.assunto - Assunto do ticket (obrigatório)
 * @param {string} ticket.descricao - Descrição detalhada (obrigatório)
 * @param {string} ticket.prioridade - Prioridade: "baixa", "media", "alta"
 * @param {string} ticket.usuario - Login do usuário criador
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" (criado) ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * @returns {string} result.id - ID único do ticket criado
 * 
 * @description 1. Valida campos obrigatórios (assunto, descrição)
 *              2. Cria aba TICKETS se não existir
 *              3. Gera ID único baseado em timestamp
 *              4. Define status inicial como "aberto"
 *              5. Registra data de abertura
 * 
 * @example
 * const resultado = criarTicket({
 *   tipo: "ocorrencia",
 *   assunto: "Erro na busca",
 *   descricao: "Ao pesquisar, o sistema congela",
 *   prioridade: "alta",
 *   usuario: "joao"
 * });
 * 
 * if (resultado.status === "ok") {
 *   console.log("Ticket criado: " + resultado.id);
 * }
 */
function criarTicket(ticket) {
  try {
    if (!ticket || !ticket.assunto || !ticket.descricao) {
      return { status: "erro", msg: "Preencha todos os campos obrigatórios" };
    }
    
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TICKETS);
    
    // Cria aba TICKETS se não existir
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TICKETS);
      sheet.appendRow(['ID', 'CODIGO', 'TIPO', 'ASSUNTO', 'DESCRIÇÃO', 'PRIORIDADE', 'USUÁRIO', 'STATUS', 'DATA', 'DATA_ABERTURA']);
    }

    // Garante coluna CODIGO na posição 2
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(h => String(h || '').trim().toUpperCase());
    if (header.indexOf('CODIGO') === -1) {
      sheet.insertColumnAfter(1);
      sheet.getRange(1, 2).setValue('CODIGO');
    }
    
    const novoId = gerarIdSequencial(SHEET_TICKETS);
    const codigoNum = gerarSequencialColuna(SHEET_TICKETS, 2);
    const codigo = `#${String(codigoNum).padStart(4, '0')}`;
    const dataAbertura = new Date();

    // Normaliza usuário: salva o NOME do usuário
    let usuarioArmazenado = '';
    if (ticket.usuario && typeof ticket.usuario === 'string') {
      if (ticket.usuario.indexOf('USER_') === 0) {
        const u = buscarUsuario(ticket.usuario);
        usuarioArmazenado = (u && u.nome) ? u.nome : ticket.usuario;
      } else {
        const u = buscarUsuario(ticket.usuario);
        usuarioArmazenado = (u && u.nome) ? u.nome : String(ticket.usuario);
      }
    }

    sheet.appendRow([
      novoId,
      codigo,
      ticket.tipo || 'ocorrencia',
      ticket.assunto,
      ticket.descricao,
      ticket.prioridade || 'media',
      usuarioArmazenado,
      'aberto',
      dataAbertura,
      dataAbertura
    ]);
    
    Logger.log('Novo ticket criado: ' + novoId + ' / CODIGO ' + codigo);
    return { status: "ok", msg: "Ticket criado com sucesso!", id: novoId, codigo: codigo };
  } catch (error) {
    Logger.log('Erro ao criar ticket: ' + error);
    return { status: "erro", msg: "Erro ao criar ticket: " + error.message };
  }
}

/**
 * Lista tickets com filtros diferentes por tipo de usuário
 * 
 * @function listarTickets
 * @param {string} usuario - Login do usuário solicitante
 * @param {boolean} isAdmin - Indicador de acesso administrativo
 * @returns {Array<Object>} Array de objetos com dados dos tickets
 * 
 * @description Admins: veem todos os tickets do sistema
 *              Usuários: veem apenas seus próprios tickets
 *              Retorna array vazio se nenhum ticket encontrado
 * 
 * @example
 * // Admin vê todos
 * const tickets = listarTickets("admin", true);
 * console.log("Total: " + tickets.length + " tickets");
 * 
 * // Usuário vê seus próprios
 * const meusTickets = listarTickets("joao", false);
 */
function listarTickets(usuario, isAdmin) {
  try {
    Logger.log('listarTickets - params: usuario=' + usuario + ' isAdmin=' + isAdmin);
    const sheet = getSheet(SHEET_TICKETS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      Logger.log('listarTickets - planilha inexistente ou vazia');
      return [];
    }
    
    const dados = sheet.getDataRange().getValues();
    // Mapeia último comentário por ticket
    const ultimosComentarios = {};
    const sheetComentarios = getSheet(SHEET_TICKET_COMENTARIOS);
    if (sheetComentarios && sheetComentarios.getLastRow() > 1) {
      const dadosComentarios = sheetComentarios.getDataRange().getValues();
      for (let i = 1; i < dadosComentarios.length; i++) {
        const ticketIdRaw = dadosComentarios[i][1];
        const ticketId = String(ticketIdRaw).endsWith(".0") ? String(ticketIdRaw).replace(/\.0$/, "") : String(ticketIdRaw);
        const texto = String(dadosComentarios[i][3] || '');
        const data = dadosComentarios[i][4];
        const ts = (data instanceof Date) ? data.getTime() : Date.parse(String(data || "")) || 0;
        if (!ultimosComentarios[ticketId] || ultimosComentarios[ticketId].ts < ts) {
          ultimosComentarios[ticketId] = { texto, ts };
        }
      }
    }
    const tickets = [];
    
    for (let i = 1; i < dados.length; i++) {
      // Espera layout: [ID, CODIGO, TIPO, ASSUNTO, DESCRIÇÃO, PRIORIDADE, USUÁRIO, STATUS, DATA, DATA_ABERTURA]
      if (!dados[i][0]) continue;
      const idRaw = dados[i][0];
      const id = String(idRaw).endsWith(".0") ? String(idRaw).replace(/\.0$/, "") : String(idRaw);
      const ticket = {
        id: String(id),
        codigo: String(dados[i][1] || ''),
        tipo: String(dados[i][2] || ''),
        assunto: String(dados[i][3] || ''),
        descricao: String(dados[i][4] || ''),
        prioridade: String(dados[i][5] || ''),
        usuario: String(dados[i][6] || ''),
        status: String(dados[i][7] || ''),
        data: (dados[i][8] instanceof Date) ? dados[i][8].toISOString() : String(dados[i][8] || ''),
        ultimoComentario: (ultimosComentarios[id] && ultimosComentarios[id].texto) ? ultimosComentarios[id].texto : ""
      };
      
      // Filtra por perfil - permite `usuario` ser login ou id (USER_...)
      let allowed = false;
      if (isAdmin) {
        allowed = true;
      } else if (usuario) {
        // se cliente forneceu id, tenta resolver para nome
        if (typeof usuario === 'string' && usuario.indexOf('USER_') === 0) {
          const u = buscarUsuario(usuario);
          if (u && u.nome && ticket.usuario === u.nome) allowed = true;
          if (ticket.usuario === usuario) allowed = true;
        } else {
          // usuario é login -> tentar converter para id/nome
          const u = buscarUsuario(usuario);
          if (u && u.id && ticket.usuario === u.id) allowed = true;
          if (u && u.nome && ticket.usuario === u.nome) allowed = true;
          // também aceita se ticket.usuario ainda contém login (registros antigos)
          if (ticket.usuario === usuario) allowed = true;
        }
      }

      if (allowed) tickets.push(ticket);
    }
    
    Logger.log('listarTickets - total=' + tickets.length);
    return tickets;
  } catch (error) {
    Logger.log('Erro ao listar tickets: ' + error);
    return [];
  }
}

/**
 * Atualiza o status de um ticket existente
 * 
 * @function atualizarStatusTicket
 * @param {string} id - ID único do ticket
 * @param {string} novoStatus - Novo status: "aberto", "andamento", "resolvido", "fechado"
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description Atualiza coluna STATUS (coluna 7) do ticket.
 *              Operação rápida sem validações complexas.
 * 
 * @example
 * const resultado = atualizarStatusTicket("TICKET_1707154321", "andamento");
 * if (resultado.status === "ok") {
 *   console.log("Status atualizado!");
 * }
 */
function atualizarStatusTicket(id, novoStatus) {
  try {
    const sheet = getSheet(SHEET_TICKETS);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de tickets não encontrada" };
    }
    
    const dados = sheet.getDataRange().getValues();
    
    for (let i = 1; i < dados.length; i++) {
      const idRaw = dados[i][0];
      const idLocal = String(idRaw).endsWith(".0") ? String(idRaw).replace(/\.0$/, "") : String(idRaw);
      if (idLocal === String(id)) {
        // STATUS agora está na coluna 8 (A=1)
        sheet.getRange(i + 1, 8).setValue(novoStatus);
        sheet.getRange(i + 1, 9).setValue(new Date());
        Logger.log('Status atualizado para ticket: ' + id);
        return { status: "ok", msg: "Status atualizado com sucesso!" };
      }
    }
    
    return { status: "erro", msg: "Ticket não encontrado" };
  } catch (error) {
    Logger.log('Erro ao atualizar ticket: ' + error);
    return { status: "erro", msg: "Erro ao atualizar ticket: " + error.message };
  }
}

/**
 * Adiciona um comentário a um ticket
 * 
 * @function adicionarComentarioTicket
 * @param {string} ticketId - ID do ticket
 * @param {Object} comentario - Objeto com dados do comentário
 * @param {string} comentario.usuario - Login do usuário comentando
 * @param {string} comentario.texto - Texto do comentário
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description 1. Cria aba TICKET_COMENTARIOS se não existir
 *              2. Gera ID único baseado em timestamp
 *              3. Registra data/hora do comentário
 * 
 * @example
 * const resultado = adicionarComentarioTicket("TICKET_1707154321", {
 *   usuario: "admin",
 *   texto: "Investigando o problema..."
 * });
 */
function adicionarComentarioTicket(ticketId, comentario) {
  try {
    const ss = getSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_TICKET_COMENTARIOS);
    
    // Cria aba se não existir
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TICKET_COMENTARIOS);
      sheet.appendRow(['ID', 'TICKET_ID', 'USUARIO', 'TEXTO', 'DATA']);
    }
    
    const novoId = gerarIdSequencial(SHEET_TICKET_COMENTARIOS);
    const ticketIdNorm = String(ticketId).endsWith(".0") ? String(ticketId).replace(/\.0$/, "") : String(ticketId);

    sheet.appendRow([
      novoId,
      ticketIdNorm,
      comentario.usuario,
      comentario.texto,
      new Date()
    ]);

    // Atualiza DATA (última atualização) na tabela de tickets
    const sheetTickets = getSheet(SHEET_TICKETS);
    if (sheetTickets) {
      const dadosTickets = sheetTickets.getDataRange().getValues();
      for (let i = 1; i < dadosTickets.length; i++) {
        const idRow = String(dadosTickets[i][0]).endsWith(".0") ? String(dadosTickets[i][0]).replace(/\.0$/, "") : String(dadosTickets[i][0]);
        if (idRow === ticketIdNorm) {
          sheetTickets.getRange(i + 1, 9).setValue(new Date());
          break;
        }
      }
    }
    
    Logger.log('Comentário adicionado ao ticket: ' + ticketId);
    return { status: "ok", msg: "Comentário adicionado com sucesso!" };
  } catch (error) {
    Logger.log('Erro ao adicionar comentário: ' + error);
    return { status: "erro", msg: "Erro ao adicionar comentário: " + error.message };
  }
}

/**
 * Lista todos os comentários de um ticket ordenados por data
 * 
 * @function listarComentariosTicket
 * @param {string} ticketId - ID do ticket
 * @returns {Array<Object>} Array com comentários em ordem cronológica
 * 
 * @description Retorna array vazio se aba não existir ou sem comentários.
 *              Comentários ordenados do mais antigo para o mais novo.
 * 
 * @example
 * const comentarios = listarComentariosTicket("TICKET_1707154321");
 * comentarios.forEach(c => {
 *   console.log(c.usuario + ": " + c.texto);
 * });
 */
function listarComentariosTicket(ticketId) {
  try {
    const sheet = getSheet(SHEET_TICKET_COMENTARIOS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return [];
    }
    
    const dados = sheet.getDataRange().getValues();
    const comentarios = [];
    const ticketIdNorm = String(ticketId).endsWith(".0") ? String(ticketId).replace(/\.0$/, "") : String(ticketId);
    
    for (let i = 1; i < dados.length; i++) {
      const ticketIdRow = String(dados[i][1]).endsWith(".0") ? String(dados[i][1]).replace(/\.0$/, "") : String(dados[i][1]);
      if (ticketIdRow === ticketIdNorm) {
        comentarios.push({
          id: String(dados[i][0]).endsWith(".0") ? String(dados[i][0]).replace(/\.0$/, "") : String(dados[i][0]),
          ticketId: ticketIdRow,
          usuario: String(dados[i][2] || ''),
          texto: String(dados[i][3] || ''),
          data: (dados[i][4] instanceof Date) ? dados[i][4].toISOString() : String(dados[i][4] || '')
        });
      }
    }
    
    // Ordena por data (crescente)
    comentarios.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    return comentarios;
  } catch (error) {
    Logger.log('Erro ao listar comentários: ' + error);
    return [];
  }
}

/**
 * Conta tickets pendentes para notificações
 * 
 * @function contarTicketsPendentes
 * @param {string} usuario - Login do usuário
 * @param {boolean} isAdmin - Indicador de acesso administrativo
 * @returns {number} Quantidade de tickets pendentes
 * 
 * @description Admins: conta todos os tickets com status "aberto" ou "andamento"
 *              Usuários: contam próprios tickets "andamento" ou "resolvido"
 *              Retorna 0 se nenhum pendente
 * 
 * @example
 * const notificacoes = contarTicketsPendentes("joao", false);
 * console.log("Você tem " + notificacoes + " tickets pendentes");
 */
function contarTicketsPendentes(usuario, isAdmin) {
  try {
    const sheet = getSheet(SHEET_TICKETS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return 0;
    }
    
    const dados = sheet.getDataRange().getValues();
    let count = 0;
    
    for (let i = 1; i < dados.length; i++) {
      const ticketUsuario = dados[i][6];
      const status = dados[i][7];

      if (isAdmin) {
        // Admin: conta abertos e em andamento
        if (status === 'aberto' || status === 'andamento') {
          count++;
        }
      } else {
        // Usuário: aceita `usuario` como id (USER_) ou login
        let match = false;
        if (typeof usuario === 'string' && usuario.indexOf('USER_') === 0) {
          const u = buscarUsuario(usuario);
          if (u && u.nome && ticketUsuario === u.nome) match = true;
          if (ticketUsuario === usuario) match = true;
        } else {
          // Converte login para id/nome quando possível
          const u = buscarUsuario(usuario);
          if (u && u.id && ticketUsuario === u.id) match = true;
          if (u && u.nome && ticketUsuario === u.nome) match = true;
          // Também aceita registros antigos onde ticketUsuario armazena login
          if (ticketUsuario === usuario) match = true;
        }

        if (match && (status === 'andamento' || status === 'resolvido')) {
          count++;
        }
      }
    }
    
    return count;
  } catch (error) {
    Logger.log('Erro ao contar tickets: ' + error);
    return 0;
  }
}
