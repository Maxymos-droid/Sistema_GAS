# 🔐 Guia de Debugging: Erros de Token

## 🎯 Objetivo

Ajudá-lo a identificar e resolver erros de token no console do navegador.

---

## 📍 Como Acessar o Console

### 1. **Abrir Developer Tools**
- **Windows/Linux**: `F12` ou `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`
- Alternativa: Clique direito → "Inspecionar"

### 2. **Navegar até Console**
- Clique na aba **"Console"** no topo

---

## 🔍 Tipos de Erros de Token Comuns

### ❌ Erro 1: "token is undefined"
```javascript
// Console mostra:
Uncaught ReferenceError: token is not defined
    at auth-js.html:25:10
```

**Causas:**
- State-js não foi carregado
- Storage-js não inicializou
- Autenticação ainda não completada

**Solução:**
```javascript
// No console, teste:
console.log(window.globalState); // Deve ser um objeto
console.log(window.globalState.token); // Deve ter valor
```

---

### ❌ Erro 2: "Cannot read property 'token' of undefined"
```javascript
// Console mostra:
TypeError: Cannot read property 'token' of undefined
    at navigation-js.html:42:15
```

**Causas:**
- `globalState` não existe
- State-js falhou ao carregar

**Solução:**
```javascript
// No console, teste:
if (typeof globalState === 'undefined') {
  console.error('State não foi inicializado');
} else {
  console.log('State OK:', globalState);
}
```

---

### ❌ Erro 3: "Token expired" ou "401 Unauthorized"
```javascript
// Console mostra:
Fetch failed with status 401
// Ou no Network tab: 401 Unauthorized
```

**Causas:**
- Token expirou
- Token inválido
- Credenciais de login erradas

**Solução:**
```javascript
// No console, teste:
console.log('Token atual:', globalState.token);
console.log('Expira em:', globalState.tokenExpireTime);

// Se expirou, fazer login novamente
doLogin(usuário, senha);
```

---

### ❌ Erro 4: "Script error" ou erro em bugs-js
```javascript
// Console mostra:
Script error
    at bugs-js.html:...
```

**Causas:**
- Erro em módulo anterior não foi capturado
- Bugs-js está capturando erro de outro módulo

**Solução:**
1. Expandir o erro no console
2. Ver o stack trace completo
3. Identificar linha exata do erro

---

## ✅ Verificação Passo-a-Passo

### Passo 1: Verificar Carregamento de Módulos

```javascript
// Cole no console:
console.log('=== VERIFICAÇÃO DE MÓDULOS ===');
console.log('state:', typeof window.globalState !== 'undefined' ? '✅' : '❌');
console.log('storage:', typeof StorageManager !== 'undefined' ? '✅' : '❌');
console.log('utils:', typeof formatarData !== 'undefined' ? '✅' : '❌');
console.log('auth:', typeof doLogin !== 'undefined' ? '✅' : '❌');
console.log('navigation:', typeof irTela !== 'undefined' ? '✅' : '❌');
```

**Resultado esperado:**
```
=== VERIFICAÇÃO DE MÓDULOS ===
state: ✅
storage: ✅
utils: ✅
auth: ✅
navigation: ✅
```

### Passo 2: Verificar Token

```javascript
// Cole no console:
console.log('=== VERIFICAÇÃO DE TOKEN ===');
console.log('Token:', window.globalState?.token);
console.log('User:', window.globalState?.user);
console.log('Logged in:', window.globalState?.isLoggedIn);
```

**Resultado esperado (usuário logado):**
```
=== VERIFICAÇÃO DE TOKEN ===
Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
User: user@example.com
Logged in: true
```

**Resultado esperado (usuário NÃO logado):**
```
=== VERIFICAÇÃO DE TOKEN ===
Token: null
User: null
Logged in: false
```

### Passo 3: Verificar Erro Específico

```javascript
// Cole no console:
console.log('=== HISTÓRICO DE ERROS ===');
console.log(window.globalState?.errors || 'Nenhum erro registrado');
```

---

## 🛠️ Técnicas de Debugging

### Técnica 1: Console.log em Pontos Críticos

Editar arquivo JS e adicionar:

```javascript
// Em auth-js.html:
function doLogin(username, password) {
  console.log('🔐 Tentando login...', username);
  
  // ... código original ...
  
  console.log('✅ Login bem-sucedido, token:', token);
}
```

### Técnica 2: Breakpoints

1. Abrir DevTools (F12)
2. Aba "Sources"
3. Procurar arquivo (Ctrl+P)
4. Clicar no número da linha para criar breakpoint
5. Recarregar página (F5)
6. Pausará na linha - inspecionar variáveis

### Técnica 3: Watch Expressions

1. DevTools aberto, aba "Sources"
2. Procurar painel "Watch" (lado direito)
3. Clique em "➕" para adicionar
4. Digitar: `globalState.token`
5. Será atualizado em tempo real

### Técnica 4: Network Monitor

1. DevTools, aba "Network"
2. Fazer ação que gera erro
3. Procurar requisição em VERMELHO (4xx, 5xx)
4. Clicar nela
5. Verificar:
   - **Headers**: Status code, Headers
   - **Response**: Mensagem de erro
   - **Preview**: Dados de resposta

---

## 🧪 Testes Manuais

### Teste 1: Login Flow

```javascript
// 1. Abrir console e executar:
console.clear();
console.log('TESTE 1: Login Flow');

// 2. Fazer login via UI
// 3. Verificar no console:
console.log('Token após login:', window.globalState.token);

// Esperado: Token presente (string longa)
```

### Teste 2: Navegação entre Telas

```javascript
// 1. Após fazer login bem-sucedido
// 2. Clicar em diferentes seções (Dashboard, Tickets, etc)
// 3. Abrir console e executar:
console.log('Tela atual:', document.querySelector('.tela-interna.ativa')?.id);

// Esperado: ID da tela visível (e.g., 'telaDashboard')
```

### Teste 3: Persistência de Token

```javascript
// 1. Fazer login
// 2. Abrir DevTools → Application → LocalStorage/Cookies
// 3. Procurar por: token, user, session
// 4. Recarregar página (F5)
// 5. Verificar se token ainda está lá

// Esperado: Token mantido após reload
```

---

## 📊 Checklist de Debugging

- [ ] Console aberto (F12)
- [ ] Sem erros "red" no console
- [ ] Módulos estão carregados (verificação do Passo 1)
- [ ] Token presente após login (Passo 2)
- [ ] Navegação funcionando (Passo 3)
- [ ] Network: Sem 401, 403, 500
- [ ] Telas: CSS sendo aplicado
- [ ] Buttons: Funcionando

---

## 🆘 Se Nada Funcionar

### 1. Verificar Apps Script API Habilitada
- Ir para: https://script.google.com/home/usersettings
- Procurar: "Apps Script API"
- Verificar se está habilitado
- Se não, habilitar e aguardar 5 minutos

### 2. Limpar Cache

```javascript
// No console do Apps Script:
localStorage.clear();
sessionStorage.clear();
```

Depois recarregar a página.

### 3. Reiniciar Sessão

1. Logout (se possível)
2. Fechar aba
3. Abrir link novamente
4. Tentar login

### 4. Verificar Logs do Backend

Ir para: Google Apps Script → Execuções  
Procurar por erros recentes

---

## 📞 Informações para Reportar Bug

Se problema persistir, registre:

```
# Relatório de Bug

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

**Histórico do console:**
[Cole resultado de:
console.log(window.globalState);
]
```

---

## 📚 Recursos Úteis

- [Google Apps Script Debugging](https://developers.google.com/apps-script/guides/logging)
- [Chrome DevTools Console](https://developer.chrome.com/docs/devtools/console/)
- [Debugging JavaScript](https://developer.mozilla.org/en-US/docs/Tools/Debugger)

---

**Última atualização**: Fevereiro 6, 2026  
**Versão**: 2.1.0  
Status: ✅ Ativo
