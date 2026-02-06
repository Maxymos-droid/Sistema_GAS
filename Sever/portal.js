/**
 * @fileoverview DADOS DO PORTAL E MÉTRICAS
 * Funções para recuperar dados de entregas do portal,
 * calcular métricas de desempenho e gerar informações
 * consolidadas para análise e dashboard.
 * 
 * @author Sistema CTRC Analyzer
 * @version 2.0.0
 */

// ==================== DADOS DO PORTAL ====================

/**
 * Obtém dados do portal com possibilidade de busca por termo
 * 
 * @function getPortalData
 * @param {string} [termo=''] - Termo de busca para filtrar dados
 * @returns {Array} Array com [cabecalho, ...linhas_filtradas]
 * 
 * @description 1. Carrega dados da planilha PORTAL
 *              2. Formata datas (DD/MM/YYYY)
 *              3. Formata valores monetários (BRL)
 *              4. Formata números (separador decimal)
 *              5. Filtra por termo se fornecido
 * 
 * @example
 * // Sem filtro
 * const dados = getPortalData();
 * 
 * // Com filtro por termo
 * const dados = getPortalData("São Paulo");
 */
function getPortalData(termo = '') {
  try {
    const sheet = getSheet(SHEET_PORTAL);
    
    if (!sheet) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 4) {
      return [];
    }
    
    const cabecalho = data[2].map(c => String(c).trim());
    
    const linhas = data.slice(3).map(linha => 
      linha.map((celula, idx) => {
        // Formata data de emissão (coluna 1)
        if (idx === 1 && celula instanceof Date) {
          return formatarData(celula);
        }
        
        // Formata quantidade (coluna 10)
        if (idx === 10 && typeof celula === "number") {
          return formatarNumero(celula, 0);
        }
        
        // Formata peso (coluna 11)
        if (idx === 11 && typeof celula === "number") {
          return formatarNumero(celula, 2);
        }
        
        // Formata valores monetários (colunas 12-13)
        if ([12, 13].includes(idx) && typeof celula === "number") {
          return formatarMoeda(celula);
        }
        
        // Formata datas de entrega/chegada (colunas 16, 20, 21)
        if ([16, 20, 21].includes(idx) && celula instanceof Date) {
          return formatarData(celula);
        }
        
        return String(celula).trim();
      })
    );
    
    // Se não houver termo de busca, retorna todos os dados
    if (!termo || termo.trim() === '') {
      return [cabecalho, ...linhas];
    }
    
    // Filtra por termo
    const termoLower = termo.toLowerCase();
    const resultados = linhas.filter(linha => 
      linha.join(' ').toLowerCase().includes(termoLower)
    );
    
    return [cabecalho, ...resultados];
    
  } catch (error) {
    Logger.log('Erro ao buscar dados do portal: ' + error);
    return [];
  }
}

// ==================== MÉTRICAS E CONSOLIDAÇÃO ====================

/**
 * Obtém dados do portal com métricas calculadas de desempenho
 * 
 * @function getPortalDataComMetricas
 * @returns {Object} Consolidação de dados e métricas
 * @returns {Object} result.status - Contadores de entregas por status
 * @returns {Object} result.metricas - Métricas de tempo de entrega
 * @returns {Object} result.porParceiro - Distribuição de pendências
 * 
 * @description Consolida dados calculando:
 *              1. Contagem de entregas por status (9 categorias)
 *              2. Tempo médio de emissão → chegada ao parceiro (dias)
 *              3. Tempo médio de parceiro → hoje (dias em pendente)
 *              4. Tempo médio de parceiro → entrega (dias)
 *              5. Distribuição de pendências por parceiro
 * 
 * @example
 * const dados = getPortalDataComMetricas();
 * console.log("Em trânsito: " + dados.status.transito);
 * console.log("Tempo médio: " + dados.metricas.emissaoParceiro + " dias");
 */
function getPortalDataComMetricas() {
  try {
    const sheet = getSheet(SHEET_PORTAL);
    
    if (!sheet) {
      return { status: {}, metricas: {}, porParceiro: {} };
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 4) {
      return { status: {}, metricas: {}, porParceiro: {} };
    }
    
    const cabecalho = data[2];
    const linhas = data.slice(3);
    
    // Identifica índices das colunas importantes
    const idxStatus = cabecalho.indexOf("STATUS");
    const idxParceiro = cabecalho.indexOf("PARCEIRO") >= 0 ? 
      cabecalho.indexOf("PARCEIRO") : cabecalho.indexOf("ENTREGADOR");
    const idxDataEmissao = 1;
    const idxDataChegada = 15;
    const idxDataEntrega = 16;
    
    // Contadores de status
    const contadores = {
      transito: 0,
      parceiro: 0,
      rota: 0,
      aguardando: 0,
      entregue: 0,
      devolucao: 0,
      conferencia: 0,
      naoAtende: 0,
      decisao: 0
    };
    
    const porParceiro = {};
    const temposEmissaoParceiro = [];
    const temposParceiroHoje = [];
    const temposParceiroEntrega = [];
    const hoje = new Date();
    
    // Processa cada linha de dados
    linhas.forEach(linha => {
      const status = (idxStatus >= 0 ? String(linha[idxStatus] || "").toUpperCase() : "");
      const parceiro = idxParceiro >= 0 ? String(linha[idxParceiro] || "Não informado") : "Não informado";
      const dataEmissao = linha[idxDataEmissao];
      const dataChegada = linha[idxDataChegada];
      const dataEntrega = linha[idxDataEntrega];
      
      // Conta por status
      if (status.includes("EM TRANSITO") || status.includes("EM TRÂNSITO")) {
        contadores.transito++;
      } else if (status.includes("PARCEIRO")) {
        contadores.parceiro++;
      } else if (status.includes("ROTA DE ENTREGA") || status.includes("EM ROTA")) {
        contadores.rota++;
      } else if (status.includes("AGUARDANDO NO CLIENTE")) {
        contadores.aguardando++;
      } else if (status.includes("ENTREGUE")) {
        contadores.entregue++;
      } else if (status.includes("DEVOLUÇÃO") || status.includes("DEVOLU")) {
        contadores.devolucao++;
      } else if (status.includes("CONFERÊNCIA") || status.includes("CONFER") || status.includes("AVERIGUAÇÃO")) {
        contadores.conferencia++;
      } else if (status.includes("NÃO ATENDE ROTA")) {
        contadores.naoAtende++;
      } else if (status.includes("AGUARDANDO DECISÃO")) {
        contadores.decisao++;
      }
      
      // Conta pendentes por parceiro
      if (!status.includes("ENTREGUE")) {
        porParceiro[parceiro] = (porParceiro[parceiro] || 0) + 1;
      }
      
      // Calcula métrica: emissão até chegada ao parceiro
      if (dataEmissao instanceof Date && dataChegada instanceof Date) {
        const diff = dataChegada - dataEmissao;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (dias >= 0) temposEmissaoParceiro.push(dias);
      }
      
      // Calcula métrica: parceiro até hoje (para pendentes)
      if (dataChegada instanceof Date && !dataEntrega && !status.includes("ENTREGUE")) {
        const diff = hoje - dataChegada;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (dias >= 0) temposParceiroHoje.push(dias);
      }
      
      // Calcula métrica: parceiro até entrega
      if (dataChegada instanceof Date && dataEntrega instanceof Date) {
        const diff = dataEntrega - dataChegada;
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (dias >= 0) temposParceiroEntrega.push(dias);
      }
    });
    
    // Função para calcular média
    const calcularMedia = (arr) => {
      return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    };
    
    const metricas = {
      emissaoParceiro: calcularMedia(temposEmissaoParceiro),
      parceiroHoje: calcularMedia(temposParceiroHoje),
      parceiroEntrega: calcularMedia(temposParceiroEntrega)
    };
    
    return {
      status: contadores,
      metricas: metricas,
      porParceiro: porParceiro
    };
    
  } catch (error) {
    Logger.log('Erro ao buscar dados com métricas: ' + error);
    return { status: {}, metricas: {}, porParceiro: {} };
  }
}
