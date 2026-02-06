/**
 * @fileoverview INTERFACE WEB
 * Responsável pela renderização inicial da aplicação HTML
 * via Google Apps Script Web App.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== INTERFACE WEB ====================

/**
 * Função chamada automaticamente pelo Google Apps Script para renderizar 
 * a interface web da aplicação. Ponto de entrada principal.
 * 
 * @function doGet
 * @returns {HtmlOutput} Saída HTML da aplicação renderizada e configurada
 * 
 * @description 1. Carrega template principal (global.html)
 *              2. Fornece título da aplicação
 *              3. Configura XFrame para permitir embedding
 *              4. Retorna ao navegador para renderização
 * 
 * @example
 * // Quando usuário acessa a URL do Apps Script
 * // Google Apps Script automaticamente chama doGet()
 * // Retorna página HTML da aplicação renderizada
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('CTRC Analyzer - Sistema de Gestão de Entregas')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
