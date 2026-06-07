/**
 * OrbitaSafe — Scripts Principais
 * ─────────────────────────────────────────────────────────
 * Estrutura:
 *   1. Loader
 *   2. Canvas de Estrelas (animação de fundo)
 *   3. Navegação entre Páginas
 *   4. Contadores Animados (Hero)
 *   5. Dados — Monitoramento (Estados & Alertas)
 *   6. Módulo de Monitoramento
 *   7. Dados — Simulador
 *   8. Módulo de Simulação
 *   9. Dados — Dashboard
 *  10. Módulo de Dashboard (gráficos e tabela)
 * ─────────────────────────────────────────────────────────
 */

"use strict";


/* ═══════════════════════════════════════════════════════
   1. LOADER
   ═══════════════════════════════════════════════════════ */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
  }, 1200);
});


/* ═══════════════════════════════════════════════════════
   2. CANVAS DE ESTRELAS — Animação de fundo
   ═══════════════════════════════════════════════════════ */
(function initStars() {
  const canvas = document.getElementById("stars");
  const ctx    = canvas.getContext("2d");
  let stars    = [];

  /** Recalcula tamanho do canvas e gera novas estrelas */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = Math.floor((canvas.width * canvas.height) / 5500);
    stars = Array.from({ length: count }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.4 + 0.2,
      op: Math.random(),
      sp: Math.random() * 0.004 + 0.002,
      ph: Math.random() * Math.PI * 2,
    }));
  }

  /** Desenha frame de animação das estrelas */
  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      s.op = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(s.ph + t * s.sp));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${s.op})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
})();


/* ═══════════════════════════════════════════════════════
   3. NAVEGAÇÃO ENTRE PÁGINAS
   ═══════════════════════════════════════════════════════ */

/**
 * Exibe a página correspondente ao id e atualiza o nav.
 * @param {string} id    - Sufixo do id da página (ex: "home", "monitoring")
 * @param {Element} btn  - Botão de navegação clicado
 */
function showPage(id, btn) {
  // Esconde todas as páginas e remove estado ativo
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + id).classList.add("active");

  document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });

  // Inicializa módulo da página (lazy init — só na primeira visita)
  if (id === "monitoring") initMonitoring();
  if (id === "dashboard")  initDashboard();
  if (id === "home")       animateCounters();
}


/* ═══════════════════════════════════════════════════════
   4. CONTADORES ANIMADOS — Hero (Home)
   ═══════════════════════════════════════════════════════ */

/**
 * Anima todos os elementos com [data-count] de 0 até o valor-alvo
 * usando easing cúbico.
 */
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const dur    = 1800;
    const start  = performance.now();

    function step(now) {
      const p    = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v    = Math.round(ease * target);

      // Formata número conforme magnitude
      if (v >= 1000000) {
        el.textContent = (v / 1000000).toFixed(1).replace(".", ",") + "M";
      } else if (v >= 1000) {
        el.textContent = v.toLocaleString("pt-BR");
      } else {
        el.textContent = v + suffix;
      }

      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });
}

// Roda imediatamente ao carregar (página Home é a inicial)
animateCounters();


/* ═══════════════════════════════════════════════════════
   5. DADOS — MONITORAMENTO
   ═══════════════════════════════════════════════════════ */

/** Lista de estados brasileiros com dados de monitoramento */
const ESTADOS = [
  { nome: "Amazonas",         uf: "AM", risk: "high", temp: 31, umid: 89, cobertura: 99, alertas: 12, tendencia: "↑" },
  { nome: "Pará",             uf: "PA", risk: "high", temp: 30, umid: 84, cobertura: 97, alertas: 9,  tendencia: "↑" },
  { nome: "Goiás",            uf: "GO", risk: "mid",  temp: 28, umid: 52, cobertura: 95, alertas: 5,  tendencia: "→" },
  { nome: "Bahia",            uf: "BA", risk: "mid",  temp: 29, umid: 61, cobertura: 94, alertas: 6,  tendencia: "↑" },
  { nome: "Rio Grande do Sul",uf: "RS", risk: "mid",  temp: 18, umid: 74, cobertura: 96, alertas: 4,  tendencia: "→" },
  { nome: "Ceará",            uf: "CE", risk: "mid",  temp: 33, umid: 42, cobertura: 93, alertas: 5,  tendencia: "↑" },
  { nome: "Maranhão",         uf: "MA", risk: "mid",  temp: 30, umid: 70, cobertura: 91, alertas: 4,  tendencia: "→" },
  { nome: "Mato Grosso",      uf: "MT", risk: "mid",  temp: 27, umid: 58, cobertura: 90, alertas: 3,  tendencia: "→" },
  { nome: "São Paulo",        uf: "SP", risk: "low",  temp: 22, umid: 65, cobertura: 98, alertas: 2,  tendencia: "↓" },
  { nome: "Paraná",           uf: "PR", risk: "low",  temp: 19, umid: 70, cobertura: 97, alertas: 1,  tendencia: "↓" },
  { nome: "Minas Gerais",     uf: "MG", risk: "low",  temp: 23, umid: 60, cobertura: 96, alertas: 2,  tendencia: "↓" },
  { nome: "Santa Catarina",   uf: "SC", risk: "low",  temp: 17, umid: 72, cobertura: 95, alertas: 1,  tendencia: "↓" },
];

/** Mapeamentos de rótulos e classes por nível de risco */
const RISK_LABEL = { high: "Risco Alto",  mid: "Risco Médio", low: "Risco Baixo" };
const BADGE_CLASS = { high: "badge-red", mid: "badge-yellow",  low: "badge-green" };

/** Pool de alertas para o feed ao vivo */
const ALERT_POOL = [
  { cls: "alert-red",    icon: "🔴", msg: "Alto risco de enchente detectado — Manaus, AM" },
  { cls: "alert-red",    icon: "🔴", msg: "Queimada detectada via Landsat-9 — Sul do Pará" },
  { cls: "alert-yellow", icon: "🟡", msg: "Risco moderado de seca — Nordeste do Ceará" },
  { cls: "alert-yellow", icon: "🟡", msg: "Temperatura acima da média — Goiás Centro" },
  { cls: "alert-green",  icon: "🟢", msg: "Nível hídrico normalizado — Rio Tietê, SP" },
  { cls: "alert-yellow", icon: "🟡", msg: "Atenção: frente fria em deslocamento — Sul do Brasil" },
  { cls: "alert-red",    icon: "🔴", msg: "Risco de deslizamento elevado — Serra Gaúcha, RS" },
  { cls: "alert-green",  icon: "🟢", msg: "Área de queimada extinta — MT-163, Mato Grosso" },
];

/** Índice global do feed de alertas */
let alertIdx = 0;

/**
 * Popula o container de alertas com os primeiros 4 itens do pool.
 * @param {string} containerId - ID do elemento container
 */
function buildAlertFeed(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = "";
  ALERT_POOL.slice(0, 4).forEach((a, i) => {
    const div = document.createElement("div");
    div.className = "alert-item " + a.cls;
    div.innerHTML = `
      <span>${a.icon}</span>
      <span>${a.msg}</span>
      <span class="alert-time">${i === 0 ? "Agora" : i * 3 + " min"}</span>`;
    el.appendChild(div);
  });
}

/**
 * Insere um novo alerta no topo do feed, removendo o mais antigo se > 6.
 * @param {string} containerId - ID do elemento container
 */
function tickAlerts(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  alertIdx = (alertIdx + 1) % ALERT_POOL.length;
  const a   = ALERT_POOL[alertIdx];
  const div = document.createElement("div");
  const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  div.className = "alert-item " + a.cls;
  div.innerHTML = `<span>${a.icon}</span><span>${a.msg}</span><span class="alert-time">${now}</span>`;
  el.insertBefore(div, el.firstChild);

  // Limita o feed a 6 alertas visíveis
  if (el.children.length > 6) el.removeChild(el.lastChild);
}


/* ═══════════════════════════════════════════════════════
   6. MÓDULO DE MONITORAMENTO
   ═══════════════════════════════════════════════════════ */

let monitoringInit = false;

/** Inicializa a página de Monitoramento (apenas na primeira visita). */
function initMonitoring() {
  if (monitoringInit) return;
  monitoringInit = true;

  buildStateGrid();
  buildAlertFeed("alert-feed");
  setInterval(() => tickAlerts("alert-feed"), 5000);
}

/** Cria os cards de estado na grade de monitoramento. */
function buildStateGrid() {
  const grid = document.getElementById("state-grid");

  ESTADOS.forEach(estado => {
    const div = document.createElement("div");
    div.className = `state-card risk-${estado.risk}`;
    div.innerHTML = `
      <span class="state-name">${estado.uf} — ${estado.nome}</span>
      <span class="state-badge ${BADGE_CLASS[estado.risk]}">
        <span class="dot-badge"></span>${RISK_LABEL[estado.risk]}
      </span>`;
    div.addEventListener("click", () => showStateDetail(estado));
    grid.appendChild(div);
  });
}

/**
 * Exibe o painel de detalhes de um estado selecionado.
 * @param {Object} estado - Objeto de dados do estado
 */
function showStateDetail(estado) {
  const panel = document.getElementById("state-detail");
  panel.classList.remove("open");

  setTimeout(() => {
    panel.innerHTML = `
      <h3>🛰️ ${estado.nome} (${estado.uf}) — Dados em Tempo Real</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-val">${estado.temp}°C</span>
          <span class="detail-key">Temperatura</span>
        </div>
        <div class="detail-item">
          <span class="detail-val">${estado.umid}%</span>
          <span class="detail-key">Umidade</span>
        </div>
        <div class="detail-item">
          <span class="detail-val">${estado.cobertura}%</span>
          <span class="detail-key">Cobertura Orbital</span>
        </div>
        <div class="detail-item">
          <span class="detail-val">${estado.alertas}</span>
          <span class="detail-key">Alertas Ativos</span>
        </div>
        <div class="detail-item">
          <span class="detail-val">${estado.tendencia}</span>
          <span class="detail-key">Tendência</span>
        </div>
        <div class="detail-item">
          <span class="detail-val">${RISK_LABEL[estado.risk]}</span>
          <span class="detail-key">Nível de Risco</span>
        </div>
      </div>`;
    panel.classList.add("open");
  }, 100);
}


/* ═══════════════════════════════════════════════════════
   7. DADOS — SIMULADOR
   ═══════════════════════════════════════════════════════ */

/** Cenários de desastres disponíveis no simulador */
const SCENARIOS = {
  enchente: {
    nome: "Enchente", emoji: "🌊", fator: 1.4,
    desc: "Inundação causada por chuvas acima da média ou rompimento de barragens.",
    acoes: [
      "Evacuar zonas ribeirinhas num raio de 5 km",
      "Ativar abrigos de emergência",
      "Interromper tráfego nas rodovias afetadas",
      "Contatar Defesa Civil e Bombeiros",
    ],
  },
  seca: {
    nome: "Seca", emoji: "☀️", fator: 0.6,
    desc: "Período prolongado de estiagem comprometendo reservatórios e produção agrícola.",
    acoes: [
      "Implementar racionamento hídrico imediato",
      "Distribuir cisternas para comunidades rurais",
      "Alertar setor agropecuário",
      "Ativar plano de contingência de energia",
    ],
  },
  queimada: {
    nome: "Queimada", emoji: "🔥", fator: 1.2,
    desc: "Incêndio de grande proporção em vegetação nativa.",
    acoes: [
      "Mobilizar brigadas de combate a incêndio",
      "Fechar estradas e parques na região",
      "Emitir alerta de qualidade do ar (AQI > 150)",
      "Acionar aviação de combate florestal",
    ],
  },
  deslizamento: {
    nome: "Deslizamento", emoji: "⛰️", fator: 1.8,
    desc: "Movimento de massa em encostas, causado por chuvas intensas.",
    acoes: [
      "Evacuar imediatamente encostas de alto risco",
      "Interditar vias com risco de soterramento",
      "Enviar equipes de resgate e cães farejadores",
      "Instalar monitoramento geológico em tempo real",
    ],
  },
  tempestade: {
    nome: "Tempestade Severa", emoji: "⚡", fator: 1.1,
    desc: "Tempestade com raios, granizo e ventos superiores a 80 km/h.",
    acoes: [
      "Emitir alerta meteorológico para toda a região",
      "Reforçar infraestrutura elétrica crítica",
      "Suspender voos e navegação costeira",
      "Acionar equipes de manutenção de redes",
    ],
  },
};

/** Parâmetros de intensidade com fator multiplicador */
const INTENSITIES = {
  baixa:   { fator: 0.4, label: "Baixa",   color: "var(--green)" },
  media:   { fator: 1.0, label: "Média",   color: "var(--yellow)" },
  alta:    { fator: 2.2, label: "Alta",    color: "var(--red)" },
  extrema: { fator: 4.0, label: "Extrema", color: "var(--red)" },
};

/** Escalas populacionais para cálculo de impacto */
const POPULATIONS = {
  rural:         { base: 15000,   label: "Rural" },
  pequena:       { base: 120000,  label: "Pequena" },
  media:         { base: 450000,  label: "Média" },
  grande:        { base: 1200000, label: "Grande" },
  metropolitana: { base: 3500000, label: "Metrópole" },
};


/* ═══════════════════════════════════════════════════════
   8. MÓDULO DE SIMULAÇÃO
   ═══════════════════════════════════════════════════════ */

/** Inicializa os event listeners do formulário de simulação. */
(function initSimulator() {
  const selEvt = document.getElementById("evt-type");
  const selInt = document.getElementById("evt-intensity");
  const selPop = document.getElementById("evt-pop");
  const btnSim = document.getElementById("btn-simulate");
  const btnClr = document.getElementById("btn-clear-sim");

  /** Habilita botão de simulação apenas quando todos os campos estão preenchidos */
  function checkReady() {
    btnSim.disabled = !(selEvt.value && selInt.value && selPop.value);
  }

  [selEvt, selInt, selPop].forEach(s => s.addEventListener("change", checkReady));
  btnSim.addEventListener("click", runSimulation);
  btnClr.addEventListener("click", clearSimulation);
})();

/** Executa a simulação e renderiza o painel de resultados. */
function runSimulation() {
  const tipo   = document.getElementById("evt-type").value;
  const intens = document.getElementById("evt-intensity").value;
  const pop    = document.getElementById("evt-pop").value;
  const regiao = document.getElementById("evt-region").value || "Brasil";

  const cenario   = SCENARIOS[tipo];
  const intensObj = INTENSITIES[intens];
  const popObj    = POPULATIONS[pop];

  // Cálculo das métricas de impacto
  const pessoas  = Math.round(popObj.base * cenario.fator * intensObj.fator);
  const economia = Math.round(pessoas * 1850 * 0.4);
  const tempo    = Math.round(30 / intensObj.fator);
  const precisao = Math.round(88 + Math.random() * 8);

  const result = document.getElementById("sim-result");
  result.innerHTML = `
    <div class="result-title">
      ${cenario.emoji} ${cenario.nome} —
      <span style="color:${intensObj.color}">${intensObj.label}</span>
    </div>
    <p style="font-size:.85rem;color:var(--muted);margin-bottom:18px">${cenario.desc}</p>

    <div class="result-metrics">
      <div class="res-item">
        <span class="res-val">${pessoas.toLocaleString("pt-BR")}</span>
        <span class="res-key">Pessoas em Risco</span>
      </div>
      <div class="res-item">
        <span class="res-val">R$ ${(economia / 1e6).toFixed(1)}M</span>
        <span class="res-key">Economia c/ Alerta</span>
      </div>
      <div class="res-item">
        <span class="res-val">${tempo} min</span>
        <span class="res-key">Tempo de Resposta</span>
      </div>
      <div class="res-item">
        <span class="res-val">${precisao}%</span>
        <span class="res-key">Precisão IA</span>
      </div>
    </div>

    <div class="bar-wrap">
      <div class="bar-label">
        <span>Cobertura Orbital da Região</span>
        <span style="color:var(--blue-light)">99%</span>
      </div>
      <div class="bar-track"><div class="bar-fill" id="bar1" style="width:0%"></div></div>
    </div>

    <div class="bar-wrap">
      <div class="bar-label">
        <span>Precisão do Modelo Preditivo</span>
        <span style="color:var(--blue-light)">${precisao}%</span>
      </div>
      <div class="bar-track"><div class="bar-fill" id="bar2" style="width:0%"></div></div>
    </div>

    <div class="result-actions">
      <h4>🚨 Ações Preventivas Recomendadas</h4>
      <ol>${cenario.acoes.map(a => `<li>${a}</li>`).join("")}</ol>
    </div>

    <p class="result-footnote">
      ℹ️ Dados baseados em modelos preditivos integrados com Sentinel-2, Landsat-9, GOES-16.
      Região: <strong>${regiao}</strong> · ${new Date().toLocaleString("pt-BR")}
    </p>`;

  // Anima as barras de progresso com pequeno delay
  setTimeout(() => {
    const b1 = document.getElementById("bar1");
    const b2 = document.getElementById("bar2");
    if (b1) b1.style.width = "99%";
    if (b2) b2.style.width = precisao + "%";
  }, 100);
}

/** Limpa todos os campos e restaura o placeholder do resultado. */
function clearSimulation() {
  ["evt-type", "evt-intensity", "evt-pop"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("evt-region").value  = "";
  document.getElementById("btn-simulate").disabled = true;
  document.getElementById("sim-result").innerHTML = `
    <div class="result-placeholder">
      <span>🛰️</span>
      <p>Configure os parâmetros e clique em <strong>Simular</strong> para ver os resultados.</p>
    </div>`;
}


/* ═══════════════════════════════════════════════════════
   9. DADOS — DASHBOARD
   ═══════════════════════════════════════════════════════ */

/** Dados históricos mensais para os gráficos */
const MONTHLY = {
  meses:    ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
  alertas:  [180, 210, 195, 230, 275, 260, 290, 310, 285, 330, 355, 380],
  cobertura:[85,  86,  88,  87,  90,  91,  93,  94,  93,  96,  97,  98],
  precisao: [88,  89,  90,  91,  91,  92,  93,  93,  94,  94,  95,  96],
};

/** Dados de situação por região para a tabela */
const REGIOES = [
  { nome: "Norte",        alertas: 45, status: "critico", risco: 87 },
  { nome: "Nordeste",     alertas: 28, status: "alerta",  risco: 62 },
  { nome: "Centro-Oeste", alertas: 19, status: "alerta",  risco: 54 },
  { nome: "Sudeste",      alertas: 12, status: "ativo",   risco: 31 },
  { nome: "Sul",          alertas: 8,  status: "ativo",   risco: 22 },
];


/* ═══════════════════════════════════════════════════════
   10. MÓDULO DE DASHBOARD
   ═══════════════════════════════════════════════════════ */

let dashInit = false;

/** Inicializa o Dashboard Estratégico (apenas na primeira visita). */
function initDashboard() {
  if (dashInit) return;
  dashInit = true;

  // Relógio em tempo real
  const clk = document.getElementById("dash-clock");
  function tick() { clk.textContent = new Date().toLocaleString("pt-BR"); }
  tick();
  setInterval(tick, 1000);

  // Gráficos
  drawBarChart("chart-alerts",   MONTHLY.meses, MONTHLY.alertas,  "#2d8cf0", "Alertas");
  drawLineChart("chart-coverage", MONTHLY.meses, MONTHLY.cobertura, MONTHLY.precisao);

  // Tabela e feed
  buildDashTable();
  buildAlertFeed("dash-alerts");
  setInterval(() => tickAlerts("dash-alerts"), 6000);

  // Atualização periódica da métrica de alertas
  setInterval(() => {
    const v = 380 + Math.floor(Math.random() * 5);
    document.getElementById("m-alertas").textContent = v;
  }, 4000);
}

/**
 * Renderiza um gráfico de barras animado em canvas.
 * @param {string} id     - ID do elemento canvas
 * @param {string[]} labels - Rótulos do eixo X
 * @param {number[]} data   - Valores das barras
 * @param {string} color    - Cor principal (hex ou CSS)
 * @param {string} label    - Rótulo da série
 */
function drawBarChart(id, labels, data, color, label) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W   = canvas.offsetWidth || 500;
  const H   = 260;
  canvas.width  = W;
  canvas.height = H;

  // Margens internas
  const pL = 44, pB = 36, pT = 16, pR = 16;
  const aW  = W - pL - pR;
  const aH  = H - pB - pT;
  const max = Math.max(...data) * 1.15;
  const bW  = (aW / data.length) * 0.55;
  const gap = aW / data.length;

  ctx.clearRect(0, 0, W, H);

  /** Desenha as linhas de grade horizontais */
  function drawGrid() {
    for (let i = 0; i <= 4; i++) {
      const y = pT + aH - (i / 4) * aH;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(pL, y);
      ctx.lineTo(W - pR, y);
      ctx.stroke();
      ctx.fillStyle  = "rgba(139, 163, 199, 0.7)";
      ctx.font       = "10px Exo 2";
      ctx.textAlign  = "right";
      ctx.fillText(Math.round((i / 4) * max), pL - 6, y + 4);
    }
  }

  drawGrid();

  // Animação de entrada das barras
  let progress = 0;
  function frame() {
    progress = Math.min(progress + 0.04, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(pL, 0, aW + pR, H);
    drawGrid();

    data.forEach((v, i) => {
      const x  = pL + i * gap + (gap - bW) / 2;
      const bH = (v / max) * aH * ease;
      const y  = pT + aH - bH;

      // Gradiente vertical nas barras
      const grad = ctx.createLinearGradient(0, y, 0, pT + aH);
      grad.addColorStop(0, "#2d8cf0");
      grad.addColorStop(1, "rgba(45, 140, 240, 0.2)");
      ctx.fillStyle = grad;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, bW, bH, 4);
      } else {
        ctx.rect(x, y, bW, bH);
      }
      ctx.fill();

      // Rótulo do eixo X
      ctx.fillStyle = "rgba(139, 163, 199, 0.7)";
      ctx.font      = "9px Exo 2";
      ctx.textAlign = "center";
      ctx.fillText(labels[i], x + bW / 2, H - pB + 14);
    });

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/**
 * Renderiza um gráfico de linhas duplo em canvas.
 * @param {string} id       - ID do elemento canvas
 * @param {string[]} labels - Rótulos do eixo X
 * @param {number[]} d1     - Série 1 (Cobertura)
 * @param {number[]} d2     - Série 2 (Precisão)
 */
function drawLineChart(id, labels, d1, d2) {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W   = canvas.offsetWidth || 500;
  const H   = 260;
  canvas.width  = W;
  canvas.height = H;

  const pL  = 44, pB = 36, pT = 16, pR = 16;
  const aW  = W - pL - pR;
  const aH  = H - pB - pT;
  const min = 80, max = 100;

  ctx.clearRect(0, 0, W, H);

  // Grade horizontal com valores do eixo Y
  for (let i = 0; i <= 4; i++) {
    const y   = pT + aH - (i / 4) * aH;
    const val = min + (i / 4) * (max - min);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(pL, y);
    ctx.lineTo(W - pR, y);
    ctx.stroke();
    ctx.fillStyle = "rgba(139, 163, 199, 0.7)";
    ctx.font      = "10px Exo 2";
    ctx.textAlign = "right";
    ctx.fillText(Math.round(val), pL - 6, y + 4);
  }

  /**
   * Plota uma linha de dados com área preenchida opcional.
   * @param {number[]} data  - Valores a plotar
   * @param {string} color   - Cor da linha
   * @param {string|null} fill - Cor de preenchimento da área
   */
  function plotLine(data, color, fill) {
    const pts = data.map((v, i) => ({
      x: pL + (i / (data.length - 1)) * aW,
      y: pT + aH - ((v - min) / (max - min)) * aH,
    }));

    // Área preenchida abaixo da linha
    if (fill) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pT + aH);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pT + aH);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    // Linha
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Pontos de dados
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  plotLine(d1, "#2d8cf0", "rgba(45, 140, 240, 0.1)");
  plotLine(d2, "#00e87a", "rgba(0, 232, 122, 0.08)");

  // Legenda
  ctx.fillStyle = "#2d8cf0";
  ctx.fillRect(pL, pT - 4, 12, 3);
  ctx.fillStyle = "rgba(139, 163, 199, 0.8)";
  ctx.font      = "10px Exo 2";
  ctx.textAlign = "left";
  ctx.fillText("Cobertura", pL + 16, pT);

  ctx.fillStyle = "#00e87a";
  ctx.fillRect(pL + 90, pT - 4, 12, 3);
  ctx.fillStyle = "rgba(139, 163, 199, 0.8)";
  ctx.fillText("Precisão", pL + 106, pT);

  // Rótulos do eixo X
  labels.forEach((l, i) => {
    const x = pL + (i / (labels.length - 1)) * aW;
    ctx.fillStyle = "rgba(139, 163, 199, 0.7)";
    ctx.font      = "9px Exo 2";
    ctx.textAlign = "center";
    ctx.fillText(l, x, H - pB + 14);
  });
}

/** Renderiza a tabela de situação por região no dashboard. */
function buildDashTable() {
  const table = document.getElementById("dash-table");
  if (!table) return;

  // Templates de badge por status
  const statusMap = {
    critico: `<span class="state-badge badge-red"><span class="dot-badge"></span>Crítico</span>`,
    alerta:  `<span class="state-badge badge-yellow"><span class="dot-badge"></span>Alerta</span>`,
    ativo:   `<span class="state-badge badge-green"><span class="dot-badge"></span>Ativo</span>`,
  };

  table.innerHTML = `
    <thead>
      <tr>
        <th>Região</th>
        <th>Alertas Ativos</th>
        <th>Status</th>
        <th>Índice de Risco</th>
      </tr>
    </thead>
    <tbody>
      ${REGIOES.map(r => `
        <tr>
          <td>${r.nome}</td>
          <td>${r.alertas}</td>
          <td>${statusMap[r.status]}</td>
          <td>
            <div class="progress-cell">
              <span style="min-width:30px">${r.risco}%</span>
              <div class="prog-bar">
                <div class="prog-fill" style="width:${r.risco}%"></div>
              </div>
            </div>
          </td>
        </tr>`).join("")}
    </tbody>`;
}