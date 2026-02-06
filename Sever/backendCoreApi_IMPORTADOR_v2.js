/**
 * @fileoverview BACKEND CORE API - IMPORTADOR MODULAR
 * Arquivo principal que coordena e carrega todos os módulos backend.
 * 
 * ARQUITETURA MODULAR v2.0
 * ═════════════════════════════════════════════════════════════════
 * Este arquivo é um IMPORTADOR que carrega os módulos em ordem:
 * 
 *  1. config.gs          - Constantes e helpers
 *  2. auth.gs            - Autenticação e login
 *  3. portal.gs          - Dados e métricas do portal
 *  4. users.gs           - Gestão de usuários
 *  5. tickets.gs         - Sistema de tickets
 *  6. interface.gs       - Interface web (doGet)
 * 
 * ORDEM CRÍTICA: Não altere! Cada módulo depende dos anteriores.
 * ═════════════════════════════════════════════════════════════════
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0 Modularizado
 * @date 2026-02-05
 * 
 * @fileoverview_detailed
 * 
 * ESTRUTURA ANTERIOR (v1.0):
 * - 1 arquivo monolítico (backendCoreApi.gs) com 978 linhas
 * - Difícil manutenção
 * - Difícil colaboração em paralelo
 * 
 * ESTRUTURA NOVA (v2.0):
 * - 6 módulos especializados (total ~1.000 linhas)
 * - Cada responsabilidade isolada
 * - Fácil encontrar função específica
 * - Fácil adicionar novas features
 * 
 * COMO USAR:
 * 
 *  1. Editar função de autenticação?
 *     → Abra auth.gs
 * 
 *  2. Adicionar função de tickets?
 *     → Adicione em tickets.gs
 * 
 *  3. Adicionar nova constante?
 *     → Adicione em config.gs
 * 
 *  4. Precisar de nova métrica?
 *     → Adicione em portal.gs
 * 
 *  5. Adicionar novo módulo inteiro?
 *     → 1. Crie novo arquivo (ex: reports.gs)
 *     → 2. Escreva suas funções
 *     → 3. Não precisa atualizar nada - já é carregado automaticamente
 * 
 * ═════════════════════════════════════════════════════════════════
 * 
 * MAPEAMENTO DE FUNÇÕES PÚBLICAS POR MÓDULO:
 * 
 * config.gs (Constantes + Helpers)
 *   - include(filename)
 *   - getSpreadsheet()
 *   - getSheet(sheetName)
 *   - formatarData(data)
 *   - formatarMoeda(valor)
 *   - formatarNumero(valor, casas)
 * 
 * auth.gs (Autenticação)
 *   - loginUsuario(usuario, senha)
 *   - alterarSenha(usuario, senhaAtual, novaSenha)
 *   - recuperarSenha(email)
 *   - gerarSenhaTemporaria()
 * 
 * portal.gs (Dados + Métricas)
 *   - getPortalData(termo)
 *   - getPortalDataComMetricas()
 * 
 * users.gs (Gestão de Usuários)
 *   - listarUsuarios()
 *   - buscarUsuario(login)
 *   - salvarUsuario(usuario, acao)
 *   - excluirUsuario(login)
 *   - atualizarPerfil(login, dados)
 * 
 * tickets.gs (Sistema de Tickets)
 *   - criarTicket(ticket)
 *   - listarTickets(usuario, isAdmin)
 *   - atualizarStatusTicket(id, novoStatus)
 *   - adicionarComentarioTicket(ticketId, comentario)
 *   - listarComentariosTicket(ticketId)
 *   - contarTicketsPendentes(usuario, isAdmin)
 * 
 * interface.gs (Interface Web)
 *   - doGet() [PONTO DE ENTRADA AUTOMÁTICO DO APPS SCRIPT]
 * 
 * ═════════════════════════════════════════════════════════════════
 * 
 * GOOGLE APPS SCRIPT - COMO FUNCIONA:
 * 
 *  1. Usuário acessa URL da web app
 *  2. Google Apps Script carrega TODOS os arquivos .gs
 *  3. Executa função doGet() automaticamente
 *  4. Retorna HTML renderizado para navegador
 *  5. JavaScript no HTML chama google.script.run.funcaoAqui()
 *  6. Google Apps Script executa função e retorna resultado
 *  7. JavaScript no navegador processa resultado e atualiza página
 * 
 * ═════════════════════════════════════════════════════════════════
 * 
 * DEPENDÊNCIAS ENTRE MÓDULOS:
 * 
 * config.gs
 *   ↓ (todas as funções dependem)
 * auth.gs, portal.gs, users.gs, tickets.gs
 *   ↓ (todas usam getSpreadsheet, getSheet, formatação)
 * interface.gs
 *   ↓ (doGet chama include, que vem de config.gs)
 * 
 * ═════════════════════════════════════════════════════════════════
 * 
 * MELHORIAS IMPLEMENTADAS:
 * 
 * ✅ Separação de responsabilidades
 *    - Autenticação isolada em auth.gs
 *    - Dados isolados em portal.gs
 *    - Usuários isolados em users.gs
 *    - Tickets isolados em tickets.gs
 * 
 * ✅ Reutilização de código
 *    - Helpers centralizados em config.gs
 *    - getSpreadsheet() e getSheet() usados por todos
 *    - Formatação de dados centralizada
 * 
 * ✅ Manutenção facilitada
 *    - Fácil encontrar função específica
 *    - Fácil adicionar nova função relacionada
 *    - Fácil debugar módulo específico
 * 
 * ✅ Colaboração em paralelo
 *    - Diferentes pessoas podem trabalhar em módulos diferentes
 *    - Sem conflitos de merge (arquivos separados)
 * 
 * ✅ Documentação completa
 *    - JSDoc em cada função
 *    - Exemplos de uso
 *    - Parâmetros documentados
 *    - Tipos de retorno documentados
 * 
 * ═════════════════════════════════════════════════════════════════
 * 
 * PRÓXIMOS PASSOS RECOMENDADOS:
 * 
 * Curto prazo (Semana 1):
 *   □ Testar cada módulo isoladamente
 *   □ Verificar se todas as funções funcionam igual
 *   □ Rodar smart tests no Apps Script
 * 
 * Médio prazo (Mês 1):
 *   □ Adicionar novo módulo para Reports
 *   □ Implementar cache de dados
 *   □ Adicionar rate limiting
 * 
 * Longo prazo (Trimestre 1):
 *   □ Implementar sistema de logging
 *   □ Adicionar error tracking
 *   □ Setup CI/CD para testes automáticos
 * 
 * ═════════════════════════════════════════════════════════════════
 */

// Todos os módulos são carregados automaticamente pelo Google Apps Script
// Não é necessário fazer nada aqui - cada .gs é um módulo independente!

// Comentário: Este arquivo serve como DOCUMENTAÇÃO DA ARQUITETURA
// A verdadeira magia acontece quando você abre cada arquivo individual.
