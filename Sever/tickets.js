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
      sheet.appendRow(['ID', 'TIPO', 'ASSUNTO', 'DESCRIÇÃO', 'PRIORIDADE', 'USUÁRIO', 'STATUS', 'DATA', 'DATA_ABERTURA']);
    }
    
    const novoId = gerarIdUnico(SHEET_TICKETS, 'TICKET_');
    const dataAbertura = new Date();

    // Normaliza usuário: aceita `login` ou `id` (USER_...)
    let usuarioArmazenado = '';
    if (ticket.usuario && typeof ticket.usuario === 'string') {
      if (ticket.usuario.indexOf('USER_') === 0) {
        usuarioArmazenado = ticket.usuario;
      } else {
        const usuarioObj = buscarUsuario(ticket.usuario);
        usuarioArmazenado = usuarioObj && usuarioObj.id ? usuarioObj.id : String(ticket.usuario);
      }
    }

    sheet.appendRow([
      novoId,
      ticket.tipo || 'ocorrencia',
      ticket.assunto,
      ticket.descricao,
      ticket.prioridade || 'media',
      usuarioArmazenado,
      'aberto',
      dataAbertura,
      dataAbertura
    ]);
    
    Logger.log('Novo ticket criado: ' + novoId);
    return { status: "ok", msg: "Ticket criado com sucesso!", id: novoId };
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
    const sheet = getSheet(SHEET_TICKETS);
    
    if (!sheet || sheet.getLastRow() <= 1) {
      return [];
    }
    
    const dados = sheet.getDataRange().getValues();
    const tickets = [];
    
    for (let i = 1; i < dados.length; i++) {
      const ticket = {
        id: dados[i][0],
        tipo: dados[i][1],
        assunto: dados[i][2],
        descricao: dados[i][3],
        prioridade: dados[i][4],
        usuario: dados[i][5],
        status: dados[i][6],
        data: dados[i][7]
      };
      
      // Filtra por perfil - permite `usuario` ser login ou id (USER_...)
      let allowed = false;
      if (isAdmin) {
        allowed = true;
      } else if (usuario) {
        // se cliente forneceu id, usa diretamente
        if (typeof usuario === 'string' && usuario.indexOf('USER_') === 0) {
          if (ticket.usuario === usuario) allowed = true;
        } else {
          // usuario é login -> tentar converter para id
          const u = buscarUsuario(usuario);
          if (u && u.id && ticket.usuario === u.id) allowed = true;
          // também aceita se ticket.usuario ainda contém login (registros antigos)
          if (ticket.usuario === usuario) allowed = true;
        }
      }

      if (allowed) tickets.push(ticket);
    }
    
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
      if (dados[i][0] === id) {
        sheet.getRange(i + 1, 7).setValue(novoStatus);
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
    
    const novoId = gerarIdUnico(SHEET_TICKET_COMENTARIOS, 'COMMENT_');

    sheet.appendRow([
      novoId,
      ticketId,
      comentario.usuario,
      comentario.texto,
      new Date()
    ]);
    
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
    
    for (let i = 1; i < dados.length; i++) {
      if (dados[i][1] === ticketId) {
        comentarios.push({
          id: dados[i][0],
          ticketId: dados[i][1],
          usuario: dados[i][2],
          texto: dados[i][3],
          data: dados[i][4]
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
      const ticketUsuario = dados[i][5];
      const status = dados[i][6];

      if (isAdmin) {
        // Admin: conta abertos e em andamento
        if (status === 'aberto' || status === 'andamento') {
          count++;
        }
      } else {
        // Usuário: aceita `usuario` como id (USER_) ou login
        let match = false;
        if (typeof usuario === 'string' && usuario.indexOf('USER_') === 0) {
          if (ticketUsuario === usuario) match = true;
        } else {
          // Converte login para id quando possível
          const u = buscarUsuario(usuario);
          if (u && u.id && ticketUsuario === u.id) match = true;
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
