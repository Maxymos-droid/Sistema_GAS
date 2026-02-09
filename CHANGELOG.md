# ðŸ“ CHANGELOG - Sistema CTRC Analyzer

## [2.1.0] - Fevereiro 6, 2026

### ðŸ”„ AlteraÃ§Ãµes Principais

#### 1. **RefatoraÃ§Ã£o de Render da Interface**
- âœ… Alterado em `interface.js` / `doGet()`:
  - Antes: `createTemplateFromFile('global')`
  - Depois: `createTemplateFromFile('index')`
  - Motivo: ConsolidaÃ§Ã£o de nomenclatura (global.html â†’ index.html)

#### 2. **AtualizaÃ§Ã£o de Includes em index.html**
- âœ… Templates agora usam nomenclatura padronizada:
  ```html
  <?!= include('Templates/login'); ?>
  <?!= include('Templates/header'); ?>
  <?!= include('Templates/sidebar'); ?>
  <!-- ... e outros */
  ```
- Estrutura: `Templates/{nome}`
- Modais consolidados em: `Templates/modals`

#### 3. **RefatoraÃ§Ã£o do Sistema de CSS** ðŸŽ¨
- âœ… FunÃ§Ã£o `includeSistemaCSS()` â†’ comentada
- âœ… Nova funÃ§Ã£o `includeCSS()` em [Sever/config.js](Sever/config.js#L160)
- **Estrutura Modular:**
  ```javascript
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
  ```
- BenefÃ­cios:
  - âœ… SeleÃ§Ã£o dinÃ¢mica de estilos
  - âœ… CSS carregado inline (mÃºltiplos includes â†’ template strings)
  - âœ… Facilita adiÃ§Ã£o de novos mÃ³dulos CSS

#### 4. **RefatoraÃ§Ã£o do Sistema de JavaScript** âš™ï¸
- âœ… FunÃ§Ã£o `includeSistemaJS()` â†’ comentada
- âœ… Nova funÃ§Ã£o `includeJS()` em [Sever/config.js](Sever/config.js#L244)
- **Estrutura com Ordem CrÃ­tica de Carregamento:**
  ```javascript
  function includeJS() {
    return `
      <!-- NÃšCLEO (FundaÃ§Ã£o) -->
      <script>${include('JS/state-js')}</script>
      <script>${include('JS/storage-js')}</script>

      <!-- UTILIDADES -->
      <script>${include('JS/utils-js')}</script>
      <script>${include('JS/ui-js')}</script>

      <!-- AUTENTICAÃ‡ÃƒO & NAVEGAÃ‡ÃƒO -->
      <script>${include('JS/auth-js')}</script>
      <script>${include('JS/navigation-js')}</script>
      
      <!-- FEATURES (Dados) -->
      <script>${include('JS/search-js')}</script>
      <script>${include('JS/table-js')}</script>
      <script>${include('JS/dashboard-js')}</script>
      
      <!-- GESTÃƒO DE ENTIDADES -->
      <script>${include('JS/users-js')}</script>
      <script>${include('JS/profile-js')}</script>
      <script>${include('JS/tickets-js')}</script>
      
      <!-- SISTEMA -->
      <script>${include('JS/settings-js')}</script>
      <script>${include('JS/help-js')}</script>
      <script>${include('JS/init-js')}</script>
      <script>${include('JS/bugs-js')}</script>
    `;
  }
  ```
- **Ordem de DependÃªncias (NÃƒO ALTERAR):**
  1. state-js (Estado global - SEMPRE PRIMEIRO)
  2. storage-js (PersistÃªncia de dados)
  3. utils-js, ui-js (Utilidades gerais)
  4. auth-js, navigation-js (AutenticaÃ§Ã£o)
  5. search-js, table-js, dashboard-js (Features)
  6. users-js, profile-js, tickets-js (GestÃ£o)
  7. settings-js, help-js, init-js (Sistema)
  8. bugs-js (Tratamento de erros - SEMPRE ÃšLTIMO)

### ðŸ”§ CorreÃ§Ãµes de Bugs

#### Bug: Erros de Aspas em includeJS()
- **Problema**: Linhas com `'<script>` causavam erro de syntax
- **SoluÃ§Ã£o**: Removidas aspas incorretas, mantidas em template string
- **Arquivos afetados**: [Sever/config.js](Sever/config.js#L244)

#### Bug: EspaÃ§o Incorreto em CSS
- **Problema**: `'CSS/buttons-css '` (com espaÃ§o extra)
- **SoluÃ§Ã£o**: Normalizado para `'CSS/buttons-css'`
- **Impacto**: Preventia carregamento correto do CSS

### ðŸ“Š ComparaÃ§Ã£o de VersÃµes

| Aspecto | v2.0 | v2.1.0 |
|---------|------|--------|
| Render Template | global.html | index.html âœ… |
| Sistema CSS | @import em arquivo | Template modular âœ… |
| Sistema JS | array com src | Template modular âœ… |
| FormataÃ§Ã£o | Inconsistente | Padronizada âœ… |
| Manutenibilidade | MÃ©dia | Alta âœ… |

## ðŸ“‹ PrÃ³ximas Tarefas

- [ ] Testes de carregamento de CSS (verificar orden)
- [ ] Testes de carregamento de JS (verificar dependÃªncias)
- [ ] ValidaÃ§Ã£o de tokens de autenticaÃ§Ã£o
- [ ] Documentar possÃ­veis erros de console

## ðŸš€ Como Utilizar

### Adicionar novo CSS
```javascript
// Em includeCSS():
${include('CSS/novo-modulo-css')}
```

### Adicionar novo JS
```javascript
// Em includeJS():
// ATENÃ‡ÃƒO: Respeitar ordem de dependÃªncias!
<script>${include('JS/novo-modulo-js')}</script>
```

## âš ï¸ Notas Importantes

1. **A ORDEM DO JAVASCRIPT IMPORTA** - NÃ£o alterar sem validar dependÃªncias
2. **Template Strings** - Usar backticks (`) para includes
3. **Compatibilidade** - Manter backward compatibility com versÃ£o anterior
4. **Testes** - Sempre testar no console apÃ³s mudanÃ§as

## ðŸ” Erros Conhecidos

### Token Errors no Console
- **Status**: ðŸ”´ A investigar
- **DescriÃ§Ã£o**: PossÃ­veis erros de token durante carregamento
- **PrÃ³ximo Passo**: Executar `clasp push` apÃ³s habilitar Apps Script API

---

**VersÃ£o**: 2.1.0  
**Data**: Fevereiro 6, 2026  
**Autor**: Sistema CTRC Analyzer  
**Status**: â³ Testes em andamento

---

## 2.1.1 - 2026-02-09

### Correções
- Corrigido conflito de `id` no modal de usuário (login do modal não conflita com login da tela).
- Ajustado fluxo de confirmação para usar modal genérico (Sim/Não).

### Melhorias
- IDs de usuário agora são sequenciais na coluna A.
- Sistema de toast ajustado para não conflitar com Bootstrap (`app-toast`).
- Confirmações migradas para modal reutilizável.

### Remoções
- Removido `modalLogout` legado e funções associadas.
