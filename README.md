# ðŸŒ HTML - ModularizaÃ§Ã£o v3.0

## VisÃ£o Geral

HTML convertido de arquivo monolÃ­tico (830 linhas) para **11 fragmentos especializados** com responsabilidades bem definidas.

## ðŸ“ Estrutura

```
HTML/
â”œâ”€â”€ global.html              â† Importador Principal (coordenador)
â”‚
â”œâ”€â”€ login.html               â† Tela de autenticaÃ§Ã£o (60L)
â”œâ”€â”€ header.html              â† Barra superior (24L)
â”œâ”€â”€ sidebar.html             â† Menu lateral (48L)
â”œâ”€â”€ perfil.html              â† PÃ¡gina de perfil (62L)
â”œâ”€â”€ dashboard.html           â† Dashboard/GrÃ¡ficos (168L)
â”œâ”€â”€ pesquisa.html            â† Busca de CTRCs (72L)
â”œâ”€â”€ tickets.html             â† Sistema de Tickets (56L)
â”œâ”€â”€ config-sistema.html      â† ConfiguraÃ§Ãµes (35L)
â”œâ”€â”€ cadastro.html            â† Menu de Cadastros (18L)
â”œâ”€â”€ usuarios.html            â† GestÃ£o de UsuÃ¡rios (28L)
â”œâ”€â”€ ajuda.html               â† Help/FAQ (72L)
â”œâ”€â”€ modals.html              â† Todos os modais (188L)
â”‚
â””â”€â”€ README.md                â† Este arquivo
```

## ðŸ”„ Como Funciona

**global.html** carrega fragmentos usando `include()`:

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <title>Sistema</title>
  <link rel="stylesheet" href="CSS/global.css">
</head>
<body>
  <?!= include('login'); ?>
  <?!= include('header'); ?>
  <?!= include('sidebar'); ?>
  
  <main>
    <?!= include('perfil'); ?>
    <?!= include('dashboard'); ?>
    <?!= include('pesquisa'); ?>
    <?!= include('tickets'); ?>
    <!-- ... outros fragments ... -->
  </main>
  
  <?!= include('modals'); ?>
  <?!= include('javascript.js'); ?>
</body>
</html>
```

A funÃ§Ã£o `include()` estÃ¡ em **Google Scripts/config.gs**:

```javascript
function include(filename) {
  return HtmlService.createHtmlOutput(
    DriveApp.getFilesByName(filename + '.html')
      .next()
      .getBlob()
      .getDataAsString()
  ).getContent();
}
```

## ðŸ“„ Fragmentos Detalhados

### ðŸ” **login.html** (60 linhas)
- Tela de autenticaÃ§Ã£o
- Inputs: usuÃ¡rio, senha
- BotÃµes: Login, Recuperar senha
- Exibido antes do login

### ðŸŽ¨ **header.html** (24 linhas)
- Barra superior com logo
- Nome do usuÃ¡rio autenticado
- BotÃ£o de logout

### ðŸ“ **sidebar.html** (48 linhas)
- Menu lateral (navegaÃ§Ã£o)
- Links para: Dashboard, Pesquisa, Tickets, etc
- Toggle para mobile

### ðŸ‘¤ **perfil.html** (62 linhas)
- PÃ¡gina de perfil do usuÃ¡rio
- Inputs: Nome, Email
- Checkbox: Alterar senha
- BotÃ£o: Salvar

### ðŸ“Š **dashboard.html** (168 linhas)
- Cards com contadores (Abertos, Em andamento, etc)
- GrÃ¡ficos (Charts.js)
- Tabela com Ãºltimas entregas
- Atualiza via `getPortalDataComMetricas()`

### ðŸ” **pesquisa.html** (72 linhas)
- Campo de busca por CTRC
- Filtro por status
- Multi-select de status
- Tabela de resultados

### ðŸŽ« **tickets.html** (56 linhas)
- BotÃ£o: Novo Ticket
- Filtros de status (Todos, Abertos, etc)
- Busca por assunto/usuÃ¡rio
- Tabela de tickets

### âš™ï¸ **config-sistema.html** (35 linhas)
- Toggle: Tema Escuro
- Toggle: NotificaÃ§Ãµes
- Seletor: Idioma
- BotÃµes: Salvar, Reset

### ðŸ“‹ **cadastro.html** (18 linhas)
- Menu de "Cadastros" (Admin)
- Links para: UsuÃ¡rios, Categorias, etc

### ðŸ‘¥ **usuarios.html** (28 linhas)
- Listagem de usuÃ¡rios
- BotÃ£o: Novo UsuÃ¡rio
- Tabela com ediÃ§Ã£o inline

### â“ **ajuda.html** (72 linhas)
- Perguntas frequentes
- Accordion com respostas
- Link para documentaÃ§Ã£o

### ðŸªŸ **modals.html** (188 linhas)
- Modal: Novo Ticket
- Modal: Editar UsuÃ¡rio
- Modal: Deletar ConfirmaÃ§Ã£o
- Modal: Visualizar ComentÃ¡rios
- Todos os modais em um arquivo

## ðŸŽ¯ Localizar Componente

| Procurando por | Arquivo |
|---|---|
| Tela de login | login.html |
| Barra superior | header.html |
| Menu lateral | sidebar.html |
| Perfil usuÃ¡rio | perfil.html |
| Dashboard/GrÃ¡ficos | dashboard.html |
| Busca de entregas | pesquisa.html |
| Tickets | tickets.html |
| ConfiguraÃ§Ãµes | config-sistema.html |
| Menu Cadastros | cadastro.html |
| UsuÃ¡rios | usuarios.html |
| Ajuda/FAQ | ajuda.html |
| Modais/DiÃ¡logos | modals.html |

## ðŸ“Š EstatÃ­sticas

| MÃ©trica | Antes | Depois |
|---------|-------|--------|
| Arquivos | 1 | 12 |
| Linhas totais | 830 | ~900 |
| Linhas/arquivo | 830 | ~75 (mÃ©dia) |
| Manutenibilidade | â­ | â­â­â­â­â­ |
| ColaboraÃ§Ã£o | â­ | â­â­â­â­â­ |

## âœ¨ Vantagens

âœ… Cada arquivo serve um propÃ³sito claro  
âœ… FÃ¡cil encontrar componente  
âœ… Sem cÃ³digo duplicado  
âœ… ColaboraÃ§Ã£o paralela possÃ­vel  
âœ… ReutilizaÃ§Ã£o de fragmentos  
âœ… ManutenÃ§Ã£o centralizada  
âœ… EscalÃ¡vel para novos fragmentos  
âœ… Cache de fragmentos  

## ðŸš€ Adicionar Novo Fragmento

**Exemplo: Adicionar pÃ¡gina de "RelatÃ³rios"**

1. Criar arquivo: `HTML/relatorios.html`
```html
<!-- RelatÃ³rios -->
<section id="telaRelatorios" class="tela-interna">
  <div class="page-header">
    <h2>RelatÃ³rios</h2>
    <button class="btn-primary" onclick="gerarRelatorio()">
      Gerar
    </button>
  </div>
  <!-- ConteÃºdo -->
</section>
```

2. Adicionar em `global.html`:
```html
<?!= include('relatorios'); ?>
```

3. Adicionar link em `sidebar.html`:
```html
<a href="#" onclick="irTela('telaRelatorios')">RelatÃ³rios</a>
```

## ðŸ”„ Ciclo de Vida

```
1. UsuÃ¡rio acessa URL
   â†“
2. Google Apps Script executa doGet()
   â†“
3. Renderiza global.html
   â†“
4. include() carrega cada fragmento
   â†“
5. HTML + CSS carregados
   â†“
6. JavaScript executa
   â†“
7. RPC chamadas ao backend
   â†“
8. PÃ¡gina interativa
```

## ðŸŽ¨ PadrÃ£o de Estrutura

Cada fragmento segue:

```html
<!-- SEÃ‡ÃƒO TÃTULO -->
<section id="telaNome" class="tela-interna">
  <div class="page-header">
    <h2>TÃ­tulo</h2>
    <button class="btn-primary">AÃ§Ã£o</button>
  </div>
  
  <div class="content">
    <!-- ConteÃºdo dos dados -->
  </div>
</section>
```

## ðŸ“± Responsivo

Todos os fragmentos suportam:
- âœ… Desktop (100% width)
- âœ… Tablet (ajusta sidebar)
- âœ… Mobile (sidebar colapsado)

## ðŸ§ª Testes

Verificar:
- Todos os fragmentos carregando
- Sem erros no console
- CSS aplicado corretamente
- JavaScript funcionando

---

**Ãšltima atualizaÃ§Ã£o**: Fevereiro 2026  
**Status**: âœ… ProduÃ§Ã£o  
**Responsivo**: âœ… Sim  
**Compatibilidade**: 100% com versÃ£o anterior

---

## Atualização (2026-02-09)

- IDs de usuário agora são sequenciais na coluna A.
- Toasts corrigidos (sem conflito com Bootstrap).
- Confirmações migradas para modal genérico reutilizável.
- Modal de logout legado removido.

Nota: a estrutura atual usa `Templates/`, `JS/` e `CSS/` com `includeCSS()` e `includeJS()` em `Sever/config.js`.
