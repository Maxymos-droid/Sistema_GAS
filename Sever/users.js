/**
 * @fileoverview GESTÃO DE USUÁRIOS
 * Funções administrativas para criar, editar, excluir e
 * gerenciar dados de usuários no sistema.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== GESTÃO DE USUÁRIOS ====================

/**
 * Lista todos os usuários cadastrados no sistema
 * 
 * @function listarUsuarios
 * @returns {Array<Object>} Array de objetos com dados dos usuários
 * 
 * @description Retorna informações públicas de todos os usuários
 *              cadastrados na planilha LOGIN.
 *              Cada objeto contém: id, login, nome, email, perfil, status
 * 
 * @example
 * const usuarios = listarUsuarios();
 * usuarios.forEach(u => console.log(u.nome));
 */
function listarUsuarios() {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) return [];
    
    const dados = sheet.getDataRange().getValues();
    const usuarios = [];
    
    for (let i = 1; i < dados.length; i++) {
      if (!dados[i][1]) continue;
      
      usuarios.push({
        id: dados[i][0],
        login: String(dados[i][1]).trim(),
        nome: String(dados[i][3] || "").trim(),
        email: String(dados[i][4] || "").trim(),
        perfil: String(dados[i][5] || "user").trim(),
        status: String(dados[i][6] || "ativo").trim()
      });
    }
    
    return usuarios;
  } catch (error) {
    Logger.log('Erro ao listar usuários: ' + error);
    return [];
  }
}

/**
 * Busca dados de um usuário específico pelo login
 * 
 * @function buscarUsuario
 * @param {string} login - Login do usuário a buscar
 * @returns {Object|null} Objeto com dados do usuário ou null
 * 
 * @description Retorna informações públicas do usuário.
 *              Retorna null se não encontrado.
 * 
 * @example
 * const usuario = buscarUsuario("admin");
 * if (usuario) {
 *   console.log(usuario.nome);
 * }
 */
function buscarUsuario(loginOrId) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) return null;
    
    const dados = sheet.getDataRange().getValues();
    // Aceita `id` (ex: USER_...) ou `login`. Se for id, procura na coluna A.
    if (typeof loginOrId === 'string' && loginOrId.indexOf('USER_') === 0) {
      for (let i = 1; i < dados.length; i++) {
        if (String(dados[i][0]).trim() === loginOrId) {
          return {
            id: dados[i][0],
            login: String(dados[i][1]).trim(),
            nome: String(dados[i][3] || "").trim(),
            email: String(dados[i][4] || "").trim(),
            perfil: String(dados[i][5] || "user").trim(),
            status: String(dados[i][6] || "ativo").trim()
          };
        }
      }
    } else {
      const login = String(loginOrId || "").trim();
      for (let i = 1; i < dados.length; i++) {
        if (String(dados[i][1]).trim() === login) {
          return {
            id: dados[i][0],
            login: String(dados[i][1]).trim(),
            nome: String(dados[i][3] || "").trim(),
            email: String(dados[i][4] || "").trim(),
            perfil: String(dados[i][5] || "user").trim(),
            status: String(dados[i][6] || "ativo").trim()
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Erro ao buscar usuário: ' + error);
    return null;
  }
}

/**
 * Salva ou atualiza dados de um usuário
 * 
 * @function salvarUsuario
 * @param {Object} usuario - Objeto com dados do usuário
 * @param {string} usuario.login - Login do usuário (obrigatório)
 * @param {string} usuario.nome - Nome completo (obrigatório)
 * @param {string} usuario.email - Email (obrigatório)
 * @param {string} usuario.senha - Senha (obrigatória para novo)
 * @param {string} [usuario.perfil='user'] - Perfil ("admin" ou "user")
 * @param {string} [usuario.status='ativo'] - Status ("ativo" ou "inativo")
 * @param {string} acao - Ação: "novo" (criar) ou "editar"
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description Para "novo": cria novo usuário com validações
 *              Para "editar": atualiza usuário existente
 *              Senha: mínimo 6 caracteres para novos usuários
 * 
 * @example
 * // Criar novo usuário
 * const resultado = salvarUsuario({
 *   login: "joao",
 *   nome: "João Silva",
 *   email: "joao@email.com",
 *   senha: "senha123"
 * }, "novo");
 * 
 * // Editar usuário existente
 * const resultado = salvarUsuario({
 *   login: "joao",
 *   nome: "João Silva Santos",
 *   email: "joao.silva@email.com"
 * }, "editar");
 */
function salvarUsuario(usuario, acao) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    // Valida campos obrigatórios
    if (!usuario.login || !usuario.nome || !usuario.email) {
      return { status: "erro", msg: "Campos obrigatórios não preenchidos" };
    }
    
    const dados = sheet.getDataRange().getValues();
    
    if (acao === "novo") {
      // Verifica se login já existe
      for (let i = 1; i < dados.length; i++) {
        if (dados[i][1] && String(dados[i][1]).trim() === usuario.login) {
          return { status: "erro", msg: "Login já existe" };
        }
      }
      
      // Valida senha
      if (!usuario.senha || usuario.senha.length < 6) {
        return { status: "erro", msg: "Senha deve ter no mínimo 6 caracteres" };
      }
      
      // Gera ID único e grava na coluna A (chave primária)
      const novoId = gerarIdSequencial(SHEET_LOGIN);

      sheet.appendRow([
        novoId,
        usuario.login,
        usuario.senha,
        usuario.nome,
        usuario.email,
        usuario.perfil || "user",
        usuario.status || "ativo",
        "false"
      ]);
      
      Logger.log('Novo usuário criado: ' + usuario.login);
      return { status: "ok", msg: "Usuário criado com sucesso!" };
      
    } else if (acao === "editar") {
      // Busca usuário para atualizar
      for (let i = 1; i < dados.length; i++) {
        if (dados[i][1] && String(dados[i][1]).trim() === usuario.login) {
          sheet.getRange(i + 1, 4).setValue(usuario.nome);
          sheet.getRange(i + 1, 5).setValue(usuario.email);
          sheet.getRange(i + 1, 6).setValue(usuario.perfil || "user");
          sheet.getRange(i + 1, 7).setValue(usuario.status || "ativo");

          // Atualiza senha se fornecida
          if (usuario.senha && usuario.senha.trim() !== "") {
            sheet.getRange(i + 1, 3).setValue(usuario.senha);
            sheet.getRange(i + 1, 8).setValue("false");
          }

          Logger.log('Usuário atualizado: ' + usuario.login);
          return { status: "ok", msg: "Usuário atualizado com sucesso!" };
        }
      }
      
      return { status: "erro", msg: "Usuário não encontrado" };
    }
    
    return { status: "erro", msg: "Ação inválida" };
  } catch (error) {
    Logger.log('Erro ao salvar usuário: ' + error);
    return { status: "erro", msg: "Erro ao salvar usuário: " + error.message };
  }
}

/**
 * Exclui um usuário do sistema permanentemente
 * 
 * @function excluirUsuario
 * @param {string} login - Login do usuário a excluir
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description Remove permanentemente a linha do usuário da planilha.
 *              Esta ação não pode ser desfeita.
 * 
 * @example
 * const resultado = excluirUsuario("joao");
 * if (resultado.status === "ok") {
 *   console.log("Usuário removido");
 * }
 */
function excluirUsuario(login) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    const dados = sheet.getDataRange().getValues();
    
    // Permite receber `login` ou `id` (id está na coluna A)
    if (typeof login === 'string' && login.indexOf('USER_') === 0) {
      const row = findRowIndexById(SHEET_LOGIN, login);
      if (row > 1) {
        sheet.deleteRow(row);
        Logger.log('Usuário excluído por id: ' + login);
        return { status: "ok", msg: "Usuário excluído com sucesso!" };
      }
    } else {
      for (let i = 1; i < dados.length; i++) {
        if (String(dados[i][1]).trim() === login) {
          sheet.deleteRow(i + 1);
          Logger.log('Usuário excluído: ' + login);
          return { status: "ok", msg: "Usuário excluído com sucesso!" };
        }
      }
    }
    
    return { status: "erro", msg: "Usuário não encontrado" };
  } catch (error) {
    Logger.log('Erro ao excluir usuário: ' + error);
    return { status: "erro", msg: "Erro ao excluir usuário: " + error.message };
  }
}

/**
 * Atualiza perfil de um usuário autenticado
 * 
 * @function atualizarPerfil
 * @param {string} login - Login do usuário
 * @param {Object} dados - Objeto com dados a atualizar
 * @param {string} dados.nome - Novo nome
 * @param {string} dados.email - Novo email
 * @param {string} [dados.senhaAtual] - Senha atual para validação
 * @param {string} [dados.novaSenha] - Nova senha (opcional)
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description Permite que usuário atualize seu próprio perfil.
 *              Se alterar senha, a senha atual é validada.
 *              Remover flag de senha temporária.
 * 
 * @example
 * const resultado = atualizarPerfil("joao", {
 *   nome: "João Silva",
 *   email: "joao@email.com",
 *   senhaAtual: "senha123",
 *   novaSenha: "novaSenha123"
 * });
 */
function atualizarPerfil(login, dados) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LOGIN');
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    const usuarios = sheet.getDataRange().getValues();
    
    for (let i = 1; i < usuarios.length; i++) {
      if (String(usuarios[i][1]).trim() === login) {
        sheet.getRange(i + 1, 4).setValue(dados.nome);
        sheet.getRange(i + 1, 5).setValue(dados.email);
        
        if (dados.senhaAtual && dados.novaSenha) {
          const senhaAtual = String(usuarios[i][2]).trim();
          
          if (senhaAtual !== dados.senhaAtual) {
            return { status: "erro", msg: "Senha atual incorreta" };
          }
          
          sheet.getRange(i + 1, 3).setValue(dados.novaSenha);
          // Remove flag senha temporária
          sheet.getRange(i + 1, 8).setValue("false");
        }
        
        return { status: "ok", msg: "Perfil atualizado com sucesso!" };
      }
    }
    
    return { status: "erro", msg: "Usuário não encontrado" };
  } catch (error) {
    Logger.log('Erro ao atualizar perfil: ' + error);
    return { status: "erro", msg: "Erro ao atualizar perfil: " + error.message };
  }
}
