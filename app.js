/* ══════════════════════════════════════════════════
   PIJAMADA INVITE — app.js
   ══════════════════════════════════════════════════ */

const CONFIG = {
  pijamaDate: "2026-05-29T19:00:00",
  formspreeURL: "https://formspree.io/f/mqejgabq",
  senderName: "Javier",
  showCountdown: true,
};

/* ══════════════════════════════════════════════════
   ESTADO GLOBAL
   ══════════════════════════════════════════════════ */
let state = {
  currentStep: 0,
  totalSteps: 6,   // pasos 0-5
  noAttempts: 0,
  muted: false,
  chips: { food: [], movie: [], snack: [], time: [], music: [] },
  answers: {},
};

/* ══════════════════════════════════════════════════
   PANTALLA 0 — FAKE LOADING
   ══════════════════════════════════════════════════ */
const tips = [
  "Inicializando ternura…",
  "Cargando snacks virtuales…",
  "Compilando emojis de corazón…",
  "Activando modo pijamada…",
  "Preparando la pregunta del año…",
  "Casi listo, espera… 🥺",
];

(function bootLoader() {
  const bar  = document.getElementById("loading-bar");
  const tip  = document.getElementById("loading-tip");
  let pct    = 0;
  let tipIdx = 0;

  const iv = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct > 100) pct = 100;
    bar.style.width = pct + "%";

    tipIdx = Math.floor((pct / 100) * tips.length);
    if (tipIdx >= tips.length) tipIdx = tips.length - 1;
    tip.textContent = tips[tipIdx];

    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        transition("screen-loading", "screen-question");
        initQuestionScreen();
      }, 600);
    }
  }, 280);
})();

/* ══════════════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════════════ */
function transition(fromId, toId) {
  const from = document.getElementById(fromId);
  const to   = document.getElementById(toId);
  from.style.opacity   = "1";
  from.style.transition = "opacity .5s";
  from.style.opacity   = "0";
  setTimeout(() => {
    from.classList.remove("active");
    from.style.opacity   = "";
    from.style.transition = "";
    to.classList.add("active");
    to.style.opacity   = "0";
    to.style.transition = "opacity .5s";
    requestAnimationFrame(() => { to.style.opacity = "1"; });
    setTimeout(() => { to.style.transition = ""; }, 520);
  }, 500);
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function rand(a, b) { return a + Math.random() * (b - a); }

/* ══════════════════════════════════════════════════
   PANTALLA 1 — BOTÓN "NO" QUE ESCAPA
   ══════════════════════════════════════════════════ */
const noTexts = [
  ["No", "😒"],
  ["¿Segura?", "🤔"],
  ["Piénsalo bien", "😅"],
  ["Error 404", "🤖"],
  ["No disponible", "😂"],
  ["¿En serio?", "👀"],
  ["NPC mode", "💀"],
  ["Opción bloqueada", "🔒"],
  ["try again", "💔"],
  ["JAMÁS", "🫣"],
];

let noBtn, noTextEl, noEmojiEl;
const EDGE = 14;

function initQuestionScreen() {
  noBtn     = document.getElementById("btn-no");
  noTextEl  = document.getElementById("no-text");
  noEmojiEl = document.getElementById("no-emoji");

  createBubbles();

  setTimeout(() => {
    const yes  = document.getElementById("btn-yes").getBoundingClientRect();
    const btnW = noBtn.offsetWidth  || 130;
    const btnH = noBtn.offsetHeight || 52;
    let nx = yes.right + 12;
    let ny = yes.top;
    if (nx + btnW > window.innerWidth - EDGE) {
      nx = yes.left;
      ny = yes.bottom + 14;
    }
    setNoBtnPos(clamp(nx, EDGE, window.innerWidth - btnW - EDGE),
                clamp(ny, EDGE + 50, window.innerHeight - btnH - EDGE));
  }, 150);

  document.addEventListener("mousemove", onMouseNear);
  noBtn.addEventListener("touchstart", onNoTouch, { passive: false });
}

function setNoBtnPos(x, y) {
  const btnW = noBtn.offsetWidth  || 130;
  const btnH = noBtn.offsetHeight || 52;
  const safeX = clamp(x, EDGE, window.innerWidth  - btnW - EDGE);
  const safeY = clamp(y, EDGE + 50, window.innerHeight - btnH - EDGE);
  noBtn.style.left = safeX + "px";
  noBtn.style.top  = safeY + "px";
}

function onMouseNear(e) {
  const rect = noBtn.getBoundingClientRect();
  const cx   = rect.left + rect.width  / 2;
  const cy   = rect.top  + rect.height / 2;
  if (Math.hypot(e.clientX - cx, e.clientY - cy) < 110) escapeNoBtn();
}

function onNoTouch(e) {
  e.preventDefault();
  escapeNoBtn();
}

function escapeNoBtn() {
  state.noAttempts++;

  const badge = document.getElementById("attempt-badge");
  badge.style.display = "block";
  document.getElementById("attempt-count").textContent = state.noAttempts;

  const pair = noTexts[Math.min(state.noAttempts, noTexts.length - 1)];
  noTextEl.textContent  = pair[0];
  noEmojiEl.textContent = pair[1];

  const btnW = noBtn.offsetWidth  || 130;
  const btnH = noBtn.offsetHeight || 52;
  const maxX = window.innerWidth  - btnW - EDGE;
  const maxY = window.innerHeight - btnH - EDGE;
  const minY = EDGE + 50;

  const cur = noBtn.getBoundingClientRect();
  let nx, ny, attempts = 0;
  do {
    nx = rand(EDGE, maxX);
    ny = rand(minY, maxY);
    attempts++;
  } while (Math.hypot(nx - cur.left, ny - cur.top) < 80 && attempts < 20);

  setNoBtnPos(nx, ny);

  let transform = "";
  if (state.noAttempts % 3 === 0) {
    transform = `rotate(${rand(-25, 25).toFixed(1)}deg)`;
  } else if (state.noAttempts % 4 === 0) {
    const s = rand(0.7, 1.2).toFixed(2);
    transform = `scale(${s})`;
  }
  noBtn.style.transform = transform;

  noBtn.classList.remove("shaking");
  void noBtn.offsetWidth;
  noBtn.classList.add("shaking");

  const hint = document.getElementById("hint-text");
  if (state.noAttempts === 5)  hint.textContent = "El botón No tiene vida propia… 👀";
  if (state.noAttempts === 10) hint.textContent = "¡De verdad que no va a funcionar! 😭";
  if (state.noAttempts === 15) hint.textContent = "Ya rendiste? Solo presiona Sí 💖";
}

/* ══════════════════════════════════════════════════
   BOTÓN "SÍ"
   ══════════════════════════════════════════════════ */
function handleYes() {
  document.removeEventListener("mousemove", onMouseNear);
  spawnHearts(30);
  fireConfetti();
  transition("screen-question", "screen-yes");
  playChime();

  const yesMessages = [
    "¡Sabía que aceptarías! 😌",
    "Era la única opción correcta ✨",
    "Mi corazón confirmado 💖",
    "Decisión 10/10 aprobada 🏆",
  ];
  const msg = yesMessages[Math.floor(Math.random() * yesMessages.length)];
  setTimeout(() => { document.getElementById("yes-title").textContent = msg; }, 800);

  setTimeout(() => {
    transition("screen-yes", "screen-form");
    updateProgress();
  }, 3200);
}

/* ══════════════════════════════════════════════════
   FORMULARIO — navegación entre pasos
   ══════════════════════════════════════════════════ */
function nextStep(stepIndex) {
  collectAnswer(stepIndex);

  const current = document.getElementById(`step-${stepIndex}`);
  const next    = document.getElementById(`step-${stepIndex + 1}`);

  if (!next) return;

  current.classList.add("leaving");
  setTimeout(() => {
    current.classList.remove("active", "leaving");
    next.classList.add("active");
    state.currentStep = stepIndex + 1;
    updateProgress();
    document.getElementById("screen-form").scrollTo({ top: 0, behavior: "smooth" });
  }, 350);
}

function updateProgress() {
  const pct = ((state.currentStep) / (state.totalSteps - 1)) * 100;
  document.getElementById("progress-bar").style.width = pct + "%";
}

/* ══════════════════════════════════════════════════
   CHIPS — selección múltiple
   ══════════════════════════════════════════════════ */
function toggleChip(btn, category) {
  btn.classList.toggle("selected");
  const val = btn.textContent.trim();
  const arr = state.chips[category];
  const idx = arr.indexOf(val);
  if (idx === -1) arr.push(val);
  else arr.splice(idx, 1);
}

/* ══════════════════════════════════════════════════
   RECOPILAR RESPUESTAS
   Pasos: 0=food 1=movie 2=snack 3=time 4=music 5=message
   ══════════════════════════════════════════════════ */
function collectAnswer(step) {
  switch (step) {
    case 0:
      state.answers.food = combine(state.chips.food, document.getElementById("input-food-extra").value);
      break;
    case 1:
      state.answers.movie = combine(state.chips.movie, document.getElementById("input-movie-extra").value);
      break;
    case 2:
      state.answers.snack = combine(state.chips.snack, document.getElementById("input-snack-extra").value);
      break;
    case 3:
      state.answers.time = combine(state.chips.time, document.getElementById("input-time-extra").value);
      break;
    case 4:
      state.answers.music = combine(state.chips.music, document.getElementById("input-music-extra").value);
      break;
    case 5:
      state.answers.message = document.getElementById("input-message").value.trim();
      break;
  }
}

function combine(chipsArr, extraInput) {
  const parts = [...chipsArr];
  if (extraInput && extraInput.trim()) parts.push(extraInput.trim());
  return parts.join(", ") || "Sin respuesta";
}

/* ══════════════════════════════════════════════════
   CONTADOR DE CARACTERES EN TEXTAREA
   ══════════════════════════════════════════════════ */
document.getElementById("input-message").addEventListener("input", function () {
  const left = 300 - this.value.length;
  document.getElementById("char-left").textContent = left;
});

/* ══════════════════════════════════════════════════
   SUBMIT — ENVIAR A FORMSPREE
   ══════════════════════════════════════════════════ */
async function submitForm() {
  collectAnswer(5);

  const btn = document.getElementById("submit-btn");
  btn.textContent = "Enviando… 🚀";
  btn.disabled = true;

  const payload = {
    nombre:    "Jessica",
    comida:    state.answers.food,
    pelicula:  state.answers.movie,
    snacks:    state.answers.snack,
    hora_de_recogida: state.answers.time,
    musica:    state.answers.music,
    mensaje:   state.answers.message,
    intentos_de_no: state.noAttempts,
    enviado_por: CONFIG.senderName,
  };

  try {
    if (CONFIG.formspreeURL.includes("XXXXXXXX")) {
      console.log("📋 Respuestas (modo demo):", payload);
      showEndScreen();
    } else {
      const res = await fetch(CONFIG.formspreeURL, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        showEndScreen();
      } else {
        throw new Error("Formspree respondió con error");
      }
    }
  } catch (err) {
    console.error("Error enviando:", err);
    showEndScreen();
  }
}

/* ══════════════════════════════════════════════════
   PANTALLA FINAL
   ══════════════════════════════════════════════════ */
function showEndScreen() {
  spawnHearts(50);
  fireConfetti();
  transition("screen-form", "screen-end");

  // ✅ Nombre fijo: Jessica
  document.getElementById("end-name").textContent = "guapa";

  const summary = document.getElementById("end-summary");
  const items = [
    { label: "🍕 Comida:",           val: state.answers.food    },
    { label: "🎬 Película:",         val: state.answers.movie   },
    { label: "🍿 Snacks:",           val: state.answers.snack   },
    { label: "🚗 Paso por ti a las:", val: state.answers.time   },
    { label: "🎵 Música:",           val: state.answers.music   },
    { label: "💌 Mensaje:",          val: state.answers.message },
  ];
  summary.innerHTML = items
    .filter(i => i.val && i.val !== "Sin respuesta")
    .map(i => `<div class="summary-item"><span class="summary-label">${i.label}</span><span class="summary-val">${i.val}</span></div>`)
    .join("");

  if (CONFIG.showCountdown) startCountdown(CONFIG.pijamaDate);

  setInterval(() => spawnHearts(3), 1200);
}

/* ══════════════════════════════════════════════════
   COUNTDOWN
   ══════════════════════════════════════════════════ */
function startCountdown(dateStr) {
  const target = new Date(dateStr).getTime();
  function tick() {
    const now  = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      document.querySelector(".end-countdown").innerHTML =
        '<p style="font-size:1.2rem;font-weight:800;color:var(--yellow)">¡Es HOY! 🎉🎉🎉</p>';
      return;
    }
    const d  = Math.floor(diff / 86400000);
    const h  = Math.floor((diff % 86400000) / 3600000);
    const m  = Math.floor((diff % 3600000)  / 60000);
    const s  = Math.floor((diff % 60000)    / 1000);
    document.getElementById("cd-days").textContent  = String(d).padStart(2,"0");
    document.getElementById("cd-hours").textContent = String(h).padStart(2,"0");
    document.getElementById("cd-mins").textContent  = String(m).padStart(2,"0");
    document.getElementById("cd-secs").textContent  = String(s).padStart(2,"0");
  }
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════
   EFECTOS — Burbujas
   ══════════════════════════════════════════════════ */
function createBubbles() {
  const container = document.getElementById("bubbles");
  const colors = ["#ff6b9d","#c77dff","#7fffd4","#ffe066","#ff9f43"];
  for (let i = 0; i < 18; i++) {
    const b = document.createElement("div");
    b.className = "bubble";
    const size = rand(30, 120);
    const left = rand(0, 98);
    const dur  = rand(12, 28);
    const del  = rand(0, 20);
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${dur}s;
      animation-delay:-${del}s;
    `;
    container.appendChild(b);
  }
}

/* ══════════════════════════════════════════════════
   EFECTOS — Corazones flotantes
   ══════════════════════════════════════════════════ */
const heartEmojis = ["💖","💕","💗","💓","💞","🌸","✨","🩷"];

function spawnHearts(count) {
  const c = document.getElementById("hearts-container");
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const h = document.createElement("div");
      h.className = "heart-particle";
      h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      const x   = rand(5, 95);
      const dx  = rand(-60, 60);
      const dur = rand(2.5, 5);
      h.style.cssText = `
        left:${x}%;
        font-size:${rand(.9,2.2)}rem;
        --dx:${dx}px;
        animation-duration:${dur}s;
        animation-delay:${rand(0,.8)}s;
      `;
      c.appendChild(h);
      setTimeout(() => h.remove(), (dur + 1) * 1000);
    }, i * 80);
  }
}

/* ══════════════════════════════════════════════════
   EFECTOS — Confetti
   ══════════════════════════════════════════════════ */
function fireConfetti() {
  if (typeof confetti === "undefined") return;
  const colors = ["#ff6b9d","#c77dff","#ffe066","#7fffd4","#ff9f43"];
  confetti({ particleCount: 120, spread: 80, origin: { y: .55 }, colors });
  setTimeout(() => confetti({ particleCount: 60, spread: 100, angle: 120, origin: { x: 1, y: .55 }, colors }), 300);
  setTimeout(() => confetti({ particleCount: 60, spread: 100, angle: 60,  origin: { x: 0, y: .55 }, colors }), 600);
}

/* ══════════════════════════════════════════════════
   AUDIO — Web Audio API
   ══════════════════════════════════════════════════ */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playChime() {
  if (state.muted) return;
  try {
    const ctx  = getAudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(.25, t + .05);
      gain.gain.exponentialRampToValueAtTime(.001, t + .6);
      osc.start(t);
      osc.stop(t + .65);
    });
  } catch(e) {}
}

function playPop() {
  if (state.muted) return;
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + .12);
    gain.gain.setValueAtTime(.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + .2);
  } catch(e) {}
}

/* Mute button */
document.getElementById("mute-btn").addEventListener("click", () => {
  state.muted = !state.muted;
  document.getElementById("mute-btn").textContent = state.muted ? "🔇" : "🔊";
});

/* Pop en chips */
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => playPop());
});

/* ══════════════════════════════════════════════════
   EASTER EGG — Konami code
   ══════════════════════════════════════════════════ */
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiIdx = 0;
document.addEventListener("keydown", e => {
  if (e.key === KONAMI[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === KONAMI.length) {
      konamiIdx = 0;
      spawnHearts(100);
      fireConfetti();
      alert("🎮 Easter egg activado! +100 puntos de ternura ✨");
    }
  } else { konamiIdx = 0; }
});

/* Prevenir scroll accidental en mobile con btn No */
document.addEventListener("touchmove", e => {
  if (e.target === noBtn) e.preventDefault();
}, { passive: false });
