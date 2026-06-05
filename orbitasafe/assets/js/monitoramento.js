/* =========================================
   ORBITASAFE — MONITORAMENTO.JS
   Lógica exclusiva da página de Monitoramento
   ========================================= */

'use strict';

// ─── DADOS DOS ESTADOS ──────────────────────────────────────
const DADOS_ESTADOS = {
  'Amazonas': {
    nivel: 'Alto',
    cor: 'vermelho',
    emoji: '🔴',
    cobertura: 94,
    alertas: 12,
    descricao: 'Risco elevado de enchente. Nível dos rios 2,3m acima da média histórica. Monitoramento intensificado.',
    satelites: ['GOES-16', 'Aqua (NASA)', 'Sentinel-2B'],
  },
  'Pará': {
    nivel: 'Alto',
    cor: 'vermelho',
    emoji: '🔴',
    cobertura: 91,
    alertas: 8,
    descricao: 'Queimadas detectadas em área de 340 km². Vento de 45 km/h favorece propagação. Alerta máximo ativo.',
    satelites: ['Landsat-9', 'CBERS-4A', 'Sentinel-2A'],
  },
  'Goiás': {
    nivel: 'Médio',
    cor: 'amarelo',
    emoji: '🟡',
    cobertura: 88,
    alertas: 5,
    descricao: 'Seca prolongada com déficit hídrico de 38%. Monitoramento de lavouras em estado de atenção.',
    satelites: ['GOES-16', 'Landsat-9'],
  },
  'Bahia': {
    nivel: 'Médio',
    cor: 'amarelo',
    emoji: '🟡',
    cobertura: 85,
    alertas: 4,
    descricao: 'Possibilidade de chuvas intensas no litoral sul. Sistemas convectivos em desenvolvimento.',
    satelites: ['GOES-16', 'Sentinel-2A'],
  },
  'Rio Grande do Sul': {
    nivel: 'Médio',
    cor: 'amarelo',
    emoji: '🟡',
    cobertura: 87,
    alertas: 6,
    descricao: 'Risco moderado de granizo e ventos fortes. Frente fria avançando pelo sul do estado.',
    satelites: ['GOES-16', 'Sentinel-2B'],
  },
  'Ceará': {
    nivel: 'Médio',
    cor: 'amarelo',
    emoji: '🟡',
    cobertura: 82,
    alertas: 3,
    descricao: 'Ressaca oceânica prevista para o final de semana. Ondas de até 3,5m no litoral.',
    satelites: ['GOES-16', 'Aqua (NASA)'],
  },
  'São Paulo': {
    nivel: 'Baixo',
    cor: 'verde',
    emoji: '🟢',
    cobertura: 98,
    alertas: 1,
    descricao: 'Condições estáveis. Monitoramento orbital normalizado. Sem riscos climáticos significativos.',
    satelites: ['GOES-16', 'Landsat-9', 'Sentinel-2A'],
  },
  'Paraná': {
    nivel: 'Baixo',
    cor: 'verde',
    emoji: '🟢',
    cobertura: 97,
    alertas: 0,
    descricao: 'Clima estável com chuvas dentro da normalidade. Condições favoráveis para agricultura.',
    satelites: ['GOES-16', 'Sentinel-2B'],
  },
};

// ─── PAINEL DO ESTADO SELECIONADO ──────────────────────────
function renderizarPainelEstado(nomeEstado) {
  const dados = DADOS_ESTADOS[nomeEstado];
  if (!dados) return;

  const painel = document.getElementById('painel-estado');
  if (!painel) return;

  painel.innerHTML = `
    <div class="painel-estado-cabecalho">
      <h3>${dados.emoji} ${nomeEstado}</h3>
      <span class="badge-nivel badge-nivel-${dados.cor}">Risco ${dados.nivel}</span>
    </div>
    <p style="font-size:0.88rem;color:var(--cor-texto-suave);margin-bottom:16px;line-height:1.6">${dados.descricao}</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div class="card-glass" style="padding:12px;text-align:center">
        <div style="font-family:var(--fonte-titulo);font-size:1.4rem;color:var(--cor-azul-claro)">${dados.alertas}</div>
        <div style="font-size:0.75rem;color:var(--cor-texto-suave)">Alertas ativos</div>
      </div>
      <div class="card-glass" style="padding:12px;text-align:center">
        <div style="font-family:var(--fonte-titulo);font-size:1.4rem;color:var(--cor-azul-claro)">${dados.cobertura}%</div>
        <div style="font-size:0.75rem;color:var(--cor-texto-suave)">Cobertura orbital</div>
      </div>
    </div>
    <div style="font-size:0.8rem;color:var(--cor-texto-suave);margin-bottom:8px">Satélites monitorando:</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${dados.satelites.map(s => `<span style="background:rgba(45,140,240,0.15);border:1px solid var(--cor-borda);border-radius:20px;padding:3px 10px;font-size:0.75rem">${s}</span>`).join('')}
    </div>
  `;
}

// ─── CARDS DE ESTADO CLICÁVEIS ─────────────────────────────
(function iniciarCardsEstado() {
  const cards = document.querySelectorAll('.card-estado');
  if (!cards.length) return;

  cards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selecionado'));
      card.classList.add('selecionado');
      const nomeEstado = card.dataset.estado;
      renderizarPainelEstado(nomeEstado);
    });
  });
})();

// ─── ALERTAS DINÂMICOS NA LISTA DO MAPA ────────────────────
(function iniciarAlertasMapa() {
  const lista = document.querySelector('.lista-alertas-mapa');
  if (!lista) return;
  iniciarAlertasDinamicos('.lista-alertas-mapa');
})();

// ─── CONTADOR DE SATÉLITES ANIMADO ─────────────────────────
(function animarSatelites() {
  const el = document.getElementById('satelites-visiveis');
  if (!el) return;

  const nomes = ['Sentinel-2A', 'Landsat-9', 'GOES-16', 'CBERS-4A', 'Aqua (NASA)', 'Sentinel-2B'];
  const nomeEl = document.getElementById('nome-satelite');
  let idx = 0;

  setInterval(() => {
    const base = 4;
    const variacao = Math.floor(Math.random() * 3);
    el.textContent = base + variacao;
    if (nomeEl) {
      idx = (idx + 1) % nomes.length;
      nomeEl.textContent = nomes[idx];
    }
  }, 8000);
})();
