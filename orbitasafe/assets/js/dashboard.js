
/* =========================================
   ORBITASAFE — DASHBOARD.JS
   Lógica exclusiva do Painel Estratégico
   ========================================= */
 
'use strict';
 
// ─── DADOS SIMULADOS ───────────────────────────────────────
const DADOS_HISTORICO = {
  alertas:    [180, 210, 195, 230, 275, 260, 290, 310, 285, 330, 355, 380],
  eventos:    [42,  55,  48,  60,  72,  68,  80,  85,  78,  92, 105, 112],
  cobertura:  [85,  86,  88,  87,  90,  91,  93,  94,  93,  96,  97,  98],
  precisao:   [88,  89,  90,  91,  91,  92,  93,  93,  94,  94,  95,  96],
  meses:      ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
};
 
const METRICAS_REGIOES = [
  { nome: 'Norte',       alertas: 45, status: 'critico',  risco: 87 },
  { nome: 'Nordeste',    alertas: 28, status: 'alerta',   risco: 62 },
  { nome: 'Centro-Oeste',alertas: 19, status: 'alerta',   risco: 54 },
  { nome: 'Sudeste',     alertas: 12, status: 'ativo',    risco: 31 },
  { nome: 'Sul',         alertas: 8,  status: 'ativo',    risco: 22 },
];
 
// ─── INICIALIZAÇÃO ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  iniciarRelogio('relogio');
  renderizarGraficoAlertas();
  renderizarGraficoCobertura();
  renderizarTabelaRegioes();
  iniciarAtualizacaoAutomatica();
  iniciarAlertasDinamicos('.lista-alertas-dashboard');
});
 
// ─── GRÁFICO DE BARRAS: ALERTAS MENSAIS ───────────────────
function renderizarGraficoAlertas() {
  const canvas = document.getElementById('grafico-alertas');
  if (!canvas) return;
 
  const ctx    = canvas.getContext('2d');
  const dados  = DADOS_HISTORICO.alertas;
  const meses  = DADOS_HISTORICO.meses;
  const maxVal = Math.max(...dados) * 1.15;
 
  canvas.width  = canvas.offsetWidth || 600;
  canvas.height = 280;
 
  const W       = canvas.width;
  const H       = canvas.height;
  const padL    = 50;
  const padB    = 40;
  const padT    = 20;
  const padR    = 20;
  const areaW   = W - padL - padR;
  const areaH   = H - padB - padT;
  const barLarg = (areaW / dados.length) * 0.6;
  const espaco  = areaW / dados.length;
 
  // Limpar
  ctx.clearRect(0, 0, W, H);
 
  // Grade horizontal
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + areaH - (i / 4) * areaH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
 
    ctx.fillStyle = 'rgba(139,163,199,0.7)';
    ctx.font      = '11px Exo 2';
    ctx.textAlign = 'right';
    ctx.fillText(Math.round((i / 4) * maxVal), padL - 8, y + 4);
  }
 
  // Animar barras
  let progresso = 0;
  function animar() {
    ctx.clearRect(0, 0, W, H);
 
    // Eixos
    ctx.strokeStyle = 'rgba(45,140,240,0.3)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, H - padB);
    ctx.lineTo(W - padR, H - padB);
    ctx.stroke();
 
    // Grade
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i <= 4; i++) {
      const y = padT + areaH - (i / 4) * areaH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(139,163,199,0.7)';
      ctx.font      = '10px Exo 2';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 4) * maxVal), padL - 8, y + 4);
    }
 
    // Barras
    dados.forEach((val, i) => {
      const alturaPx = (val / maxVal) * areaH * progresso;
      const x        = padL + i * espaco + (espaco - barLarg) / 2;
      const y        = H - padB - alturaPx;
 
      // Gradiente barra
      const grad = ctx.createLinearGradient(0, y, 0, H - padB);
      grad.addColorStop(0, 'rgba(96,180,255,0.9)');
      grad.addColorStop(1, 'rgba(45,140,240,0.3)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barLarg, alturaPx);
 
      // Borda topo
      ctx.fillStyle = 'rgba(0,212,255,0.8)';
      ctx.fillRect(x, y, barLarg, 2);
 
      // Rótulo mês
      ctx.fillStyle = 'rgba(139,163,199,0.8)';
      ctx.font      = '10px Exo 2';
      ctx.textAlign = 'center';
      ctx.fillText(meses[i], x + barLarg / 2, H - padB + 16);
    });
 
    progresso += 0.04;
    if (progresso < 1) requestAnimationFrame(animar);
    else progresso = 1;
  }
 
  animar();
}
 
// ─── GRÁFICO DE LINHA: COBERTURA + PRECISÃO ───────────────
function renderizarGraficoCobertura() {
  const canvas = document.getElementById('grafico-cobertura');
  if (!canvas) return;
 
  const ctx = canvas.getContext('2d');
 
  canvas.width  = canvas.offsetWidth || 600;
  canvas.height = 280;
 
  const W     = canvas.width;
  const H     = canvas.height;
  const padL  = 50;
  const padB  = 40;
  const padT  = 20;
  const padR  = 20;
  const areaW = W - padL - padR;
  const areaH = H - padB - padT;
 
  const series = [
    { dados: DADOS_HISTORICO.cobertura, cor: '#2d8cf0', label: 'Cobertura' },
    { dados: DADOS_HISTORICO.precisao,  cor: '#00d4ff', label: 'Precisão IA' },
  ];
 
  let progresso = 0;
 
  function animar() {
    ctx.clearRect(0, 0, W, H);
 
    // Grade
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    for (let i = 0; i <= 4; i++) {
      const y = padT + areaH - (i / 4) * areaH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(139,163,199,0.7)';
      ctx.font = '10px Exo 2';
      ctx.textAlign = 'right';
      ctx.fillText((80 + i * 5) + '%', padL - 8, y + 4);
    }
 
    // Eixos
    ctx.strokeStyle = 'rgba(45,140,240,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, H - padB);
    ctx.lineTo(W - padR, H - padB);
    ctx.stroke();
 
    const pontosFinal = Math.floor(progresso * (series[0].dados.length - 1)) + 1;
 
    series.forEach(serie => {
      const pts = serie.dados.slice(0, pontosFinal);
      if (pts.length < 2) return;
 
      // Área preenchida
      const grad = ctx.createLinearGradient(0, padT, 0, H - padB);
      grad.addColorStop(0, serie.cor + '30');
      grad.addColorStop(1, 'transparent');
 
      ctx.beginPath();
      pts.forEach((val, i) => {
        const x = padL + (i / (serie.dados.length - 1)) * areaW;
        const y = padT + areaH - ((val - 80) / 20) * areaH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(padL + ((pts.length - 1) / (serie.dados.length - 1)) * areaW, H - padB);
      ctx.lineTo(padL, H - padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
 
      // Linha
      ctx.beginPath();
      ctx.strokeStyle = serie.cor;
      ctx.lineWidth   = 2.5;
      ctx.lineJoin    = 'round';
      pts.forEach((val, i) => {
        const x = padL + (i / (serie.dados.length - 1)) * areaW;
        const y = padT + areaH - ((val - 80) / 20) * areaH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
 
      // Pontos
      pts.forEach((val, i) => {
        const x = padL + (i / (serie.dados.length - 1)) * areaW;
        const y = padT + areaH - ((val - 80) / 20) * areaH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = serie.cor;
        ctx.fill();
      });
 
      // Meses
      ctx.fillStyle = 'rgba(139,163,199,0.7)';
      ctx.font = '10px Exo 2';
      ctx.textAlign = 'center';
      DADOS_HISTORICO.meses.forEach((mes, i) => {
        const x = padL + (i / (DADOS_HISTORICO.meses.length - 1)) * areaW;
        ctx.fillText(mes, x, H - padB + 16);
      });
    });
 
    // Legenda
    series.forEach((serie, i) => {
      const lx = padL + i * 130;
      ctx.fillStyle = serie.cor;
      ctx.fillRect(lx, 6, 24, 3);
      ctx.fillStyle = 'rgba(232,240,254,0.8)';
      ctx.font = '11px Exo 2';
      ctx.textAlign = 'left';
      ctx.fillText(serie.label, lx + 30, 12);
    });
 
    progresso += 0.03;
    if (progresso < 1) requestAnimationFrame(animar);
  }
 
  animar();
}
 
// ─── TABELA DE REGIÕES ─────────────────────────────────────
function renderizarTabelaRegioes() {
  const tbody = document.getElementById('tabela-regioes');
  if (!tbody) return;
 
  tbody.innerHTML = '';
 
  METRICAS_REGIOES.forEach(regiao => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${regiao.nome}</td>
      <td>${regiao.alertas}</td>
      <td>
        <span class="status-badge ${regiao.status}">
          <span class="ponto-status"></span>
          ${regiao.status === 'critico' ? 'Crítico' : regiao.status === 'alerta' ? 'Alerta' : 'Normal'}
        </span>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="barra-progresso" style="flex:1">
            <div class="barra-progresso-preenchimento" style="width:${regiao.risco}%;background:${regiao.risco > 70 ? 'var(--cor-vermelho)' : regiao.risco > 50 ? 'var(--cor-amarelo)' : 'var(--cor-verde)'}"></div>
          </div>
          <span style="font-size:0.8rem;min-width:36px">${regiao.risco}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
 
// ─── ATUALIZAÇÃO AUTOMÁTICA DE MÉTRICAS ───────────────────
function iniciarAtualizacaoAutomatica() {
  const metricas = {
    'metrica-satelites':   { base: 42,       variacao: 2,      sufixo: '' },
    'metrica-alertas':     { base: 12584,     variacao: 50,     sufixo: '' },
    'metrica-eventos':     { base: 3142,      variacao: 15,     sufixo: '' },
    'metrica-pessoas':     { base: 4800000,   variacao: 5000,   sufixo: '' },
    'metrica-precisao':    { base: 94,        variacao: 2,      sufixo: '%' },
    'metrica-cobertura':   { base: 98,        variacao: 1,      sufixo: '%' },
    'metrica-resposta':    { base: 87,        variacao: 3,      sufixo: '%' },
    'metrica-uptime':      { base: 99.8,      variacao: 0.1,    sufixo: '%' },
  };
 
  function atualizar() {
    Object.entries(metricas).forEach(([id, cfg]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const val = cfg.base + (Math.random() * cfg.variacao * 2 - cfg.variacao);
      const formatado = Number.isInteger(cfg.base)
        ? Math.round(val).toLocaleString('pt-BR')
        : val.toFixed(1);
      el.textContent = formatado + cfg.sufixo;
    });

    const elAtu = document.getElementById('ultima-atualizacao');
    if (elAtu) {
      elAtu.textContent = new Date().toLocaleTimeString('pt-BR');
    }
  }
 
  atualizar();
  setInterval(atualizar, 8000);
}
 