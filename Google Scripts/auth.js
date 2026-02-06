/**
 * @fileoverview AUTENTICAÇÃO E GERENCIAMENTO DE ACESSO
 * Funções para login, logout, recuperação de senha e
 * gerenciamento de credenciais de usuários.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== AUTENTICAÇÃO ====================

/**
 * Realiza autenticação do usuário no sistema
 * 
 * @function loginUsuario
 * @param {string} usuario - Login do usuário
 * @param {string} senha - Senha do usuário
 * @returns {Object} Objeto com resultado da autenticação
 * @returns {string} result.status - "ok" (sucesso) ou "erro" (falha)
 * @returns {string} result.msg - Mensagem descritiva do resultado
 * @returns {boolean} result.senhaPadrao - true se senha é "123" (padrão)
 * @returns {boolean} result.senhaTemporaria - true se senha is temporária
 * @returns {string} result.usuario - Login do usuário autenticado
 * @returns {string} result.login - Alias para result.usuario
 * @returns {string} result.nome - Nome completo do usuário
 * @returns {string} result.email - Email do usuário
 * @returns {string} result.perfil - Perfil ("admin" ou "user")
 * 
 * @description Valida credenciais contra planilha LOGIN.
 *              Verifica status de atividade do usuário.
 *              Retorna informações completas se autenticado.
 * 
 * @example
 * const resultado = loginUsuario("admin", "123");
 * if (resultado.status === "ok") {
 *   console.log("Login de: " + resultado.nome);
 * }
 */
function loginUsuario(usuario, senha) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    const dados = sheet.getDataRange().getValues();
    const uDigitado = String(usuario).trim();
    const sDigitada = String(senha).trim();
    
    for (let i = 1; i < dados.length; i++) {
      const usuarioPlanilha = String(dados[i][1]).trim();
      const senhaPlanilha = String(dados[i][2]).trim();
      const nome = String(dados[i][3] || "").trim();
      const email = String(dados[i][4] || "").trim();
      const perfil = String(dados[i][5] || "user").trim().toLowerCase();
      const status = String(dados[i][6] || "ativo").trim().toLowerCase();
      const senhaTemporaria = String(dados[i][7] || "").trim() === "true";
      
      if (uDigitado === usuarioPlanilha && sDigitada === senhaPlanilha) {
        if (status === "inativo") {
          return {
            status: "erro",
            msg: "Usuário inativo. Entre em contato com o administrador."
          };
        }
        
        return {
          status: "ok",
          msg: "Login realizado com sucesso",
          senhaPadrao: (senhaPlanilha === "123"),
          senhaTemporaria: senhaTemporaria,
          id: dados[i][0],
          usuario: usuarioPlanilha,
          login: usuarioPlanilha,
          nome: nome || usuarioPlanilha,
          email: email,
          perfil: perfil
        };
      }
    }
    
    return { status: "erro", msg: "Usuário ou senha inválidos" };
  } catch (error) {
    Logger.log('Erro no login: ' + error);
    return { status: "erro", msg: "Erro ao processar login: " + error.message };
  }
}

/**
 * Altera a senha de um usuário autenticado
 * 
 * @function alterarSenha
 * @param {string} usuario - Login do usuário
 * @param {string} senhaAtual - Senha atual do usuário (para validação)
 * @param {string} novaSenha - Nova senha desejada
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description 1. Valida senha atual antes de atualizar
 *              2. Atualiza nova senha na planilha
 *              3. Remove flag de senha temporária
 * 
 * @example
 * const resultado = alterarSenha("admin", "123", "nova_senha_123");
 * if (resultado.status === "ok") {
 *   console.log("Senha alterada!");
 * }
 */
function alterarSenha(usuario, senhaAtual, novaSenha) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    const dados = sheet.getDataRange().getValues();
    
    // Suporta receber `login` ou `id` (USER_...)
    if (typeof usuario === 'string' && usuario.indexOf('USER_') === 0) {
      const row = findRowIndexById(SHEET_LOGIN, usuario);
      if (row > 1) {
        const currentPwd = String(sheet.getRange(row, 3).getValue() || '').trim();
        if (currentPwd === senhaAtual) {
          sheet.getRange(row, 3).setValue(novaSenha);
          sheet.getRange(row, 8).setValue("false");
          Logger.log('Senha alterada para id: ' + usuario);
          return { status: "ok", msg: "Senha alterada com sucesso!" };
        }
        return { status: "erro", msg: "Senha atual incorreta" };
      }
    } else {
      for (let i = 1; i < dados.length; i++) {
        if (String(dados[i][1]).trim() === usuario && 
            String(dados[i][2]).trim() === senhaAtual) {
          sheet.getRange(i + 1, 3).setValue(novaSenha);
          sheet.getRange(i + 1, 8).setValue("false");
          Logger.log('Senha alterada para: ' + usuario);
          return { status: "ok", msg: "Senha alterada com sucesso!" };
        }
      }
    }
    
    return { status: "erro", msg: "Senha atual incorreta" };
  } catch (error) {
    Logger.log('Erro ao alterar senha: ' + error);
    return { status: "erro", msg: "Erro ao alterar senha: " + error.message };
  }
}

/**
 * Inicia processo de recuperação de senha via email
 * 
 * @function recuperarSenha
 * @param {string} email - Email do usuário cadastrado
 * @returns {Object} Status da operação
 * @returns {string} result.status - "ok" (email enviado) ou "erro"
 * @returns {string} result.msg - Mensagem descritiva
 * 
 * @description 1. Busca usuário por email
 *              2. Gera senha temporária aleatória
 *              3. Atualiza planilha com nova senha
 *              4. Marca como "senha temporária"
 *              5. Envia email com nova senha
 *              6. Usuário deve trocar senha ao fazer login
 * 
 * @example
 * const resultado = recuperarSenha("usuario@email.com");
 * if (resultado.status === "ok") {
 *   console.log("Email de recuperação enviado!");
 * }
 */
function recuperarSenha(email) {
  try {
    const sheet = getSheet(SHEET_LOGIN);
    
    if (!sheet) {
      return { status: "erro", msg: "Planilha de login não encontrada" };
    }
    
    const dados = sheet.getDataRange().getValues();
    const emailDigitado = String(email).trim().toLowerCase();
    
    for (let i = 1; i < dados.length; i++) {
      const emailPlanilha = String(dados[i][4] || "").trim().toLowerCase();
      
      if (emailDigitado === emailPlanilha) {
        const login = String(dados[i][1]).trim();
        const nome = String(dados[i][3] || login).trim();
        
        const novaSenhaTemp = gerarSenhaTemporaria();
        
        sheet.getRange(i + 1, 3).setValue(novaSenhaTemp);
        sheet.getRange(i + 1, 8).setValue("true");
        
        const assunto = "Recuperação de Senha - CTRC Analyzer";
        const corpo = `
Olá ${nome},

Você solicitou a recuperação de senha do sistema CTRC Analyzer.

Sua nova senha temporária é: ${novaSenhaTemp}

Por favor, faça login e altere sua senha imediatamente por segurança.

Login: ${login}
Senha temporária: ${novaSenhaTemp}

Atenciosamente,
Sistema CTRC Analyzer
        `;
        
        MailApp.sendEmail(emailPlanilha, assunto, corpo);
        
        Logger.log('Email de recuperação enviado para: ' + emailPlanilha);
        
        return {
          status: "ok",
          msg: "Nova senha enviada para seu email!"
        };
      }
    }
    
    return { status: "erro", msg: "Email não encontrado no sistema" };
  } catch (error) {
    Logger.log('Erro ao recuperar senha: ' + error);
    return { status: "erro", msg: "Erro ao recuperar senha: " + error.message };
  }
}

/**
 * Gera uma senha temporária aleatória
 * 
 * @function gerarSenhaTemporaria
 * @returns {string} Senha aleatória com 8 caracteres
 * 
 * @description Utiliza letras maiúsculas, minúsculas e números.
 *              Chamada por recuperarSenha() ao gerar novo acesso.
 * 
 * @private
 */
function gerarSenhaTemporaria() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let senha = '';
  for (let i = 0; i < 8; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}
