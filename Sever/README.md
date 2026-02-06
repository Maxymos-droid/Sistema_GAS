# 🔌 Backend - Google Apps Script Modularização v2.0

## Visão Geral

Backend convertido de arquivo monolítico (975 linhas) para **6 módulos especializados** com responsabilidades bem definidas.

## 📁 Estrutura

```
Google Scripts/
├── config.gs               ← Fundação (constantes, helpers)
├── auth.gs                 ← Autenticação, Login
├── portal.gs               ← Dados de Entregas, Métricas
├── users.gs                ← Gestão de Usuários
├── tickets.gs              ← Sistema de Tickets
├── interface.gs            ← Entry point web
└── README.md               ← Este arquivo
```

## 🏗️ Arquitetura em 4 Camadas

```
┌─────────────────────────────────────────┐
│ APRESENTAÇÃO (Apps Script Web)          │
│ interface.gs → Renderiza global.html    │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ FUNCIONALIDADES ESSENCIAIS              │
│ auth.gs → Login, Validação              │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ GESTÃO DE ENTIDADES                     │
│ users.gs, portal.gs, tickets.gs         │
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ FUNDAÇÃO (config.gs)                    │
│ Constantes, Sheets, Helpers             │
└─────────────────────────────────────────┘
```

## 📝 Módulos Detalhados

### 1️⃣ **config.gs** (120 linhas) - Fundação

**Responsabilidade**: Constantes globais e helpers

**Constantes Públicas:**
```javascript
SPREADSHEET_ID        // ID da planilha
SHEET_LOGIN           // Aba de login
SHEET_PORTAL          // Aba de portal
SHEET_TICKETS         // Aba de tickets
```

**Funções Helper:**
```javascript
include(filename)              // Carregar HTML/CSS/JS
getSpreadsheet()               // Planilha
getSheet(sheetName)            // Aba específica
formatarData(data)             // DD/MM/YYYY
formatarMoeda(valor)           // R$ XXX,XX
formatarNumero(valor, casas)   // 1.234,56
```

---

### 🔑 Padrão de IDs (coluna A)

O backend agora centraliza a geração e busca de chaves primárias usando dois helpers em `config.gs`:

- `gerarIdUnico(sheetName, prefix)` → Gera um ID único baseado em timestamp + parte aleatória e evita colisões verificando a **coluna A** da aba especificada. Use prefixes como `USER_`, `TICKET_`, `COMMENT_` para identificação rápida.
- `findRowIndexById(sheetName, id)` → Retorna a linha (1-based) onde o ID está presente na coluna A, ou `-1` se não encontrado.

Exemplos de uso:

```javascript
// Criar ticket (tickets.gs)
const novoId = gerarIdUnico(SHEET_TICKETS, 'TICKET_');
sheet.appendRow([novoId, tipo, assunto, descricao, ...]);

// Excluir usuário por id (users.gs)
const row = findRowIndexById(SHEET_LOGIN, 'USER_1707154321_1234');
if (row > 1) sheet.deleteRow(row);
```

Benefícios:
- Chaves únicas como referência estável (independente da posição/linha)
- Facilita operações de atualização/exclusão por ID
- Evita ambiguidade quando `login` pode mudar


---

### 2️⃣ **auth.gs** (205 linhas) - Autenticação

**Responsabilidade**: Login, Logout, Recuperação de Senha

**Funções RPC (Chamadas Frontend):**
```javascript
loginUsuario(usuario, senha)   // Valida login
alterarSenha(usr, atual, nova) // Troca senha
recuperarSenha(email)          // Envia senha temporária
gerarSenhaTemporaria()         // Gera aleatória
```

---

### 3️⃣ **portal.gs** (195 linhas) - Portal de Dados

**Responsabilidade**: Entregas, Métricas, Dashboard

**Funções RPC:**
```javascript
getPortalData(termo)           // Lista entregas com filtro
getPortalDataComMetricas()     // Dashboard completo com gráficos
```

---

### 4️⃣ **users.gs** (240 linhas) - Gestão de Usuários

**Responsabilidade**: CRUD de usuários (Admin)

**Funções RPC:**
```javascript
listarUsuarios()               // Todos os usuários
buscarUsuario(login)           // Um usuário específico
salvarUsuario(user, acao)      // Criar/Editar
excluirUsuario(login)          // Deletar
atualizarPerfil(login, dados)  // Usuário atualiza seu perfil
```

---

### 5️⃣ **tickets.gs** (285 linhas) - Sistema de Tickets

**Responsabilidade**: Criar, Editar, Comentar Tickets

**Funções RPC:**
```javascript
criarTicket(ticket)            // Novo ticket
listarTickets()                // Todos os tickets
atualizarStatusTicket(id, status)  // Mudar status
adicionarComentarioTicket(id, comentario)  // Comentar
listarComentarios(ticketId)    // Comentários de um ticket
contarTicketsPendentes()       // Contador de abertos
```

---

### 6️⃣ **interface.gs** (30 linhas) - Interface Web

**Responsabilidade**: Entry point, renderizar HTML

**Funções Públicas:**
```javascript
doGet()                        // Renderiza página (GET request)
```

## 🔄 Fluxo de Dados

```
1. Usuário acessa URL do Apps Script
   ↓
2. Apps Script executa doGet() (interface.gs)
   ↓
3. Carrega e renderiza global.html
   ↓
4. Navegador renderiza página
   ↓
5. JavaScript Frontend chama RPC
   google.script.run.funcao()
   ↓
6. Google Apps Script executa função em algum módulo
   ↓
7. Acessa planilha (via config.gs)
   ↓
8. Retorna resposta para JavaScript
   ↓
9. Frontend atualiza UI
```

## 📞 Exemplos de RPC

**Frontend JavaScript → Backend:**

```javascript
// Em JavaScript/auth.js
google.script.run
  .loginUsuario("admin", "123")
  .withSuccessHandler(user => { /* sucesso */ })
  .withFailureHandler(err => { /* erro */ })

// Em JavaScript/dashboard.js
google.script.run
  .getPortalDataComMetricas()
  .withSuccessHandler(data => { renderDashboard(data) })

// Em JavaScript/tickets.js
google.script.run
  .criarTicket(ticketObj)
  .withSuccessHandler(id => { alert('Ticket criado: ' + id) })
```

## 🔑 Configurações Essenciais

**Em config.gs**, atualizar:**
```javascript
const SPREADSHEET_ID = "SEU_ID_AQUI";
const SHEET_LOGIN = "Login";
const SHEET_PORTAL = "Portal";
const SHEET_TICKETS = "Tickets";
const SHEET_TICKET_COMENTARIOS = "Comentarios";
```

## 📊 Estatísticas

| Métrica | Antes | Depois |
|---------|-------|--------|
| Arquivos | 1 | 6 |
| Linhas totais | 975 | ~1.075 |
| Linhas/arquivo | 975 | ~179 (média) |
| Funções | 32+ | Distribuídas |
| RPC Functions | Misturado | Bem organizado |

## ✨ Vantagens

✅ Cada módulo tem responsabilidade clara  
✅ Fácil localizar função específica  
✅ Sem dependências circulares  
✅ Colaboração paralela possível  
✅ Debugging mais rápido  
✅ Reutilização código  
✅ 100% compatível com frontend existente  
✅ Escalável para novos recursos  

## 🚀 Adicionar Nova Função

**Exemplo: Adicionar função de Relatórios**

1. Criar novo arquivo: `reports.gs`
2. Definir função RPC:
```javascript
/**
 * Gera relatório de entregas por período
 * @param {Date} dataInicio
 * @param {Date} dataFim
 * @return {Array} Entradas
 */
function gerarRelatorio(dataInicio, dataFim) {
  const sheet = getSheet(SHEET_PORTAL);
  // ... lógica ...
  return dados;
}
```
3. Frontend chama:
```javascript
google.script.run.gerarRelatorio(inicio, fim)
```

## ⚙️ Deploy

Google Apps Script → Deploy → New Deployment → Type: Web App

## 🧪 Testes

Verificar console ou execução:
- Funções importadas corretamente
- RPC respondendo
- Dados da planilha retornando

---

**Última atualização**: Fevereiro 2026  
**Status**: ✅ Produção  
**Compatibilidade**: 100% com versão anterior
