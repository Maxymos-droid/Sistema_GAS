# ðŸ” Guia de Debugging: Erros de Token

## ðŸŽ¯ Objetivo

AjudÃ¡-lo a identificar e resolver erros de token no console do navegador.

---

## ðŸ“ Como Acessar o Console

### 1. **Abrir Developer Tools**
- **Windows/Linux**: `F12` ou `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`
- Alternativa: Clique direito â†’ "Inspecionar"

### 2. **Navegar atÃ© Console**
- Clique na aba **"Console"** no topo

---

## ðŸ” Tipos de Erros de Token Comuns

### âŒ Erro 1: "token is undefined"
```javascript
// Console mostra:
Uncaught ReferenceError: token is not defined
    at auth-js.html:25:10
```

**Causas:**
- State-js nÃ£o foi carregado
- Storage-js nÃ£o inicializou
- AutenticaÃ§Ã£o ainda nÃ£o completada

**SoluÃ§Ã£o:**
```javascript
// No console, teste:
console.log(window.globalState); // Deve ser um objeto
console.log(window.globalState.token); // Deve ter valor
```

---

### âŒ Erro 2: "Cannot read property 'token' of undefined"
```javascript
// Console mostra:
TypeError: Cannot read property 'token' of undefined
    at navigation-js.html:42:15
```

**Causas:**
- `globalState` nÃ£o existe
- State-js falhou ao carregar

**SoluÃ§Ã£o:**
```javascript
// No console, teste:
if (typeof globalState === 'undefined') {
  console.error('State nÃ£o foi inicializado');
} else {
  console.log('State OK:', globalState);
}
```

---

### âŒ Erro 3: "Token expired" ou "401 Unauthorized"
```javascript
// Console mostra:
Fetch failed with status 401
// Ou no Network tab: 401 Unauthorized
```

**Causas:**
- Token expirou
- Token invÃ¡lido
- Credenciais de login erradas

**SoluÃ§Ã£o:**
```javascript
// No console, teste:
console.log('Token atual:', globalState.token);
console.log('Expira em:', globalState.tokenExpireTime);

// Se expirou, fazer login novamente
doLogin(usuÃ¡rio, senha);
```

---

### âŒ Erro 4: "Script error" ou erro em bugs-js
```javascript
// Console mostra:
Script error
    at bugs-js.html:...
```

**Causas:**
- Erro em mÃ³dulo anterior nÃ£o foi capturado
- Bugs-js estÃ¡ capturando erro de outro mÃ³dulo

**SoluÃ§Ã£o:**
1. Expandir o erro no console
2. Ver o stack trace completo
3. Identificar linha exata do erro

---

## âœ… VerificaÃ§Ã£o Passo-a-Passo

### Passo 1: Verificar Carregamento de MÃ³dulos

```javascript
// Cole no console:
console.log('=== VERIFICAÃ‡ÃƒO DE MÃ“DULOS ===');
console.log('state:', typeof window.globalState !== 'undefined' ? 'âœ…' : 'âŒ');
console.log('storage:', typeof StorageManager !== 'undefined' ? 'âœ…' : 'âŒ');
console.log('utils:', typeof formatarData !== 'undefined' ? 'âœ…' : 'âŒ');
console.log('auth:', typeof doLogin !== 'undefined' ? 'âœ…' : 'âŒ');
console.log('navigation:', typeof irTela !== 'undefined' ? 'âœ…' : 'âŒ');
```

**Resultado esperado:**
```
=== VERIFICAÃ‡ÃƒO DE MÃ“DULOS ===
state: âœ…
storage: âœ…
utils: âœ…
auth: âœ…
navigation: âœ…
```

### Passo 2: Verificar Token

```javascript
// Cole no console:
console.log('=== VERIFICAÃ‡ÃƒO DE TOKEN ===');
console.log('Token:', window.globalState?.token);
console.log('User:', window.globalState?.user);
console.log('Logged in:', window.globalState?.isLoggedIn);
```

**Resultado esperado (usuÃ¡rio logado):**
```
=== VERIFICAÃ‡ÃƒO DE TOKEN ===
Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
User: user@example.com
Logged in: true
```

**Resultado esperado (usuÃ¡rio NÃƒO logado):**
```
=== VERIFICAÃ‡ÃƒO DE TOKEN ===
Token: null
User: null
Logged in: false
```

### Passo 3: Verificar Erro EspecÃ­fico

```javascript
// Cole no console:
console.log('=== HISTÃ“RICO DE ERROS ===');
console.log(window.globalState?.errors || 'Nenhum erro registrado');
```

---

## ðŸ› ï¸ TÃ©cnicas de Debugging

### TÃ©cnica 1: Console.log em Pontos CrÃ­ticos

Editar arquivo JS e adicionar:

```javascript
// Em auth-js.html:
function doLogin(username, password) {
  console.log('ðŸ” Tentando login...', username);
  
  // ... cÃ³digo original ...
  
  console.log('âœ… Login bem-sucedido, token:', token);
}
```

### TÃ©cnica 2: Breakpoints

1. Abrir DevTools (F12)
2. Aba "Sources"
3. Procurar arquivo (Ctrl+P)
4. Clicar no nÃºmero da linha para criar breakpoint
5. Recarregar pÃ¡gina (F5)
6. PausarÃ¡ na linha - inspecionar variÃ¡veis

### TÃ©cnica 3: Watch Expressions

1. DevTools aberto, aba "Sources"
2. Procurar painel "Watch" (lado direito)
3. Clique em "âž•" para adicionar
4. Digitar: `globalState.token`
5. SerÃ¡ atualizado em tempo real

### TÃ©cnica 4: Network Monitor

1. DevTools, aba "Network"
2. Fazer aÃ§Ã£o que gera erro
3. Procurar requisiÃ§Ã£o em VERMELHO (4xx, 5xx)
4. Clicar nela
5. Verificar:
   - **Headers**: Status code, Headers
   - **Response**: Mensagem de erro
   - **Preview**: Dados de resposta

---

## ðŸ§ª Testes Manuais

### Teste 1: Login Flow

```javascript
// 1. Abrir console e executar:
console.clear();
console.log('TESTE 1: Login Flow');

// 2. Fazer login via UI
// 3. Verificar no console:
console.log('Token apÃ³s login:', window.globalState.token);

// Esperado: Token presente (string longa)
```

### Teste 2: NavegaÃ§Ã£o entre Telas

```javascript
// 1. ApÃ³s fazer login bem-sucedido
// 2. Clicar em diferentes seÃ§Ãµes (Dashboard, Tickets, etc)
// 3. Abrir console e executar:
console.log('Tela atual:', document.querySelector('.tela-interna.ativa')?.id);

// Esperado: ID da tela visÃ­vel (e.g., 'telaDashboard')
```

### Teste 3: PersistÃªncia de Token

```javascript
// 1. Fazer login
// 2. Abrir DevTools â†’ Application â†’ LocalStorage/Cookies
// 3. Procurar por: token, user, session
// 4. Recarregar pÃ¡gina (F5)
// 5. Verificar se token ainda estÃ¡ lÃ¡

// Esperado: Token mantido apÃ³s reload
```

---

## ðŸ“Š Checklist de Debugging

- [ ] Console aberto (F12)
- [ ] Sem erros "red" no console
- [ ] MÃ³dulos estÃ£o carregados (verificaÃ§Ã£o do Passo 1)
- [ ] Token presente apÃ³s login (Passo 2)
- [ ] NavegaÃ§Ã£o funcionando (Passo 3)
- [ ] Network: Sem 401, 403, 500
- [ ] Telas: CSS sendo aplicado
- [ ] Buttons: Funcionando

---

## ðŸ†˜ Se Nada Funcionar

### 1. Verificar Apps Script API Habilitada
- Ir para: https://script.google.com/home/usersettings
- Procurar: "Apps Script API"
- Verificar se estÃ¡ habilitado
- Se nÃ£o, habilitar e aguardar 5 minutos

### 2. Limpar Cache

```javascript
// No console do Apps Script:
localStorage.clear();
sessionStorage.clear();
```

Depois recarregar a pÃ¡gina.

### 3. Reiniciar SessÃ£o

1. Logout (se possÃ­vel)
2. Fechar aba
3. Abrir link novamente
4. Tentar login

### 4. Verificar Logs do Backend

Ir para: Google Apps Script â†’ ExecuÃ§Ãµes  
Procurar por erros recentes

---

## ðŸ“ž InformaÃ§Ãµes para Reportar Bug

Se problema persistir, registre:

```
# RelatÃ³rio de Bug

**Erro visto no console:**
[Cole o erro exato aqui]

**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Resultado esperado:**
[Descrever]

**Resultado atual:**
[Descrever]

**Ambiente:**
- Browser: [Chrome, Firefox, etc]
- URL do Apps Script: [copiar da barra]
- Data/Hora do erro: [quando ocorreu]

**HistÃ³rico do console:**
[Cole resultado de:
console.log(window.globalState);
]
```

---

## ðŸ“š Recursos Ãšteis

- [Google Apps Script Debugging](https://developers.google.com/apps-script/guides/logging)
- [Chrome DevTools Console](https://developer.chrome.com/docs/devtools/console/)
- [Debugging JavaScript](https://developer.mozilla.org/en-US/docs/Tools/Debugger)

---

**Ãšltima atualizaÃ§Ã£o**: Fevereiro 6, 2026  
**VersÃ£o**: 2.1.0  
Status: âœ… Ativo
