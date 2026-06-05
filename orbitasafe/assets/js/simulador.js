/* =========================================
   ORBITASAFE — SIMULADOR.JS
   Lógica do Simulador de Cenários
   ========================================= */
 
'use strict';
 
// ─── CONFIGURAÇÕES POR TIPO DE EVENTO ─────────────────────
const CENARIOS = {
  enchente: {
    nome:      'Enchente',
    emoji:     '🌊',
    fator:     1.4,
    descricao: 'Inundação severa causada por chuvas acima da média ou rompimento de barragens.',
    acoes: [
      'Evacuar zonas ribeirinhas num raio de 5 km',
      'Ativar abrigos de emergência para população deslocada',
      'Interromper tráfego nas rodovias afetadas',
      'Contatar Defesa Civil e Bombeiros',
    ],
  },
  seca: {
    nome:      'Seca',
    emoji:     '☀️',
    fator:     0.6,
    descricao: 'Período prolongado de estiagem comprometendo reservatórios e produção agrícola.',
    acoes: [
      'Implementar racionamento hídrico imediato',
      'Distribuição de cisternas para comunidades rurais',
      'Alerta ao setor agropecuário para perdas de safra',
      'Ativação de plano de contingência de energia',
    ],
  },
  queimada: {
    nome:      'Queimada',
    emoji:     '🔥',
    fator:     1.2,
    descricao: 'Incêndio de grande proporção em vegetação nativa ou áreas de transição.',
    acoes: [
      'Mobilizar brigadas de combate a incêndio',
      'Fechar estradas e parques na região afetada',
      'Emitir alerta de qualidade do ar (AQI > 150)',
      'Acionar aviação de combate a incêndio florestal',
    ],
  },
  deslizamento: {
    nome:      'Deslizamento',
    emoji:     '⛰️',
    fator:     1.8,
    descricao: 'Movimento de massa em encostas, frequentemente causado por chuvas intensas.',
    acoes: [
      'Evacuar imediatamente encostas de alto risco',
      'Interditar vias com risco de soterramento',
      'Enviar equipes de resgate e cães farejadores',
      'Instalar monitoramento geológico em tempo real',
    ],
  },
  tempestade: {
    nome:      'Tempestade Severa',
    emoji:     '⚡',
    fator:     1.1,
    descricao: 'Tempestade com raios, granizo e ventos superiores a 80 km/h.',
    acoes: [
      'Emitir alerta meteorológico para toda a região',
      'Reforçar infraestrutura elétrica crítica',
      'Suspender voos e navegação costeira',
      'Acionar equipes de manutenção de redes',
    ],
  },
};
 
const INTENSIDADES = {
  baixa:  { fator: 0.4, cor: 'verde',   label: 'Baixa' },
  media:  { fator: 1.0, cor: 'amarelo', label: 'Média' },
  alta:   { fator: 2.2, cor: 'vermelho',label: 'Alta' },
  extrema:{ fator: 4.0, cor: 'vermelho',label: 'Extrema — Crítico Nacional' },
};
 
const POPULACOES = {
  rural:     { base: 15000,   label: 'Rural'       },
  municipio: { base: 120000,  label: 'Município'   },
  regional:  { base: 850000,  label: 'Regional'    },
  estadual:  { base: 4500000, label: 'Estadual'    },
  nacional:  { base: 18000000,label: 'Nacional'    },
};
 
// ─── ESTADO DO SIMULADOR ───────────────────────────────────
let historicoSimulacoes = [];
 
// ─── INICIALIZAÇÃO ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const btnSimular = document.getElementById('btn-simular');
  if (btnSimular) {
    btnSimular.addEventListener('click', executarSimulacao);
  }
 
  const btnLimpar = document.getElementById('btn-limpar');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', limparHistorico);
  }
 
  // Validação em tempo real
  document.querySelectorAll('.campo-simulador select, .campo-simulador input')
    .forEach(campo => campo.addEventListener('change', validarCampos));
});
 
// ─── VALIDAÇÃO ─────────────────────────────────────────────
function validarCampos() {
  const tipo       = document.getElementById('tipo-evento')?.value;
  const intensidade= document.getElementById('intensidade-evento')?.value;
  const populacao  = document.getElementById('populacao-afetada')?.value;
  const botao      = document.getElementById('btn-simular');
 
  if (botao) {
    botao.disabled = !(tipo && intensidade && populacao);
  }
}
 
// ─── EXECUÇÃO DA SIMULAÇÃO ─────────────────────────────────
function executarSimulacao() {
  const tipo        = document.getElementById('tipo-evento')?.value;
  const intensidade = document.getElementById('intensidade-evento')?.value;
  const populacao   = document.getElementById('populacao-afetada')?.value;
  const regiao      = document.getElementById('regiao-simulacao')?.value || 'Brasil';
  const resultado   = document.getElementById('resultado-simulacao');
 
  if (!tipo || !intensidade || !populacao || !resultado) return;
 
  const cenario   = CENARIOS[tipo];
  const intens    = INTENSIDADES[intensidade];
  const pop       = POPULACOES[populacao];
 
  if (!cenario || !intens || !pop) return;
 
  // Cálculos
  const pessoasAfetadas = Math.round(pop.base * cenario.fator * intens.fator * (0.8 + Math.random() * 0.4));
  const economiaR$      = Math.round(pessoasAfetadas * (180 + Math.random() * 120));
  const tempoResposta   = Math.round(15 + (intens.fator * 20) + Math.random() * 30);
  const precisaoAlerta  = Math.round(88 + Math.random() * 10);
 
  // Exibir loading
  resultado.innerHTML = `
    <div style="text-align:center;padding:40px">
      <div class="loader-orbita" style="margin:0 auto 20px"></div>
      <p style="color:var(--cor-texto-suave)">Processando dados orbitais...</p>
    </div>
  `;
 
  setTimeout(() => {
    resultado.innerHTML = gerarHTMLResultado({
      cenario, intens, pop, regiao,
      pessoasAfetadas, economiaR$, tempoResposta, precisaoAlerta,
      tipo, intensidade,
    });
 
    // Animar barras do resultado
    setTimeout(() => {
      resultado.querySelectorAll('.barra-progresso-preenchimento[data-largura]').forEach(barra => {
        barra.style.width = barra.dataset.largura + '%';
      });
    }, 200);
 
    // Adicionar ao histórico
    adicionarHistorico({ cenario, intens, pessoasAfetadas, economiaR$ });
  }, 1500);
}
 
// ─── GERAR HTML DO RESULTADO ───────────────────────────────
function gerarHTMLResultado(dados) {
  const { cenario, intens, regiao, pessoasAfetadas, economiaR$, tempoResposta, precisaoAlerta } = dados;
  const gravidade = intens.fator > 2 ? 'CRÍTICO' : intens.fator > 1 ? 'MODERADO' : 'BAIXO';
 
  return `
    <div class="resultado-conteudo">
      <div class="resultado-cabecalho">
        <span style="font-size:2.5rem">${cenario.emoji}</span>
        <div>
          <h3>${cenario.nome}</h3>
          <span class="status-badge ${intens.cor}">
            <span class="ponto-status"></span>
            Nível ${intens.label} — ${gravidade}
          </span>
        </div>
      </div>
 
      <p class="resultado-descricao">${cenario.descricao}</p>
 
      <div class="grade-resultado">
        <div class="item-resultado">
          <span class="item-resultado-valor">${pessoasAfetadas.toLocaleString('pt-BR')}</span>
          <span class="item-resultado-rotulo">Pessoas em Risco</span>
        </div>
        <div class="item-resultado">
          <span class="item-resultado-valor">R$ ${(economiaR$ / 1000000).toFixed(1)}M</span>
          <span class="item-resultado-rotulo">Economia c/ Alerta Prévio</span>
        </div>
        <div class="item-resultado">
          <span class="item-resultado-valor">${tempoResposta} min</span>
          <span class="item-resultado-rotulo">Tempo de Resposta</span>
        </div>
        <div class="item-resultado">
          <span class="item-resultado-valor">${precisaoAlerta}%</span>
          <span class="item-resultado-rotulo">Precisão do Alerta IA</span>
        </div>
      </div>
 
      <div class="resultado-metricas">
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:0.85rem">Cobertura Orbital da Região</span>
            <span style="font-size:0.85rem;color:var(--cor-azul-claro)">99%</span>
          </div>
          <div class="barra-progresso"><div class="barra-progresso-preenchimento" data-largura="99" style="width:0%"></div></div>
        </div>
        <div style="margin-top:14px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:0.85rem">Precisão do Modelo Preditivo</span>
            <span style="font-size:0.85rem;color:var(--cor-azul-claro)">${precisaoAlerta}%</span>
          </div>
          <div class="barra-progresso"><div class="barra-progresso-preenchimento" data-largura="${precisaoAlerta}" style="width:0%"></div></div>
        </div>
      </div>
 
      <div class="resultado-acoes">
        <h4>🚨 Ações Preventivas Recomendadas</h4>
        <ol>
          ${cenario.acoes.map(a => `<li>${a}</li>`).join('')}
        </ol>
      </div>
 
      <div style="margin-top:20px;padding:14px;background:rgba(45,140,240,0.08);border-radius:10px;border:1px solid var(--cor-borda)">
        <p style="font-size:0.8rem;color:var(--cor-texto-suave)">
          ℹ️ Dados baseados em modelos preditivos com integração de satélites <strong>Sentinel-2, Landsat-9, GOES-16</strong> e análise de IA.
          Região simulada: <strong>${regiao}</strong> · Timestamp: <strong>${new Date().toLocaleString('pt-BR')}</strong>
        </p>
      </div>
    </div>
  `;
}
 
// ─── HISTÓRICO DE SIMULAÇÕES ───────────────────────────────
function adicionarHistorico(dados) {
  const { cenario, intens, pessoasAfetadas, economiaR$ } = dados;
  historicoSimulacoes.unshift({
    emoji:    cenario.emoji,
    nome:     cenario.nome,
    nivel:    intens.label,
    cor:      intens.cor,
    pessoas:  pessoasAfetadas,
    economia: economiaR$,
    hora:     new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  });
 
  renderizarHistorico();
}
 
function renderizarHistorico() {
  const lista = document.getElementById('historico-simulacoes');
  if (!lista) return;
 
  lista.innerHTML = historicoSimulacoes.slice(0, 5).map(item => `
    <div class="item-historico">
      <span class="historico-emoji">${item.emoji}</span>
      <div class="historico-info">
        <strong>${item.nome}</strong>
        <span class="status-badge ${item.cor}" style="font-size:0.7rem;padding:2px 8px">
          <span class="ponto-status"></span>${item.nivel}
        </span>
      </div>
      <div class="historico-numeros">
        <span>${item.pessoas.toLocaleString('pt-BR')} em risco</span>
        <span class="historico-hora">${item.hora}</span>
      </div>
    </div>
  `).join('');
}
 
function limparHistorico() {
  historicoSimulacoes = [];
  const lista = document.getElementById('historico-simulacoes');
  if (lista) lista.innerHTML = '<p style="color:var(--cor-texto-suave);font-size:0.85rem;text-align:center;padding:20px">Nenhuma simulação realizada.</p>';
 
  const resultado = document.getElementById('resultado-simulacao');
  if (resultado) resultado.innerHTML = `
    <div class="placeholder-resultado">
      <span>🛰️</span>
      <p>Configure os parâmetros e clique em <strong>Simular</strong> para ver os resultados.</p>
    </div>
  `;
}