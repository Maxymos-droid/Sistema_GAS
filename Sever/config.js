/**
 * @fileoverview CONFIGURAÇÕES E CONSTANTES
 * Define valores globais, IDs de planilha e funções auxiliares
 * compartilhadas por todo o backend.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== CONSTANTES GLOBAIS ====================

/**
 * @type {string} ID da planilha do Google Sheets
 * Todas as operações de dados utilizam esta planilha
 */
const SPREADSHEET_ID = '1BM6BtaMVcTmDQxColHwj6cEKwnkyNCsUx7cPUT-7t64';

/**
 * @type {string} Nome da aba de login
 */
const SHEET_LOGIN = 'LOGIN';

/**
 * @type {string} Nome da aba de portal
 */
const SHEET_PORTAL = 'PORTAL';

/**
 * @type {string} Nome da aba de tickets
 */
const SHEET_TICKETS = 'TICKETS';

/**
 * @type {string} Nome da aba de comentários de tickets
 */
const SHEET_TICKET_COMENTARIOS = 'TICKET_COMENTARIOS';

/**
 * @type {string} Nome da aba de notificações do sistema
 */
const SHEET_NOTIFICACOES = 'NOTIFICACOES';

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Função helper para incluir conteúdo de arquivos HTML/CSS/JS
 * Utilizada no mainTemplate.html para importar arquivos
 * 
 * @function include
 * @param {string} filename - Nome do arquivo a incluir (sem extensão)
 * @returns {string} Conteúdo HTML do arquivo incluído
 * 
 * @example
 * // Dentro de mainTemplate.html:
 * <?!= include('clientSideController'); ?>
 * <?!= include('global'); ?>
 * 
 * @description Cria HtmlOutput a partir de arquivo e retorna conteúdo
 *              como texto para embedding no template.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Helper para obter referência à planilha principal
 * 
 * @function getSpreadsheet
 * @returns {Spreadsheet} Objeto da planilha
 * @throws {Error} Se planilha não conseguir ser aberta
 * @private
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Helper para obter referência a uma aba específica
 * 
 * @function getSheet
 * @param {string} sheetName - Nome da aba
 * @returns {Sheet|null} Objeto da aba ou null se não existir
 * @private
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(sheetName) || null;
}

/**
 * Helper para formatação de data
 * 
 * @function formatarData
 * @param {Date} data - Data a formatar
 * @returns {string} Data no formato DD/MM/YYYY
 * @private
 */
function formatarData(data) {
  if (!(data instanceof Date)) return '';
  return Utilities.formatDate(data, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

/**
 * Helper para formatação de valor monetário
 * 
 * @function formatarMoeda
 * @param {number} valor - Valor a formatar
 * @returns {string} Valor formatado em BRL
 * @private
 */
function formatarMoeda(valor) {
  if (typeof valor !== 'number') return '';
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Helper para formatação de número
 * 
 * @function formatarNumero
 * @param {number} valor - Número a formatar
 * @param {number} [casas=0] - Casas decimais
 * @returns {string} Número formatado
 * @private
 */
function formatarNumero(valor, casas = 0) {
  if (typeof valor !== 'number') return '';
  return valor.toLocaleString("pt-BR", { 
    minimumFractionDigits: casas, 
    maximumFractionDigits: casas 
  });
}

// ==================== SISTEMA DE CSS ====================

/**
 * Retorna todos os estilos CSS do sistema (v4.0)
 * Arquivos CSS estão em wrappers HTML em CSS/*-css.html
 * 
 * @function includeSistemaCSS
 * @returns {string} Tags <link> com todos os CSS
 * @description 
 * Carrega CSS em ordem de prioridade:
 * 1. global-css.html (importador principal com @import de todos os módulos)
 * 2. Estilos adicionais conforme necessário
 * 
 * @note Após conversão v3.0→v4.0:
 * - Arquivos agora estão em CSS/{nome}-css.html
 * - Original v2.0 em backup/CSS/
 * 
 * @example
 * // No HTML:
 * <?!= includeSistemaCSS(); ?>

function includeSistemaCSS() {
  const cssArray = [
    'CSS/global-css.html'  // Wrapper com todos os estilos
  ];
  
  // Gera tags <link> para cada arquivo CSS
  return cssArray
    .map(file => `<link rel="stylesheet" href="${file}">`)
    .join('\n  ');
}
 */
function includeCSS() {
  return `
    ${include('CSS/variables-css')}
    ${include('CSS/layout-css')}
    ${include('CSS/buttons-css')}
    ${include('CSS/forms-css')}
    ${include('CSS/tables-css')}
    ${include('CSS/modals-css')}
    ${include('CSS/components-css')}
    ${include('CSS/tickets-css')}
    ${include('CSS/animations-css')}
    ${include('CSS/responsive-css')}
    ${include('CSS/themes-css')}
  `;
}



// ==================== SISTEMA DE JAVASCRIPT ====================

/**
 * Retorna todos os scripts JavaScript do sistema (v4.0)
 * Arquivos JS estão em wrappers HTML em JS/*-js.html
 * 
 * @function includeSistemaJS
 * @returns {string} Tags <script> com todos os JS
 * @description
 * Carrega JavaScript em ordem crítica (ORDEM IMPORTA - DEPENDÊNCIAS):
 * 1. state-js.html (estado - SEMPRE PRIMEIRO)
 * 2. storage-js.html (cookies)
 * 3. utils-js.html, ui-js.html (utilidades)
 * 4. auth-js.html, navigation-js.html (autenticação)
 * 5. search-js.html, table-js.html, dashboard-js.html (features)
 * 6. users-js.html, profile-js.html, tickets-js.html (gestão)
 * 7. settings-js.html, help-js.html, init-js.html (sistema)
 * 8. bugs-js.html (SEMPRE ÚLTIMO - tratamento de erros)
 * 
 * @note Após conversão v3.0→v4.0:
 * - Arquivos agora estão em JS/{nome}-js.html
 * - Original v2.0 em backup/JavaScript/
 * 
 * @example
 * // No HTML:
 * <?!= includeSistemaJS(); ?>
 
function includeSistemaJS() {
  // ORDEM CRÍTICA - NÃO ALTERAR
  // Dependências: state → storage → utils → ... → init → bugs
  const jsArray = [
    // NÚCLEO (Fundação)
    'JS/state-js.html',
    'JS/storage-js.html',
    
    // UTILIDADES
    'JS/utils-js.html',
    'JS/ui-js.html',
    
    // AUTENTICAÇÃO & NAVEGAÇÃO
    'JS/auth-js.html',
    'JS/navigation-js.html',
    
    // FEATURES (Dados)
    'JS/search-js.html',
    'JS/table-js.html',
    'JS/dashboard-js.html',
    
    // GESTÃO DE ENTIDADES
    'JS/users-js.html',
    'JS/profile-js.html',
    'JS/tickets-js.html',
    
    // SISTEMA
    'JS/settings-js.html',
    'JS/help-js.html',
    'JS/init-js.html',
    'JS/bugs-js.html'
  ];
  
  // Gera tags <script> para cada arquivo
  return jsArray
    .map(file => `<script src="${file}"></script>`)
    .join('\n  ');
}
*/
function includeJS() {
  return `
    <!-- NÚCLEO (Fundação) -->
    ${include('JS/state-js')}
    ${include('JS/storage-js')}

    <!-- UTILIDADES -->
    ${include('JS/utils-js')}
    ${include('JS/ui-js')}

    <!-- AUTENTICAÇÃO & NAVEGAÇÃO -->
    ${include('JS/auth-js')}
    ${include('JS/navigation-js')}
    
    <!-- FEATURES (Dados) -->
    ${include('JS/search-js')}
    ${include('JS/table-js')}
    ${include('JS/dashboard-js')}
    
    <!-- GESTÃO DE ENTIDADES -->
    ${include('JS/users-js')}
    ${include('JS/profile-js')}
    ${include('JS/tickets-js')}
    
    <!-- SISTEMA -->
    ${include('JS/settings-js')}
    ${include('JS/help-js')}
    ${include('JS/init-js')}
    ${include('JS/bugs-js')}
  `;
}


// ==================== GERADOR DE IDS ÚNICOS ====================

/**
 * Gera um ID único para uma aba específica garantindo não colidir com valores
 * já presentes na coluna A da planilha. Retorna string com prefixo opcional.
 *
 * @function gerarIdUnico
 * @param {string} sheetName - Nome da aba onde verificar duplicatas
 * @param {string} [prefix=''] - Prefixo para o ID (ex: 'TICKET_', 'USER_')
 * @returns {string} ID único gerado
 */
function gerarIdUnico(sheetName, prefix = '') {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  // Se a aba não existir, cria com cabeçalho padrão mínimo (ID na coluna A)
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Cria cabeçalho com ID na coluna A para manter padrão
    sheet.appendRow(['ID']);
  }

  const lastRow = Math.max(1, sheet.getLastRow());
  const range = sheet.getRange(1, 1, lastRow, 1);
  const values = range.getValues().flat().map(v => (v === null || v === undefined) ? '' : String(v));

  const maxAttempts = 5000;
  let attempt = 0;
  let id;

  do {
    attempt++;
    // combina timestamp + 4 dígitos aleatórios para reduzir colisões
    const randomPart = Math.floor(Math.random() * 9000) + 1000; // 1000..9999
    id = prefix + Date.now().toString() + '_' + randomPart;

    if (attempt > maxAttempts) {
      throw new Error('Não foi possível gerar um ID único após muitas tentativas');
    }
  } while (values.indexOf(id) !== -1);

  return id;
}

/**
 * Gera um ID numérico sequencial (1, 2, 3, ...) único na coluna A.
 * @function gerarIdSequencial
 * @param {string} sheetName - Nome da aba onde verificar duplicatas
 * @returns {string} ID numérico sequencial
 */
function gerarIdSequencial(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(['ID']);
  }

  const lastRow = Math.max(1, sheet.getLastRow());
  const values = sheet.getRange(1, 1, lastRow, 1).getValues().flat();

  let maxId = 0;
  for (let i = 0; i < values.length; i++) {
    const n = Number(values[i]);
    if (!Number.isNaN(n) && n > maxId) maxId = n;
  }

  return String(maxId + 1);
}

/**
 * Gera um ID numérico sequencial para uma coluna específica (ignorando cabeçalho).
 * @function gerarSequencialColuna
 * @param {string} sheetName - Nome da aba
 * @param {number} colIndex - Índice da coluna (1-based)
 * @returns {string} ID sequencial
 */
function gerarSequencialColuna(sheetName, colIndex) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return "1";

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return "1";

  const values = sheet.getRange(2, colIndex, lastRow - 1, 1).getValues().flat();
  let maxId = 0;
  for (let i = 0; i < values.length; i++) {
    const raw = String(values[i] == null ? '' : values[i]);
    const digits = raw.replace(/\D/g, '');
    if (!digits) continue;
    const n = Number(digits);
    if (!Number.isNaN(n) && n > maxId) maxId = n;
  }
  return String(maxId + 1);
}

/**
 * Procura a linha (1-based) onde o ID está presente na coluna A
 * @function findRowIndexById
 * @param {string} sheetName
 * @param {string} id
 * @returns {number} Índice da linha (1-based) ou -1 se não encontrado
 */
function findRowIndexById(sheetName, id) {
  const sheet = getSheet(sheetName);
  if (!sheet) return -1;
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return -1;

  const values = sheet.getRange(1, 1, lastRow, 1).getValues().flat().map(v => (v===null||v===undefined)?'':String(v));
  for (let i = 0; i < values.length; i++) {
    if (values[i] === id) return i + 1; // 1-based
  }
  return -1;
}
