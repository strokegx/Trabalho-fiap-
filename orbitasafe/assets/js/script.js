/* =========================================
   ORBITASAFE — SCRIPT.JS
   Scripts globais compartilhados entre páginas
   ========================================= */

"use strict";

// ─── LOADER ────────────────────────────────────────────────
(function iniciarLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("oculto");
    }, 1200);
  });
})();

// ─── CANVAS DE ESTRELAS ────────────────────────────────────
(function iniciarEstrelas() {
  const canvas = document.getElementById("canvas-estrelas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let estrelas = [];

  function redimensionar() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    criarEstrelas();
  }

  function criarEstrelas() {
    estrelas = [];
    const quantidade = Math.floor((canvas.width * canvas.height) / 6000);
    for (let i = 0; i < quantidade; i++) {
      estrelas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        raio: Math.random() * 1.5 + 0.3,
        opacidade: Math.random(),
        velocidade: Math.random() * 0.004 + 0.002,
        fase: Math.random() * Math.PI * 2,
      });
    }
  }

  function animarEstrelas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const agora = Date.now() * 0.001;

    estrelas.forEach((estrela) => {
      const brilho =
        0.4 + 0.6 * Math.sin(agora * estrela.velocidade * 10 + estrela.fase);
      ctx.beginPath();
      ctx.arc(estrela.x, estrela.y, estrela.raio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${brilho * estrela.opacidade})`;
      ctx.fill();
    });

    requestAnimationFrame(animarEstrelas);
  }

  redimensionar();
  animarEstrelas();
  window.addEventListener("resize", redimensionar);
})();

// ─── MENU HAMBÚRGUER ───────────────────────────────────────
(function iniciarMenuMobile() {
  const hamburguer = document.getElementById("menu-hamburguer");
  const menu = document.getElementById("menu-nav");
  if (!hamburguer || !menu) return;

  hamburguer.addEventListener("click", () => {
    hamburguer.classList.toggle("ativo");
    menu.classList.toggle("aberto");
    document.body.style.overflow = menu.classList.contains("aberto")
      ? "hidden"
      : "";
  });

  // Fecha ao clicar em um link
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburguer.classList.remove("ativo");
      menu.classList.remove("aberto");
      document.body.style.overflow = "";
    });
  });
})();

// ─── LINK ATIVO NO MENU ────────────────────────────────────
(function marcarMenuAtivo() {
  const paginaAtual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu a").forEach((link) => {
    const href = link.getAttribute("href").split("/").pop();
    if (href === paginaAtual) link.classList.add("ativo");
  });
})();

// ─── ANIMAÇÃO AO ROLAR (IntersectionObserver) ──────────────
(function iniciarAnimacaoRolar() {
  const elementos = document.querySelectorAll(".revelar");
  if (!elementos.length) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada, idx) => {
        if (entrada.isIntersecting) {
          setTimeout(() => {
            entrada.target.classList.add("visivel");
          }, idx * 80);
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  elementos.forEach((el) => observador.observe(el));
})();

// ─── CONTADORES ANIMADOS ───────────────────────────────────
function animarContador(idOuElemento, valorFinal, duracao = 2000, sufixo = "") {
  const elemento =
    typeof idOuElemento === "string"
      ? document.getElementById(idOuElemento)
      : idOuElemento;

  if (!elemento) return;

  let inicio = null;
  const valorInicial = 0;

  function passo(timestamp) {
    if (!inicio) inicio = timestamp;
    const progresso = Math.min((timestamp - inicio) / duracao, 1);
    const easing = 1 - Math.pow(1 - progresso, 3); // easeOutCubic
    const atual = Math.floor(
      easing * (valorFinal - valorInicial) + valorInicial,
    );

    elemento.textContent = atual.toLocaleString("pt-BR") + sufixo;

    if (progresso < 1) requestAnimationFrame(passo);
    else elemento.textContent = valorFinal.toLocaleString("pt-BR") + sufixo;
  }

  requestAnimationFrame(passo);
}

// Observar contadores e iniciar quando visíveis
(function iniciarContadores() {
  const contadores = document.querySelectorAll("[data-contador]");
  if (!contadores.length) return;

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          const el = entrada.target;
          const valor = parseInt(el.dataset.contador);
          const sufixo = el.dataset.sufixo || "";
          const duracao = parseInt(el.dataset.duracao) || 2000;
          animarContador(el, valor, duracao, sufixo);
          observador.unobserve(el);
        }
      });
    },
    { threshold: 0.5 },
  );

  contadores.forEach((el) => observador.observe(el));
})();

// ─── RELÓGIO GLOBAL ────────────────────────────────────────
function iniciarRelogio(idElemento = "relogio") {
  const el = document.getElementById(idElemento);
  if (!el) return;

  function atualizar() {
    const agora = new Date();
    el.textContent =
      agora.toLocaleDateString("pt-BR") +
      " · " +
      agora.toLocaleTimeString("pt-BR") +
      " (UTC-3)";
  }

  atualizar();
  setInterval(atualizar, 1000);
}

// ─── ALERTAS EM TEMPO REAL ─────────────────────────────────
const ALERTAS_DADOS = [
  {
    tipo: "vermelho",
    icone: "🔴",
    texto: "Alto risco de enchente detectado — Manaus, AM",
    regiao: "Norte",
  },
  {
    tipo: "amarelo",
    icone: "🟡",
    texto: "Possibilidade de seca prolongada — Goiás, GO",
    regiao: "Centro-Oeste",
  },
  {
    tipo: "verde",
    icone: "🟢",
    texto: "Condições climáticas estáveis — Paraná, PR",
    regiao: "Sul",
  },
  {
    tipo: "vermelho",
    icone: "🔴",
    texto: "Queimada detectada — Sul do Pará, PA",
    regiao: "Norte",
  },
  {
    tipo: "amarelo",
    icone: "🟡",
    texto: "Elevação do nível dos rios — Amazonas, AM",
    regiao: "Norte",
  },
  {
    tipo: "verde",
    icone: "🟢",
    texto: "Monitoramento orbital normalizado — São Paulo, SP",
    regiao: "Sudeste",
  },
  {
    tipo: "vermelho",
    icone: "🔴",
    texto: "Deslizamento de risco alto — Serra Gaúcha, RS",
    regiao: "Sul",
  },
  {
    tipo: "amarelo",
    icone: "🟡",
    texto: "Ressaca intensa prevista — Litoral do Ceará, CE",
    regiao: "Nordeste",
  },
];

function criarElementoAlerta(dados) {
  const agora = new Date();
  const horario = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const div = document.createElement("div");
  div.className = `alerta alerta-${dados.tipo}`;
  div.innerHTML = `
    <span>${dados.icone}</span>
    <span>${dados.texto}</span>
    <span class="alerta-tempo">${horario}</span>
  `;
  return div;
}

function iniciarAlertasDinamicos(seletor = ".lista-alertas") {
  const lista = document.querySelector(seletor);
  if (!lista) return;

  let indice = 0;

  setInterval(() => {
    const dados = ALERTAS_DADOS[indice % ALERTAS_DADOS.length];
    const novoAlerta = criarElementoAlerta(dados);
    novoAlerta.style.opacity = "0";

    lista.insertBefore(novoAlerta, lista.firstChild);

    requestAnimationFrame(() => {
      novoAlerta.style.transition = "opacity 0.5s ease";
      novoAlerta.style.opacity = "1";
    });

    // Remove o último se houver mais de 5
    const alertas = lista.querySelectorAll(".alerta");
    if (alertas.length > 5) {
      const ultimo = alertas[alertas.length - 1];
      ultimo.style.transition = "opacity 0.5s ease";
      ultimo.style.opacity = "0";
      setTimeout(() => ultimo.remove(), 500);
    }

    indice++;
  }, 6000);
}

// ─── BARRAS DE PROGRESSO ANIMADAS ─────────────────────────
function animarBarras() {
  document
    .querySelectorAll(".barra-progresso-preenchimento[data-largura]")
    .forEach((barra) => {
      setTimeout(() => {
        barra.style.width = barra.dataset.largura + "%";
      }, 300);
    });
}

const observadorBarras = new IntersectionObserver(
  (entradas) => {
    if (entradas.some((e) => e.isIntersecting)) {
      animarBarras();
      observadorBarras.disconnect();
    }
  },
  { threshold: 0.3 },
);

document
  .querySelectorAll(".barra-progresso")
  .forEach((el) => observadorBarras.observe(el));

// ─── TOOLTIP SIMPLES ───────────────────────────────────────
document.addEventListener("mouseover", (e) => {
  const alvo = e.target.closest("[data-tooltip]");
  if (!alvo) return;

  let tooltip = document.getElementById("tooltip-global");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "tooltip-global";
    tooltip.style.cssText = `
      position: fixed;
      background: rgba(8,15,34,0.95);
      border: 1px solid rgba(45,140,240,0.4);
      color: #e8f0fe;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-family: 'Exo 2', sans-serif;
      pointer-events: none;
      z-index: 9998;
      white-space: nowrap;
      backdrop-filter: blur(8px);
    `;
    document.body.appendChild(tooltip);
  }

  tooltip.textContent = alvo.dataset.tooltip;
  tooltip.style.opacity = "1";

  function moverTooltip(ev) {
    tooltip.style.left = ev.clientX + 12 + "px";
    tooltip.style.top = ev.clientY - 28 + "px";
  }

  alvo.addEventListener("mousemove", moverTooltip);
  alvo.addEventListener(
    "mouseleave",
    () => {
      tooltip.style.opacity = "0";
      alvo.removeEventListener("mousemove", moverTooltip);
    },
    { once: true },
  );
});

// iniciarRelogio() é chamado por cada página que tem o elemento #relogio
