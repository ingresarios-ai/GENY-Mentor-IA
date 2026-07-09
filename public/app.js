// Geny tu Mentor IA — lógica de la app
const K = window.KNOWLEDGE;
const $ = sel => document.querySelector(sel);
const main = $('#main');

let state = {
  trades: [],
  reto: { startDate: null, days: {} },
  game: { xp: 0, escudos: 0, streak: 0, wager: null, lastWager: null, activeToday: false },
  cfg: { modo: '' },
  chat: [], // {role, content}
  view: 'dashboard'
};

// ---------- Modo Explorador: divulgación progresiva ----------
function esExplorador() { return state.cfg.modo === 'explorador'; }
function diasReto() { return Object.keys(state.reto.days || {}).length; }

// Currículum de 21 días (día → lección de la Academia)
const CURRICULUM = [
  { t: 'El método PEDEM', tab: 'pedem', d: 'Las 5 fases que separan al que sueña del que vive de esto.' },
  { t: 'Call y Put: los dos ladrillos', tab: 'glosario', d: 'Busca "Call" y "Put" en el glosario. Todo lo demás se construye con esto.' },
  { t: 'Strike, prima y vencimiento', tab: 'glosario', d: 'Busca "Strike", "Premium" y "Expiración". El idioma básico de las opciones.' },
  { t: 'Delta: el GPS de la opción', tab: 'greeks', d: 'Tu primera Greek. Con esto entiendes probabilidad y dirección.' },
  { t: 'Theta: el tiempo es dinero', tab: 'greeks', d: 'Por qué las opciones pierden valor cada día — y cómo ponerlo a tu favor.' },
  { t: 'Covered Call: income sobre acciones', tab: 'estrategias', d: 'La estrategia más noble para empezar a entender el income.' },
  { t: 'Cash-Secured Put', tab: 'estrategias', d: 'Cobrar por esperar el precio que quieres. Hoy se desbloquea tu bitácora de trades 🎉' },
  { t: 'Sizing: la regla del 2-5%', tab: 'riesgo', d: 'La regla que mantiene vivo al trader. Léela dos veces.' },
  { t: 'Bull Call Spread', tab: 'estrategias', d: 'Tu primera estrategia direccional con riesgo definido.' },
  { t: 'Bear Put Spread', tab: 'estrategias', d: 'La otra cara: ganar cuando el mercado cae, con riesgo controlado.' },
  { t: 'Vega e IV Rank', tab: 'greeks', d: 'La volatilidad implícita decide QUÉ estrategia usar. Concepto clave.' },
  { t: 'Iron Condor', tab: 'estrategias', d: 'La estrategia estrella del income: ganar cuando no pasa nada.' },
  { t: 'El selector de estrategia', tab: 'selector', d: 'Práctica: combina outlook + IV Rank y mira qué sugiere el sistema.' },
  { t: 'Stop loss y take profit', tab: 'riesgo', d: 'Cuándo salir: la diferencia entre disciplina y esperanza.' },
  { t: 'Gamma: la aceleración', tab: 'greeks', d: 'Por qué la última semana antes del vencimiento es traicionera.' },
  { t: 'Straddle: apostar al movimiento', tab: 'estrategias', d: 'Ganar sin saber la dirección — y el peligro del IV crush.' },
  { t: 'Calendar y PMCC', tab: 'estrategias', d: 'Estrategias de tiempo: el covered call del que no tiene 100 acciones.' },
  { t: 'El checklist pre-trade', tab: 'pedem', d: 'Los 7 puntos que revisas ANTES de arriesgar un dólar. Tu escudo real.' },
  { t: 'Gestión de tiempo (DTE)', tab: 'riesgo', d: 'Entrar a 30-45 días, cerrar a 21. Las reglas del reloj.' },
  { t: 'PEDEM completo, de nuevo', tab: 'pedem', d: 'Reléelo con todo lo que ya sabes. Ahora cada fase tiene sentido.' },
  { t: 'Tu plan de trading', tab: 'riesgo', d: 'Día final: escribe TUS reglas en el chat con Geny. Mañana empieza tu carrera.' }
];

// Reglas de desbloqueo para el Explorador
const UNLOCKS = [
  { id: 'liga', dia: 3, label: '🏆 La Liga de Disciplina', view: 'liga' },
  { id: 'selector', dia: 5, label: '🎯 El Selector de Estrategias', view: null },
  { id: 'trades', dia: 7, label: '📓 Tu bitácora de trades (modo simple)', view: 'nuevo' },
  { id: 'apuesta', dia: 7, label: '🎲 La Apuesta de Racha', view: null }
];

function unlocked(id) {
  if (!esExplorador()) return true;
  const u = UNLOCKS.find(x => x.id === id);
  return !u || diasReto() >= u.dia;
}

function checkUnlocks() {
  if (!esExplorador()) return;
  const seen = JSON.parse(localStorage.getItem('unlocks-seen') || '[]');
  const nuevos = UNLOCKS.filter(u => diasReto() >= u.dia && !seen.includes(u.id));
  nuevos.forEach((u, i) => setTimeout(() => {
    toast(`🔓 ¡DESBLOQUEADO! ${u.label}`, 4500);
    confetti();
  }, 600 + i * 1000));
  if (nuevos.length) {
    localStorage.setItem('unlocks-seen', JSON.stringify([...seen, ...nuevos.map(u => u.id)]));
    updateNav();
  }
}

function updateNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    const view = btn.dataset.view;
    let locked = false, dia = 0;
    if (esExplorador()) {
      if (view === 'nuevo' && !unlocked('trades')) { locked = true; dia = 7; }
      if (view === 'liga' && !unlocked('liga')) { locked = true; dia = 3; }
    }
    btn.textContent = locked ? '🔒 ' + btn.dataset.label.replace(/^[^\s]+\s/, '') : btn.dataset.label;
    btn.classList.toggle('locked', locked);
    btn.dataset.lockedDay = locked ? dia : '';
  });
}

function showOnboarding() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'onboarding';
  overlay.innerHTML = `
    <div class="modal" style="max-width:520px;text-align:center">
      <div style="font-size:40px;margin-bottom:8px">👋</div>
      <h3 style="font-size:18px">Soy Geny, tu Mentor IA 🤖</h3>
      <p style="font-size:14px;color:var(--text-dim);margin-bottom:20px;line-height:1.6">Para armar tu camino, una sola pregunta:<br><b style="color:var(--text)">¿Ya operas opciones?</b></p>
      <div style="display:flex;gap:12px;flex-direction:column">
        <button class="btn btn-green" onclick="setModo('explorador')">🌱 ESTOY EMPEZANDO<br><span style="font-size:11px;font-weight:400">Te llevo de la mano: una lección al día, sin abrumarte</span></button>
        <button class="btn" onclick="setModo('operador')">⚡ YA OPERO<br><span style="font-size:11px;font-weight:400">Bitácora completa, Greeks, liga y todas las herramientas</span></button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

window.setModo = async (m) => {
  await api('/config', { method: 'POST', body: JSON.stringify({ modo: m }) });
  state.cfg.modo = m;
  document.getElementById('onboarding')?.remove();
  updateNav();
  render();
  toast(m === 'explorador'
    ? '🌱 Modo Explorador activo. Tu única misión de hoy: la lección del día 1.'
    : '⚡ Modo Operador activo. Todas las herramientas desbloqueadas.');
};

// ---------- API helpers (movidos a api.js) ----------
async function loadData() {
  [state.trades, state.reto, state.game, state.cfg] = await Promise.all([api('/trades'), api('/reto21'), api('/game'), api('/config')]);
}

// ---------- XP / gamificación ----------
async function award(xp, key, label) {
  const g = await api('/game/activity', { method: 'POST', body: JSON.stringify({ xp, key }) });
  const prevWager = state.game.wager;
  state.game = g;
  if (g.awarded > 0) toast(`+${g.awarded} XP · ${label} 🔥 Racha: ${g.streak}`);
  if (prevWager && !g.wager && g.lastWager?.status === 'won') {
    toast(`🏆 ¡GANASTE la Apuesta de Racha! +${g.lastWager.amount * 2} XP`, 5000);
    confetti();
  }
  checkBadges();
}

function toast(msg, ms = 3200) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, ms);
}

// ---------- Insignias de proceso (nunca por volumen de trades ni P&L) ----------
const BADGES = [
  { id: 'primer-trade', e: '🎯', n: 'Primer disparo', d: 'Registraste tu primer trade con el flujo PEDEM', check: () => state.trades.length >= 1 },
  { id: 'checklist-5', e: '✅', n: 'Francotirador', d: '5 trades con checklist pre-trade 7/7', check: () => state.trades.filter(t => t.checklistOk).length >= 5 },
  { id: 'plan-5', e: '🧭', n: 'Palabra de trader', d: '5 trades cerrados respetando el plan', check: () => state.trades.filter(t => t.status === 'cerrado' && t.planRespetado).length >= 5 },
  { id: 'leccion-10', e: '📚', n: 'Alquimista', d: '10 lecciones escritas al cerrar trades', check: () => state.trades.filter(t => t.status === 'cerrado' && t.leccion).length >= 10 },
  { id: 'racha-7', e: '🔥', n: 'Semana de fuego', d: 'Racha de disciplina de 7 días', check: () => state.game.streak >= 7 },
  { id: 'racha-14', e: '⚡', n: 'Imparable', d: 'Racha de disciplina de 14 días', check: () => state.game.streak >= 14 },
  { id: 'racha-21', e: '🏆', n: 'Vive de esto', d: 'Racha de disciplina de 21 días', check: () => state.game.streak >= 21 },
  { id: 'hito-7', e: '1️⃣', n: 'Primera semana', d: '7 días del Reto 21 — sobreviviste la ventana crítica', check: () => diasReto() >= 7 },
  { id: 'hito-14', e: '2️⃣', n: 'Dos de tres', d: '14 días del Reto 21 — la mayoría nunca llega aquí', check: () => diasReto() >= 14 },
  { id: 'reto-21', e: '👑', n: 'RETO 21 COMPLETADO', d: 'Los 21 días del reto, uno a uno', check: () => Object.keys(state.reto.days || {}).length >= 21 },
  { id: 'camino-66', e: '🧠', n: 'Hábito de acero', d: '66 días de actividad — la automaticidad según la ciencia (UCL)', check: () => Object.keys(state.game.activity || {}).length >= 66 },
  { id: 'apuesta-ganada', e: '🎲', n: 'All-in a la disciplina', d: 'Ganaste una Apuesta de Racha', check: () => state.game.lastWager?.status === 'won' },
  { id: 'xp-500', e: '💠', n: 'Operador', d: '500 XP de proceso acumulados', check: () => (state.game.xpTotal || 0) >= 500 },
  { id: 'xp-2000', e: '💎', n: 'Sistemático', d: '2,000 XP de proceso acumulados', check: () => (state.game.xpTotal || 0) >= 2000 }
];

async function checkBadges() {
  const nuevos = BADGES.filter(b => !(state.game.badges || []).includes(b.id) && b.check());
  if (!nuevos.length) return;
  state.game = await api('/game/badges', { method: 'POST', body: JSON.stringify({ ids: nuevos.map(b => b.id) }) });
  nuevos.forEach((b, i) => setTimeout(() => {
    toast(`${b.e} INSIGNIA DESBLOQUEADA: ${b.n} — ${b.d}`, 4500);
    confetti();
  }, i * 900));
}

// Confetti solo por hitos de DISCIPLINA (jamás por operar)
function confetti() {
  const colores = ['#00e676', '#00e5ff', '#e6007a', '#ffd600', '#ffffff'];
  for (let i = 0; i < 36; i++) {
    const p = document.createElement('div');
    p.className = 'confetti';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colores[i % colores.length];
    p.style.animationDelay = (Math.random() * 0.6) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3200);
  }
}

// ---------- Camino a los 66: puente post-reto hacia la automaticidad real ----------
function caminoHtml() {
  if (diasReto() < 21) return '';
  const diasActivos = Object.keys(state.game.activity || {}).length;
  const pct = Math.min(100, Math.round(diasActivos / 66 * 100));
  return `
    <div class="card camino-card">
      <h3>🧠 Camino a los 66 — la automaticidad real</h3>
      <p class="hint" style="margin-bottom:12px">El Reto 21 fue la fase de arranque, donde cada día vale doble. La ciencia (UCL) dice que el hábito se vuelve automático a los ~66 días. Sigue sumando: tu racha ya sabe el camino.</p>
      <div class="progress-wrap">
        <div class="progress-fill" style="width:${pct}%"></div>
        <span class="progress-label">${diasActivos} / 66 días de disciplina</span>
      </div>
      ${diasActivos >= 66
        ? '<p class="ok-msg" style="margin-top:10px">🧠 HÁBITO DE ACERO: cruzaste la línea de la automaticidad. Esto ya es parte de quién eres.</p>'
        : `<p class="hint" style="margin-top:10px">Te faltan <b style="color:var(--green)">${66 - diasActivos} días</b> para el Hábito de Acero 🧠 — la insignia que casi nadie tiene.</p>`}
    </div>`;
}

// ---------- Check-in diario del coach (copy variado, personalizado con datos) ----------
function coachCheckin() {
  const g = state.game;
  const abiertos = state.trades.filter(t => t.status === 'abierto').length;
  const dia = Math.floor(new Date().getTime() / 86400000);
  if (esExplorador()) {
    // Aún no arranca el reto: no hablar de "día N del camino" (evita disonancia con "EMPIEZA HOY")
    if (!state.reto.startDate) {
      const cimHechos = K.cimientos.filter(c => (g.awardedKeys || []).includes('cimiento-' + c.n)).length;
      const sinReto = [
        `Bienvenido. Tu ritmo lo pones tú: cuando te sientas listo, dale a "Empieza hoy" y arrancamos el Día 1.`,
        cimHechos > 0
          ? `Vas ${cimHechos}/5 en Cimientos — buen arranque. Cuando quieras, empezamos los 21 días juntos.`
          : `¿Nunca has invertido? Empieza por los Cimientos (abajo). Sin prisa, sin tecnicismos.`,
        `Todo gran trader empezó con una casilla en blanco. La tuya te espera cuando decidas dar el paso.`,
        `No hay reloj corriendo. Primero entiende lo básico; el reto de 21 días arranca cuando tú digas.`
      ];
      return sinReto[dia % sinReto.length];
    }
    const lec = CURRICULUM[Math.min(diasReto(), 20)];
    const quitamiedos = [
      `No necesitas saber nada todavía. Hoy solo una cosa: la lección "${lec.t}". 10 minutos y marcas tu día.`,
      `¿Sientes que todos saben más que tú? Todos empezaron aquí. Tu racha de ${g.streak} ya te separa del que solo mira videos.`,
      `Pregúntame lo que te dé pena preguntar en un grupo. Para eso estoy — sin juicios, sin apuro.`,
      `El mercado va a seguir ahí mañana, y pasado, y en 10 años. Hoy no hay prisa: hay UNA lección.`,
      `Llevas ${diasReto()} de 21 días. Exactamente donde debes estar — un paso a la vez.`,
      `Dato: los que estudian de a poco cada día llegan más lejos que los que se atragantan un fin de semana. Tú vas bien.`,
      `Aún no operas dinero real y eso es una VENTAJA: estás construyendo el hábito antes que el riesgo.`
    ];
    return quitamiedos[dia % quitamiedos.length];
  }
  const plantillas = [
    `¿Listo para el siguiente paso? Tu racha de ${g.streak} está esperando el día de hoy.`,
    `Un trade bien planeado hoy vale más que cinco improvisados. Checklist primero.`,
    `${abiertos ? `Tienes ${abiertos} posición(es) abierta(s) — revisa DTE y tu condición de invalidación.` : 'Sin posiciones abiertas: día perfecto para estudiar en la Academia o planear el próximo setup.'}`,
    `La consistencia vence al volumen. Hoy solo necesitas UN paso: marca tu día del reto.`,
    `Recuerda la regla: vender a 30-45 DTE, cerrar a 21. ¿Alguna posición cerca del umbral?`,
    `Tu disciplina es del ${disciplinaGrade().grade}. Los grandes no nacen — registran su bitácora.`,
    `${g.wager ? `🎲 Apuesta activa hasta el ${g.wager.endDate}: no la sueltes.` : `¿Confianza en tu constancia? La Apuesta de Racha paga doble.`}`,
    `Eso separa al que sueña del que vive de esto: volver hoy, aunque el mercado no dé señales.`
  ];
  return plantillas[dia % plantillas.length];
}

// Calificación de disciplina: 60% plan respetado (cerrados) + 40% checklist 7/7 (todos)
function disciplinaGrade() {
  const cerrados = state.trades.filter(t => t.status === 'cerrado');
  const conChecklist = state.trades.length;
  if (!conChecklist) {
    const dias = Object.keys(state.reto.days || {}).length;
    return dias >= 7 ? { grade: 'A', score: null } : { grade: 'EN FORMACIÓN', score: null };
  }
  const planPct = cerrados.length ? cerrados.filter(t => t.planRespetado).length / cerrados.length : 1;
  const chkPct = state.trades.filter(t => t.checklistOk).length / conChecklist;
  const score = Math.round((0.6 * planPct + 0.4 * chkPct) * 100);
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D';
  return { grade, score };
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function localDateStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function todayStr() { return localDateStr(new Date()); }
function fmtMoney(n) {
  const v = parseFloat(n);
  if (isNaN(v)) return '—';
  return (v < 0 ? '-$' : '$') + Math.abs(v).toFixed(2);
}

// ---------- Navegación ----------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('locked')) {
      toast(`🔒 Se desbloquea el día ${btn.dataset.lockedDay} del reto — vas en el día ${diasReto()}. Un paso a la vez.`);
      return;
    }
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.view = btn.dataset.view;
    render();
  });
});

function render() {
  const views = { dashboard, nuevo, bitacora, chat, liga, academia, ajustes };
  views[state.view]();
}

// ============ DASHBOARD ============
function dashboard() {
  if (esExplorador()) return dashboardExplorador();
  const cerrados = state.trades.filter(t => t.status === 'cerrado');
  const abiertos = state.trades.filter(t => t.status === 'abierto');
  const wins = cerrados.filter(t => parseFloat(t.pnl) > 0);
  const pnlTotal = cerrados.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const winRate = cerrados.length ? Math.round(wins.length / cerrados.length * 100) : null;
  const planOk = cerrados.filter(t => t.planRespetado).length;
  const disciplina = cerrados.length ? Math.round(planOk / cerrados.length * 100) : null;

  // Reto 21
  const reto = state.reto;
  const diasHechos = Object.keys(reto.days || {}).length;
  let retoHtml;
  if (!reto.startDate) {
    retoHtml = `
      <div class="empty">
        <span class="big">🚀</span>
        No necesitas más teoría. Necesitas dar el siguiente paso y volver mañana.<br>
        <button class="btn btn-green" style="margin-top:14px" onclick="startReto()">EMPIEZA HOY ›</button>
      </div>`;
  } else {
    const start = new Date(reto.startDate + 'T00:00:00');
    const hoy = todayStr();
    let cells = '';
    for (let i = 0; i < 21; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = localDateStr(d);
      const done = reto.days[ds];
      const isToday = ds === hoy;
      const isFuture = ds > hoy;
      cells += `<div class="reto-day ${done ? 'done' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}"
        ${isFuture ? '' : `onclick="toggleRetoDay('${ds}', ${!!done})"`}
        title="${ds}">
        <span>${i + 1}</span>${done ? '<span class="check">✔</span>' : ''}
      </div>`;
    }
    retoHtml = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div><b style="color:var(--green);font-size:20px">${diasHechos} / 21</b> <span style="color:var(--text-dim);font-size:13px">días completados · inicio ${reto.startDate}</span></div>
        <button class="btn btn-ghost btn-sm" onclick="resetReto()">Reiniciar reto</button>
      </div>
      <div class="reto-grid">${cells}</div>
      <p class="hint">Haz clic en el día para marcarlo como completado. Un día completado = ejecutaste tu rutina PEDEM (aunque no hayas operado).</p>`;
  }

  const ultimos = state.trades.slice(0, 3).map(t => `
    <div class="trade-card">
      <div class="trade-head">
        <span class="trade-title"><span class="ticker">${esc(t.ticker)}</span> — ${esc(t.estrategia)}</span>
        ${badgeTrade(t)}
      </div>
      <div class="trade-meta"><span>📅 ${esc(t.fecha)}</span><span>🎯 ${esc(t.strikes || '')}</span></div>
    </div>`).join('') || `<div class="empty"><span class="big">📓</span>Aún no hay trades en la bitácora.<br>Registra el primero con el flujo PEDEM.</div>`;

  // Racha / XP / Escudos / Apuesta
  const g = state.game;
  const grade = disciplinaGrade();
  const w = g.wager;
  let wagerHtml;
  if (w) {
    const diasRestantes = Math.max(0, Math.round((new Date(w.endDate + 'T00:00:00') - new Date(todayStr() + 'T00:00:00')) / 86400000));
    wagerHtml = `<div class="wager-box active">🎲 <b>Apuesta activa:</b> ${w.amount} XP a que no pierdes tu racha hasta el <b>${w.endDate}</b> (${diasRestantes} días). Premio: <b>${w.amount * 2} XP</b>.</div>`;
  } else {
    const lastMsg = g.lastWager
      ? (g.lastWager.status === 'won'
        ? `<span class="ok-msg">Última apuesta: GANADA 🏆 +${g.lastWager.amount * 2} XP</span>`
        : `<span class="error-msg">Última apuesta: perdida. La racha se recupera un día a la vez.</span>`)
      : '';
    const dR = diasReto();
    const hito = dR >= 14 && dR < 21
      ? '<div class="wager-box hito">🎯 <b>HITO DÍA 14:</b> segunda Apuesta de Racha — el tramo final se corre con la ciencia del fresh start a tu favor.</div>'
      : dR >= 7 && dR < 14
        ? '<div class="wager-box hito">🎯 <b>HITO DÍA 7:</b> sobreviviste la semana crítica. Es el momento exacto para tu Apuesta de Racha (el mecanismo que a Duolingo le dio +14% de retención).</div>'
        : '';
    wagerHtml = `${hito}
      <button class="btn btn-sm" onclick="apostarRacha()" ${g.xp < g.apuestaMonto ? 'disabled' : ''}>🎲 Apostar ${g.apuestaMonto} XP → ganar ${g.apuestaMonto * 2}</button>
      <span class="hint" style="margin-left:8px">${lastMsg || 'Apuesta a que mantienes tu racha 7 días. Loss aversion a tu favor.'}</span>`;
  }

  const streakHtml = `
    <div class="card streak-card">
      <div class="streak-row">
        <div class="streak-fire">🔥<span class="streak-num">${g.streak}</span></div>
        <div class="streak-info">
          <b>Racha de disciplina</b>
          <span class="hint">${g.activeToday ? '✅ Hoy ya sumaste. Vuelve mañana.' : '⚠️ Hoy aún no registras actividad — marca tu día del reto o registra un trade.'}<br>
          Los fines de semana no rompen la racha. XP por proceso: trade +50 · checklist 7/7 +20 · cierre con lección +30 · día del reto +10.</span>
        </div>
        <div class="streak-side">
          <div class="xp-pill">⚡ ${g.xp} XP</div>
          <div class="escudo-row">🛡 ${g.escudos}/${g.escudoMax}
            <button class="btn btn-ghost btn-sm" onclick="comprarEscudo()" ${g.xp < g.escudoCosto || g.escudos >= g.escudoMax ? 'disabled' : ''}>Comprar escudo (${g.escudoCosto} XP)</button>
          </div>
        </div>
      </div>
      <div style="margin-top:12px">${wagerHtml}</div>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-green" onclick="abrirShareCard()">📸 COMPARTIR MI PROGRESO</button>
        <span class="hint">Genera tu card del Reto 21 para WhatsApp / Instagram Stories — muestra disciplina, nunca P&amp;L.</span>
      </div>
    </div>`;

  // Check-in del coach + Mental Edge semanal
  const me = g.mentalEdge;
  const meHtml = `
    <div class="card">
      <h3>🧠 Mental Edge — el resumen semanal de Geny</h3>
      ${me ? `
        <div class="me-score">Score <b>${me.score}</b>/100 <span class="hint">· semana ${esc(me.week)}</span></div>
        <p class="me-text">${esc(me.text)}</p>` : `<p class="hint">Genera tu primer resumen semanal: Geny analiza tu bitácora, racha y disciplina de los últimos 7 días.</p>`}
      <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="generarMentalEdge(this)">${me ? '🔄 Regenerar' : '🧠 Generar mi Mental Edge'}</button>
    </div>`;

  main.innerHTML = `
    <h1>RETO <span class="accent">21</span> — DASHBOARD</h1>
    <p class="subtitle">Eso separa al que sueña del que vive de esto.</p>
    <div class="checkin-card">💬 <b>Geny:</b> ${esc(coachCheckin())}</div>
    ${streakHtml}
    <div class="stats-grid">
      <div class="stat"><div class="num neutral">${state.trades.length}</div><div class="label">Trades totales</div></div>
      <div class="stat"><div class="num neutral">${abiertos.length}</div><div class="label">Abiertos</div></div>
      <div class="stat"><div class="num ${winRate === null ? 'neutral' : winRate >= 50 ? '' : 'neg'}">${winRate === null ? '—' : winRate + '%'}</div><div class="label">Win rate</div></div>
      <div class="stat"><div class="num ${pnlTotal >= 0 ? '' : 'neg'}">${fmtMoney(pnlTotal)}</div><div class="label">P&amp;L acumulado</div></div>
      <div class="stat"><div class="num ${disciplina === null ? 'neutral' : disciplina >= 80 ? '' : 'neg'}">${disciplina === null ? '—' : disciplina + '%'}</div><div class="label">Disciplina (plan respetado)</div></div>
    </div>
    <div class="card"><h3>🔥 Reto 21 — un paso cada día</h3>${retoHtml}</div>
    ${caminoHtml()}
    ${meHtml}
    <div class="card"><h3>📌 Últimos trades</h3>${ultimos}</div>
  `;
}

window.generarMentalEdge = async (btn) => {
  btn.disabled = true; btn.textContent = 'Geny está analizando tu semana…';
  try {
    await fetch('/api/mental-edge', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    state.game = await api('/game');
    render();
    toast('🧠 Mental Edge actualizado.');
  } catch {
    btn.disabled = false; btn.textContent = '🧠 Generar mi Mental Edge';
    toast('Error generando el resumen. Intenta de nuevo.');
  }
};

// Dashboard simplificado para el Explorador: racha + lección del día + reto. Nada más.
function dashboardExplorador() {
  const g = state.game;
  const reto = state.reto;
  const dias = diasReto();
  const lec = CURRICULUM[Math.min(dias, 20)];
  const diaLeccion = Math.min(dias + 1, 21);

  let retoHtml;
  if (!reto.startDate) {
    retoHtml = `
      <div class="empty">
        <span class="big">🌱</span>
        21 días. Una lección al día. Cero prisa.<br>
        <button class="btn btn-green" style="margin-top:14px" onclick="startReto()">EMPIEZA HOY ›</button>
      </div>`;
  } else {
    const start = new Date(reto.startDate + 'T00:00:00');
    const hoy = todayStr();
    let cells = '';
    for (let i = 0; i < 21; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = localDateStr(d);
      const done = reto.days[ds];
      cells += `<div class="reto-day ${done ? 'done' : ''} ${ds === hoy ? 'today' : ''} ${ds > hoy ? 'future' : ''}"
        ${ds > hoy ? '' : `onclick="toggleRetoDay('${ds}', ${!!done})"`} title="${ds}${done?.note ? ' — ' + esc(done.note) : ''}">
        <span>${i + 1}</span>${done ? '<span class="check">✔</span>' : ''}
      </div>`;
    }
    retoHtml = `
      <div><b style="color:var(--green);font-size:20px">${dias} / 21</b> <span style="color:var(--text-dim);font-size:13px">días · al marcar tu día te pregunto qué aprendiste (tu diario)</span></div>
      <div class="reto-grid">${cells}</div>`;
  }

  const notas = Object.entries(reto.days || {}).filter(([, v]) => v.note).sort((a, b) => b[0] < a[0] ? -1 : 1).slice(0, 3);
  const diarioHtml = notas.length
    ? notas.map(([d, v]) => `<div class="glosario-item">📅 <b>${esc(d)}</b> — ${esc(v.note)}</div>`).join('')
    : '<p class="hint">Tus aprendizajes aparecerán aquí cada día que marques.</p>';

  const cimHechos = K.cimientos.filter(c => (state.game.awardedKeys || []).includes('cimiento-' + c.n)).length;
  const cimTotal = K.cimientos.length;
  const cimientosHtml = cimHechos < cimTotal ? `
    <div class="card leccion-card" style="border-color:rgba(0,229,255,.4)">
      <h3 style="color:var(--cyan)">🌱 ¿Nunca has invertido? Empieza por aquí</h3>
      <p style="font-size:14px;color:var(--text-dim);line-height:1.6;margin:6px 0 12px">Antes del Día 1, 5 lecciones cortas de cero absoluto: qué es una acción, el mercado, una opción, un broker y el riesgo. Sin tecnicismos. (${cimHechos}/${cimTotal} listas)</p>
      <button class="btn btn-sm" style="background:linear-gradient(135deg,var(--cyan),var(--green-dark))" onclick="irALeccion('cimientos')">Ver Cimientos ›</button>
    </div>` : '';

  main.innerHTML = `
    <h1>RETO <span class="accent">21</span> — TU CAMINO</h1>
    <p class="subtitle">🌱 Modo Explorador · Una lección al día. Eso es todo lo que se te pide.</p>
    <div class="checkin-card">💬 <b>Geny:</b> ${esc(coachCheckin())}</div>
    ${cimientosHtml}
    <div class="card leccion-card">
      <h3>📖 Lección del día ${diaLeccion}</h3>
      <div class="leccion-titulo">${esc(lec.t)}</div>
      <p style="font-size:14px;color:var(--text-dim);line-height:1.6;margin:8px 0 14px">${esc(lec.d)}</p>
      <button class="btn btn-green btn-sm" onclick="irALeccion('${lec.tab}')">Ir a la lección ›</button>
      <span class="hint" style="margin-left:10px">Al terminar, marca tu día en el reto 👇</span>
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <h3 style="margin:0">🔥 Racha: ${g.streak} · ⚡ ${g.xp} XP</h3>
        <button class="btn btn-sm" onclick="abrirShareCard()">📸 Compartir mi progreso</button>
      </div>
      ${retoHtml}
      ${apuestaExploradorHtml()}
    </div>
    ${caminoHtml()}
    <div class="card">
      <h3>📓 Tu diario de aprendizaje</h3>
      ${diarioHtml}
    </div>
    <div class="card">
      <h3>🔓 Lo que viene en tu camino</h3>
      ${UNLOCKS.map(u => `<div class="check-item ${diasReto() >= u.dia ? 'checked' : ''}" style="cursor:default">
        ${diasReto() >= u.dia ? '✅' : '🔒'} <span>${u.label} <span class="hint">— día ${u.dia}</span></span>
      </div>`).join('')}
      <p class="hint">Cada herramienta se gana con constancia, no con prisa. ¿Ya te sientes listo para todo? Cambia a Modo Operador en ⚙️ Ajustes.</p>
    </div>
  `;
}

// Apuesta de Racha en el dashboard Explorador (desbloqueada el día 7)
function apuestaExploradorHtml() {
  if (!unlocked('apuesta')) return '';
  const g = state.game;
  if (g.wager) {
    return `<div class="wager-box active" style="margin-top:14px">🎲 <b>Apuesta activa:</b> ${g.wager.amount} XP a que no pierdes tu racha hasta el <b>${esc(g.wager.endDate)}</b>. Premio: <b>${g.wager.amount * 2} XP</b>.</div>`;
  }
  const dR = diasReto();
  const hito = dR >= 14 && dR < 21
    ? '🎯 <b>HITO DÍA 14:</b> segunda Apuesta de Racha — tramo final con el fresh start a tu favor.'
    : '🎯 <b>HITO DÍA 7:</b> sobreviviste la semana crítica. Momento exacto para tu primera Apuesta de Racha.';
  return `
    <div class="wager-box hito" style="margin-top:14px">${hito}</div>
    <button class="btn btn-sm" style="margin-top:8px" onclick="apostarRacha()" ${g.xp < g.apuestaMonto ? 'disabled' : ''}>🎲 Apostar ${g.apuestaMonto} XP → ganar ${g.apuestaMonto * 2}</button>
    ${g.xp < g.apuestaMonto ? `<span class="hint" style="margin-left:8px">Necesitas ${g.apuestaMonto} XP (tienes ${g.xp}). Cada lección y día del reto suman.</span>` : ''}`;
}

window.irALeccion = (tab) => {
  academiaTab = tab;
  document.querySelector('[data-view="academia"]').click();
};

window.startReto = async () => {
  state.reto = await api('/reto21', { method: 'POST', body: JSON.stringify({ action: 'start', date: todayStr() }) });
  render();
};
window.resetReto = async () => {
  if (!confirm('¿Reiniciar el Reto 21? Se borran los días del reto. Tu XP, racha e insignias se conservan.')) return;
  state.reto = await api('/reto21', { method: 'POST', body: JSON.stringify({ action: 'reset' }) });
  render();
};

// Modal con estilo para la nota del diario (reemplaza el prompt() nativo)
function pedirNotaDiario() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:440px">
        <h3>🌱 ¿Qué aprendiste hoy?</h3>
        <p class="hint" style="margin-bottom:10px">Una línea para tu diario de aprendizaje (opcional).</p>
        <textarea id="nota-diario" placeholder="Ej: entendí que una opción es como apartar un apartamento…" style="min-height:80px"></textarea>
        <div class="modal-actions">
          <button class="btn btn-green btn-sm" id="nota-guardar">Guardar mi día ✔</button>
          <button class="btn btn-ghost btn-sm" id="nota-skip">Saltar</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const finish = v => { overlay.remove(); resolve(v); };
    overlay.querySelector('#nota-guardar').onclick = () => finish(document.getElementById('nota-diario').value.trim());
    overlay.querySelector('#nota-skip').onclick = () => finish('');
    overlay.addEventListener('click', e => { if (e.target === overlay) finish(''); });
    setTimeout(() => document.getElementById('nota-diario')?.focus(), 50);
  });
}

window.toggleRetoDay = async (ds, done) => {
  let note = '';
  if (!done && esExplorador()) {
    note = await pedirNotaDiario();
  }
  state.reto = await api('/reto21', { method: 'POST', body: JSON.stringify({ action: done ? 'uncheck' : 'check', date: ds, note }) });
  if (!done) await award(10, 'reto-' + ds, 'Día del reto completado');
  checkUnlocks();
  render();
};

window.comprarEscudo = async () => {
  const r = await fetch('/api/game/escudo', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await r.json();
  if (r.ok) { state.game = data; toast('🛡 Escudo PEDEM comprado. Te cubre un día hábil sin actividad.'); render(); }
  else toast(data.error === 'max_escudos' ? 'Ya tienes el máximo de escudos.' : 'XP insuficiente.');
};

window.apostarRacha = async () => {
  if (!confirm(`¿Apostar ${state.game.apuestaMonto} XP a que mantienes tu racha 7 días? Si ganas recibes ${state.game.apuestaMonto * 2} XP.`)) return;
  const r = await fetch('/api/game/wager', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await r.json();
  if (r.ok) { state.game = data; toast('🎲 Apuesta activa. No pierdas tu racha 7 días. ¡Vamos!'); render(); }
  else toast(data.error === 'apuesta_activa' ? 'Ya tienes una apuesta activa.' : 'XP insuficiente.');
};

// ---------- Share card (estilo Wordle: proceso visible, P&L nunca) ----------
function shareCardData() {
  const reto = state.reto;
  const hoy = todayStr();
  const dias = [];
  let diaActual = 0;
  if (reto.startDate) {
    const start = new Date(reto.startDate + 'T00:00:00');
    for (let i = 0; i < 21; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = localDateStr(d);
      const estado = reto.days?.[ds] ? 'done' : (ds > hoy ? 'future' : 'missed');
      if (ds <= hoy) diaActual = i + 1;
      dias.push(estado);
    }
  } else {
    for (let i = 0; i < 21; i++) dias.push('future');
  }
  const hechos = dias.filter(d => d === 'done').length;
  return { dias, diaActual: Math.min(diaActual, 21), hechos, grade: disciplinaGrade(), streak: state.game.streak, xp: state.game.xp };
}

function drawShareCard(canvas) {
  const d = shareCardData();
  const W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fondo negro con glow
  ctx.fillStyle = '#050a07';
  ctx.fillRect(0, 0, W, H);
  let grd = ctx.createRadialGradient(W * 0.85, H * 0.15, 50, W * 0.85, H * 0.15, 700);
  grd.addColorStop(0, 'rgba(230,0,122,0.18)'); grd.addColorStop(1, 'rgba(230,0,122,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  grd = ctx.createRadialGradient(W * 0.15, H * 0.9, 50, W * 0.15, H * 0.9, 800);
  grd.addColorStop(0, 'rgba(0,230,118,0.15)'); grd.addColorStop(1, 'rgba(0,230,118,0)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = '#00e5ff';
  ctx.font = '900 40px Segoe UI, Arial';
  ctx.textAlign = 'left';
  ctx.fillText('R E T O   2 1', 80, 120);
  ctx.fillStyle = '#00e676';
  ctx.fillRect(80, 140, 220, 4);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 96px Segoe UI, Arial';
  ctx.fillText(`DÍA ${d.diaActual}/21`, 80, 260);

  // Grid 7x3 de días
  const cell = 118, gap = 18, gx = 80, gy = 330;
  d.dias.forEach((estado, i) => {
    const x = gx + (i % 7) * (cell + gap);
    const y = gy + Math.floor(i / 7) * (cell + gap);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, cell, cell, 20); else ctx.rect(x, y, cell, cell);
    if (estado === 'done') {
      ctx.fillStyle = 'rgba(0,230,118,0.85)';
      ctx.shadowColor = '#00e676'; ctx.shadowBlur = 22;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#00160a';
      ctx.font = '900 54px Segoe UI, Arial';
      ctx.textAlign = 'center';
      ctx.fillText('✓', x + cell / 2, y + cell / 2 + 20);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = estado === 'missed' ? 'rgba(255,82,82,0.10)' : 'rgba(14,24,17,0.9)';
      ctx.fill();
      ctx.strokeStyle = estado === 'missed' ? 'rgba(255,82,82,0.4)' : '#1a2b1f';
      ctx.lineWidth = 3; ctx.stroke();
    }
  });

  // Métricas de proceso (nunca P&L) — con auto-ajuste de tamaño para que ningún valor se monte sobre el otro
  const my = gy + 3 * (cell + gap) + 90;
  ctx.fillStyle = '#7fa38c'; ctx.font = '700 34px Segoe UI, Arial';
  ctx.fillText('DISCIPLINA', 80, my);
  ctx.fillText('RACHA', 520, my);
  ctx.fillText('XP', 800, my);
  const fitFont = (txt, base, maxW) => {
    let s = base;
    ctx.font = `900 ${s}px Segoe UI, Arial`;
    while (ctx.measureText(txt).width > maxW && s > 28) { s -= 3; ctx.font = `900 ${s}px Segoe UI, Arial`; }
  };
  // "EN FORMACIÓN" es muy largo para el hueco de la card → versión corta
  const gradeCard = d.grade.grade === 'EN FORMACIÓN' ? 'NUEVO' : d.grade.grade;
  ctx.fillStyle = '#00e676'; fitFont(gradeCard, 92, 400); ctx.fillText(gradeCard, 80, my + 95);
  ctx.fillStyle = '#ffffff'; fitFont(`${d.streak}🔥`, 92, 250); ctx.fillText(`${d.streak}🔥`, 520, my + 95);
  ctx.fillStyle = '#00e5ff'; fitFont(`${d.xp}`, 92, 260); ctx.fillText(`${d.xp}`, 800, my + 95);

  // Frase + marca
  ctx.fillStyle = '#e8f5ec'; ctx.font = 'italic 400 36px Segoe UI, Arial';
  ctx.fillText('"Eso separa al que sueña del que vive de esto."', 80, H - 170);
  ctx.fillStyle = '#00e676'; ctx.font = '900 40px Segoe UI, Arial';
  ctx.fillText('GENY · TU MENTOR IA', 80, H - 90);
  ctx.fillStyle = '#7fa38c'; ctx.font = '700 30px Segoe UI, Arial';
  ctx.fillText('· INGRESARIOS', 560, H - 90);
}

function shareCardTexto() {
  const d = shareCardData();
  const filas = [];
  for (let f = 0; f < 3; f++) {
    filas.push(d.dias.slice(f * 7, f * 7 + 7).map(e => e === 'done' ? '🟩' : e === 'missed' ? '🟥' : '⬛').join(''));
  }
  return `🎯 RETO 21 — Día ${d.diaActual}/21\n${filas.join('\n')}\nDisciplina: ${d.grade.grade} · Racha: ${d.streak} 🔥\n#Reto21 #PEDEM`;
}

window.abrirShareCard = () => {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>📸 Tu card del Reto 21</h3>
      <canvas id="share-canvas" class="share-canvas"></canvas>
      <div class="modal-actions">
        <button class="btn btn-green btn-sm" onclick="descargarCard()">⬇ Descargar imagen</button>
        <button class="btn btn-sm" onclick="copiarCardTexto()">📋 Copiar para WhatsApp</button>
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
      </div>
      <p class="hint">La card muestra tu proceso y disciplina — nunca tu P&amp;L. Compártela en WhatsApp Status o Instagram Stories.</p>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  drawShareCard(document.getElementById('share-canvas'));
};

function trackShare() {
  fetch('/api/game/share', { method: 'POST', headers: { 'Content-Type': 'application/json' } }).catch(() => {});
}

window.descargarCard = () => {
  const canvas = document.getElementById('share-canvas');
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `reto21-dia${shareCardData().diaActual}.png`;
    a.click();
    trackShare();
    toast('⬇ Imagen descargada. ¡Súbela a tu Status o Stories!');
  }, 'image/png');
};

window.copiarCardTexto = async () => {
  await navigator.clipboard.writeText(shareCardTexto());
  trackShare();
  toast('📋 Copiado. Pégalo en WhatsApp con la imagen.');
};

function badgeTrade(t) {
  if (t.status === 'abierto') return '<span class="badge abierto">ABIERTO</span>';
  const pnl = parseFloat(t.pnl) || 0;
  return pnl >= 0
    ? `<span class="badge win">WIN ${fmtMoney(pnl)}</span>`
    : `<span class="badge loss">LOSS ${fmtMoney(pnl)}</span>`;
}

// ============ NUEVO TRADE (flujo PEDEM) ============
function nuevo() {
  const simple = esExplorador();
  const opciones = K.estrategiasLista.map(e => `<option>${e}</option>`).join('');
  const items = simple
    ? ['¿Definiste tu riesgo máximo en dólares?', '¿Puedes explicar en UNA frase por qué entras?', '¿El riesgo es menos del 5% de tu capital?']
    : K.checklistPreTrade;
  const checklist = items.map((c, i) => `
    <label class="check-item" id="chk-wrap-${i}">
      <input type="checkbox" class="pre-chk" data-i="${i}" onchange="updateSemaforo(this)"> ${esc(c)}
    </label>`).join('');
  const n = items.length;

  const abrirAvanzado = simple
    ? `<details class="adv-details"><summary>➕ Campos avanzados (opcional — se aprenden en el camino)</summary><div class="form-grid" style="margin-top:14px">`
    : '';
  const cerrarAvanzado = simple ? `</div></details>` : '';

  main.innerHTML = `
    <h1>NUEVO TRADE — <span class="accent">PLANEAR ANTES DE EJECUTAR</span></h1>
    <p class="subtitle">${simple
      ? '🌱 Modo simple: 5 datos y listo. Puedes registrar trades de práctica (paper trading) — el hábito vale igual.'
      : 'El flujo PEDEM empieza en papel: Planear → Ejecutar → Documentar. (Evaluar y Mejorar llegan al cerrar el trade.)'}</p>

    <div class="card">
      <h3>✅ Checklist pre-trade${simple ? ' (versión Explorador)' : ' INGRESARIOS'}</h3>
      ${checklist}
      <div id="semaforo" class="semaforo rojo">🔴 0/${n} — Aún no estás listo para ejecutar. Completa el checklist.</div>
    </div>

    <div class="card">
      <h3>📋 P — Planear</h3>
      <div class="form-grid">${simple ? `
        <label class="field">Fecha de entrada<input type="date" id="f-fecha" value="${todayStr()}"></label>
        <label class="field">Ticker / Subyacente<input id="f-ticker" placeholder="SPY, AAPL, NVDA…" style="text-transform:uppercase"></label>
        <label class="field">Estrategia<select id="f-estrategia">${opciones}</select></label>
        <label class="field">Riesgo máximo ($)<input type="number" step="0.01" id="f-riesgo" placeholder="¿Cuánto es lo máximo que puedes perder?"></label>
        <label class="field full">¿Por qué entras a este trade? (una frase honesta)<textarea id="f-tesis" placeholder="Ej: AAPL está lateral y quiero practicar mi primer covered call en papel…"></textarea></label>
      </div>
      ${abrirAvanzado}` : ''}
        ${simple ? '' : `
        <label class="field">Fecha de entrada<input type="date" id="f-fecha" value="${todayStr()}"></label>
        <label class="field">Ticker / Subyacente<input id="f-ticker" placeholder="SPY, AAPL, NVDA…" style="text-transform:uppercase"></label>
        <label class="field">Estrategia<select id="f-estrategia">${opciones}</select></label>`}
        <label class="field">Strikes / Expiración<input id="f-strikes" placeholder="480P/475P + 520C/525C · 19 jul"></label>
        <label class="field">Tesis de mercado<select id="f-tesisTipo"><option>Direccional alcista</option><option>Direccional bajista</option><option>Neutral / lateral</option><option>Volatilidad (evento)</option></select></label>
        <label class="field">IV Rank al entrar (%)<input type="number" id="f-ivrank" placeholder="65" min="0" max="100"></label>
        <label class="field">Crédito recibido / Débito pagado ($)<input type="number" step="0.01" id="f-costo" placeholder="2.30 (usa negativo si es débito)"></label>
        ${simple ? '' : `<label class="field">Riesgo máximo ($)<input type="number" step="0.01" id="f-riesgo" placeholder="270"></label>`}
        <label class="field">Objetivo de ganancia ($)<input type="number" step="0.01" id="f-objetivo" placeholder="115 (50% del crédito)"></label>
        <label class="field">Señal Geny Trend<select id="f-geny"><option>alcista</option><option>bajista</option><option>neutral</option></select></label>
        ${simple ? '' : `<label class="field full">Tesis del trade (¿por qué este trade, ahora?)<textarea id="f-tesis" placeholder="SPY lateral entre 480-520, IV Rank 65% justifica vender volatilidad…"></textarea></label>`}
        <label class="field full">Condición de invalidación (¿qué te saca del trade?)<textarea id="f-invalidacion" placeholder="Cierre diario fuera del rango 482-522, o pérdida de 2x el crédito…"></textarea></label>
        ${simple ? `
        <label class="field">Reditum Sniper confirmó la entrada<select id="f-sniper"><option value="1">Sí</option><option value="0">No</option></select></label>
        <label class="field">Tipo de orden<select id="f-orden"><option>Limit — legs simultáneos</option><option>Limit — legs escalados</option><option>Market</option></select></label>
        <label class="field">Delta (Δ)<input type="number" step="0.01" id="f-delta" placeholder="0.05"></label>
        <label class="field">Gamma (Γ)<input type="number" step="0.01" id="f-gamma" placeholder="-0.02"></label>
        <label class="field">Theta (Θ)<input type="number" step="0.01" id="f-theta" placeholder="0.12"></label>
        <label class="field">Vega (ν)<input type="number" step="0.01" id="f-vega" placeholder="-0.30"></label>
        <label class="field full">Notas de documentación<textarea id="f-notas" placeholder="Screenshot guardado, contexto del mercado…"></textarea></label>` : ''}
      ${cerrarAvanzado}
      ${simple ? '' : '</div>'}
    </div>

    ${simple ? `
    <div class="card">
      <div style="margin-top:4px">
        <button class="btn btn-green" onclick="guardarTrade()">💾 REGISTRAR EN BITÁCORA</button>
        <span id="guardar-msg" style="margin-left:12px"></span>
      </div>
    </div>` : `
    <div class="card">
      <h3>⚡ E — Ejecutar &nbsp;·&nbsp; 📸 D — Documentar</h3>
      <div class="form-grid">
        <label class="field">Reditum Sniper confirmó la entrada<select id="f-sniper"><option value="1">Sí</option><option value="0">No</option></select></label>
        <label class="field">Tipo de orden<select id="f-orden"><option>Limit — legs simultáneos</option><option>Limit — legs escalados</option><option>Market</option></select></label>
        <label class="field">Delta (Δ)<input type="number" step="0.01" id="f-delta" placeholder="0.05"></label>
        <label class="field">Gamma (Γ)<input type="number" step="0.01" id="f-gamma" placeholder="-0.02"></label>
        <label class="field">Theta (Θ)<input type="number" step="0.01" id="f-theta" placeholder="0.12"></label>
        <label class="field">Vega (ν)<input type="number" step="0.01" id="f-vega" placeholder="-0.30"></label>
        <label class="field full">Notas de documentación (cadena de opciones, screenshots, contexto)<textarea id="f-notas" placeholder="Screenshot guardado. OI alto en strikes cortos. Spread bid-ask 3%…"></textarea></label>
      </div>
      <div style="margin-top:18px">
        <button class="btn btn-green" onclick="guardarTrade()">💾 REGISTRAR EN BITÁCORA</button>
        <span id="guardar-msg" style="margin-left:12px"></span>
      </div>
    </div>`}
  `;
}

window.updateSemaforo = () => {
  const boxes = [...document.querySelectorAll('.pre-chk')];
  boxes.forEach(b => b.closest('.check-item').classList.toggle('checked', b.checked));
  const n = boxes.filter(b => b.checked).length;
  const sem = $('#semaforo');
  if (n === boxes.length) {
    sem.className = 'semaforo verde';
    sem.textContent = `🟢 ${n}/${boxes.length} — Checklist completo. Luz verde para ejecutar según el plan.`;
  } else {
    sem.className = 'semaforo rojo';
    sem.textContent = `🔴 ${n}/${boxes.length} — Aún no estás listo para ejecutar. Completa el checklist.`;
  }
};

window.guardarTrade = async () => {
  const v = id => $(id).value.trim();
  const ticker = v('#f-ticker').toUpperCase();
  const msg = $('#guardar-msg');
  if (!ticker) { msg.className = 'error-msg'; msg.textContent = 'Falta el ticker.'; return; }
  const checks = [...document.querySelectorAll('.pre-chk')].map(b => b.checked);
  const t = {
    fecha: v('#f-fecha'), ticker, estrategia: v('#f-estrategia'),
    strikes: v('#f-strikes'), tesisTipo: v('#f-tesisTipo'),
    ivRank: v('#f-ivrank'), costo: v('#f-costo'), riesgoMax: v('#f-riesgo'),
    objetivo: v('#f-objetivo'), genyTrend: v('#f-geny'),
    tesis: v('#f-tesis'), invalidacion: v('#f-invalidacion'),
    sniper: v('#f-sniper') === '1', orden: v('#f-orden'),
    greeks: { delta: v('#f-delta'), gamma: v('#f-gamma'), theta: v('#f-theta'), vega: v('#f-vega') },
    notas: v('#f-notas'),
    checklist: checks, checklistOk: checks.every(Boolean),
    status: 'abierto'
  };
  const saved = await api('/trades', { method: 'POST', body: JSON.stringify(t) });
  state.trades.unshift(saved);
  await award(50, 'trade-' + saved.id, 'Trade planeado y registrado');
  if (t.checklistOk) await award(20, 'chk-' + saved.id, 'Checklist pre-trade 7/7');
  msg.className = 'ok-msg';
  msg.textContent = '✔ Trade registrado en la bitácora.';
  setTimeout(() => { document.querySelector('[data-view="bitacora"]').click(); }, 800);
};

// ============ BITÁCORA ============
function bitacora() {
  // Diario de aprendizaje (Explorador): las notas del reto son la primera bitácora
  let diarioHtml = '';
  if (esExplorador()) {
    const notas = Object.entries(state.reto.days || {}).filter(([, v]) => v.note)
      .sort((a, b) => b[0] < a[0] ? -1 : 1);
    diarioHtml = `
      <div class="card">
        <h3>🌱 Diario de aprendizaje</h3>
        ${notas.length
          ? notas.map(([d, v]) => `<div class="glosario-item">📅 <b>${esc(d)}</b> — ${esc(v.note)}</div>`).join('')
          : '<p class="hint">Cada día que marques en el reto, tu aprendizaje queda aquí. Así se documenta un trader.</p>'}
      </div>`;
  }

  if (!state.trades.length) {
    main.innerHTML = `<h1>BITÁCORA <span class="accent">PEDEM</span></h1>
      <p class="subtitle">Lo que no se documenta, no se puede mejorar.</p>
      ${diarioHtml}
      <div class="card"><div class="empty"><span class="big">📓</span>${esExplorador() && !unlocked('trades')
        ? `La bitácora de trades se desbloquea el día 7 del reto — vas en el día ${diasReto()}.<br>Por ahora, tu diario de arriba ES tu bitácora.`
        : 'Bitácora de trades vacía.<br>Registra tu primer trade desde <b>🎯 Nuevo Trade</b>.'}</div></div>`;
    return;
  }
  const cards = state.trades.map(t => {
    const g = t.greeks || {};
    const detalle = `
      <div class="trade-detail" id="det-${t.id}" style="display:none">
        <b>Tesis (${esc(t.tesisTipo || '')}):</b> ${esc(t.tesis || '—')}<br>
        <b>Invalidación:</b> ${esc(t.invalidacion || '—')}<br>
        <b>IV Rank:</b> ${esc(t.ivRank || '—')}% · <b>Crédito/Débito:</b> ${esc(t.costo || '—')} · <b>Riesgo máx:</b> ${fmtMoney(t.riesgoMax)} · <b>Objetivo:</b> ${fmtMoney(t.objetivo)}<br>
        <b>Greeks:</b> Δ ${esc(g.delta || '—')} · Γ ${esc(g.gamma || '—')} · Θ ${esc(g.theta || '—')} · ν ${esc(g.vega || '—')}<br>
        <b>Geny Trend:</b> ${esc(t.genyTrend || '—')} · <b>Sniper:</b> ${t.sniper ? 'confirmado ✔' : 'no confirmado ✘'} · <b>Checklist:</b> ${t.checklistOk ? '7/7 🟢' : 'incompleto 🔴'}<br>
        <b>Orden:</b> ${esc(t.orden || '—')}<br>
        ${t.notas ? `<b>Notas:</b> ${esc(t.notas)}<br>` : ''}
        ${t.status === 'cerrado' ? `
          <hr style="border-color:var(--border);margin:8px 0">
          <b>EVALUAR:</b> P&amp;L ${fmtMoney(t.pnl)} · Plan respetado: ${t.planRespetado ? 'sí ✔' : 'no ✘'}<br>
          <b>MEJORAR (lección):</b> ${esc(t.leccion || '—')}
        ` : ''}
        <div class="trade-actions">
          ${t.status === 'abierto' ? `<button class="btn btn-green btn-sm" onclick="cerrarTradeUI('${t.id}')">✅ Cerrar trade (Evaluar + Mejorar)</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="borrarTrade('${t.id}')">🗑 Eliminar</button>
        </div>
        <div id="cerrar-${t.id}"></div>
      </div>`;
    return `
      <div class="trade-card">
        <div class="trade-head" style="cursor:pointer" onclick="toggleDet('${t.id}')">
          <span class="trade-title"><span class="ticker">${esc(t.ticker)}</span> — ${esc(t.estrategia)}</span>
          <span>${badgeTrade(t)}</span>
        </div>
        <div class="trade-meta">
          <span>📅 ${esc(t.fecha)}</span>
          <span>🎯 ${esc(t.strikes || '')}</span>
          <span>Geny: ${esc(t.genyTrend || '—')}</span>
          <span>${t.checklistOk ? '🟢 checklist 7/7' : '🔴 checklist incompleto'}</span>
        </div>
        ${detalle}
      </div>`;
  }).join('');

  main.innerHTML = `
    <h1>BITÁCORA <span class="accent">PEDEM</span></h1>
    <p class="subtitle">Lo que no se documenta, no se puede mejorar. Haz clic en un trade para ver el detalle.</p>
    ${diarioHtml}
    ${cards}`;
}

window.toggleDet = id => {
  const el = $('#det-' + id);
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.cerrarTradeUI = id => {
  $('#cerrar-' + id).innerHTML = `
    <div class="card" style="margin-top:12px">
      <h3>Evaluar + Mejorar</h3>
      <div class="form-grid">
        <label class="field">P&amp;L final ($, negativo si pérdida)<input type="number" step="0.01" id="c-pnl-${id}"></label>
        <label class="field">¿Se respetó el plan?<select id="c-plan-${id}"><option value="1">Sí</option><option value="0">No</option></select></label>
        <label class="field full">Lección / mejora para el siguiente trade<textarea id="c-leccion-${id}" placeholder="Cerré tarde: la próxima cierro al 50% del crédito sin dudar…"></textarea></label>
      </div>
      <button class="btn btn-green btn-sm" style="margin-top:12px" onclick="cerrarTrade('${id}')">Guardar cierre</button>
    </div>`;
};

window.cerrarTrade = async id => {
  const upd = {
    status: 'cerrado',
    pnl: $(`#c-pnl-${id}`).value,
    planRespetado: $(`#c-plan-${id}`).value === '1',
    leccion: $(`#c-leccion-${id}`).value.trim(),
    closedAt: new Date().toISOString()
  };
  const saved = await api('/trades/' + id, { method: 'PUT', body: JSON.stringify(upd) });
  const i = state.trades.findIndex(t => t.id === id);
  state.trades[i] = saved;
  await award(30, 'close-' + id, 'Trade cerrado con Evaluar + Mejorar');
  render();
};

window.borrarTrade = async id => {
  if (!confirm('¿Eliminar este trade de la bitácora?')) return;
  await api('/trades/' + id, { method: 'DELETE' });
  state.trades = state.trades.filter(t => t.id !== id);
  render();
};

// ============ CHAT AI ============
function chat() {
  const msgs = state.chat.map(m => m.role === 'user'
    ? `<div class="msg user">${esc(m.content)}</div>`
    : `<div class="msg ai"><div class="msg-label">GENY</div>${esc(m.content)}</div>`
  ).join('');

  main.innerHTML = `
    <h1>GENY — <span class="accent">TU MENTOR IA</span></h1>
    <p class="subtitle">Tu mentor de opciones con el método PEDEM. Conoce tu bitácora si activas la casilla.</p>
    <div class="chat-wrap">
      <div class="chat-suggestions">${esExplorador() ? `
        <span class="chip" onclick="sugerir('Explícame qué es una opción como si tuviera 12 años.')">🌱 ¿Qué es una opción?</span>
        <span class="chip" onclick="sugerir('¿Qué necesito para abrir mi primera cuenta de broker? Aún no opero.')">🏦 ¿Cómo abro un broker?</span>
        <span class="chip" onclick="sugerir('Me da miedo perder dinero. ¿Cómo empiezo a practicar sin arriesgar?')">😰 Tengo miedo de perder</span>
        <span class="chip" onclick="sugerir('Explícame la lección de hoy con un ejemplo de la vida real.')">📖 La lección de hoy</span>` : `
        <span class="chip" onclick="sugerir('Analiza mi bitácora: ¿qué patrones y errores repetidos ves?')">📊 Analiza mi bitácora</span>
        <span class="chip" onclick="sugerir('Quiero hacer un Iron Condor en SPY, IV Rank 60%. Aplica PEDEM completo.')">🦅 Iron Condor con PEDEM</span>
        <span class="chip" onclick="sugerir('Explícame Theta con un ejemplo numérico y una analogía.')">⏳ Explícame Theta</span>
        <span class="chip" onclick="sugerir('¿Qué estrategia conviene con mercado lateral e IV Rank alto?')">🧭 ¿Qué estrategia hoy?</span>`}
      </div>
      <div class="chat-messages" id="chat-messages">
        ${msgs || '<div class="empty"><span class="big">🤖</span>Pregúntame sobre estrategias, Greeks, tu bitácora o aplica PEDEM a un trade.</div>'}
      </div>
      <div class="chat-input-row">
        <textarea id="chat-input" placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para salto de línea)"></textarea>
        <button class="btn" id="chat-send" onclick="enviarChat()">ENVIAR ›</button>
      </div>
      <label class="chat-opts"><input type="checkbox" id="chat-journal" checked> Incluir mi bitácora como contexto para Geny</label>
    </div>`;

  const input = $('#chat-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat(); }
  });
  scrollChat();
}

window.sugerir = txt => { $('#chat-input').value = txt; $('#chat-input').focus(); };

function scrollChat() {
  const box = $('#chat-messages');
  if (box) box.scrollTop = box.scrollHeight;
}

window.enviarChat = async () => {
  const input = $('#chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  state.chat.push({ role: 'user', content: text });

  const box = $('#chat-messages');
  box.innerHTML += `<div class="msg user">${esc(text)}</div><div class="msg ai thinking" id="thinking">Geny está analizando…</div>`;
  scrollChat();
  $('#chat-send').disabled = true;

  try {
    const data = await window.api('/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: state.chat.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
        includeJournal: $('#chat-journal').checked
      })
    });
    document.getElementById('thinking').remove();
    if (data.error) {
      const errText = data.error === 'no_key'
        ? '⚠️ Aún no tengo motor de IA. Ve a ⚙️ Ajustes → "Motor de IA de Geny", conecta tu proveedor (Claude, GPT, Gemini o compatible) y vuelve.'
        : `⚠️ Error del motor de IA: ${data.error}`;
      box.innerHTML += `<div class="msg ai"><div class="msg-label">GENY</div>${esc(errText)}</div>`;
      state.chat.pop(); // no guardar el turno fallido
    } else {
      state.chat.push({ role: 'ai', content: data.text });
      box.innerHTML += `<div class="msg ai"><div class="msg-label">GENY</div>${esc(data.text)}</div>`;
    }
  } catch (e) {
    document.getElementById('thinking')?.remove();
    box.innerHTML += `<div class="msg ai">⚠️ Error de red: ${esc(e.message)}</div>`;
    state.chat.pop();
  }
  $('#chat-send').disabled = false;
  scrollChat();
};

// ============ LIGA ============
async function liga() {
  main.innerHTML = `<h1>LIGA <span class="accent">DE DISCIPLINA</span></h1>
    <p class="subtitle">Cargando la liga semanal…</p>`;
  const L = await api('/league');

  const filas = L.members.map((m, i) => {
    const zona = i < 10 ? 'sube' : (i >= L.members.length - 5 ? 'baja' : '');
    return `<div class="liga-row ${m.you ? 'you' : ''} ${zona}">
      <span class="liga-pos">${i + 1}</span>
      <span class="liga-nombre">${esc(m.name)}${m.you ? ' ⭐' : ''}</span>
      <span class="liga-xp">⚡ ${m.xp} XP</span>
      <span class="liga-zona">${zona === 'sube' ? '↑' : zona === 'baja' ? '↓' : ''}</span>
    </div>`;
  }).join('');

  const badgesHtml = BADGES.map(b => {
    const on = (state.game.badges || []).includes(b.id);
    return `<div class="badge-card ${on ? 'on' : ''}" title="${esc(b.d)}">
      <span class="badge-emoji">${b.e}</span>
      <b>${esc(b.n)}</b>
      <span class="hint">${esc(b.d)}</span>
    </div>`;
  }).join('');

  const partner = JSON.parse(localStorage.getItem('partner') || 'null');

  main.innerHTML = `
    <h1>LIGA <span class="accent">DE DISCIPLINA</span></h1>
    <p class="subtitle">Semana ${esc(L.week)} · Se compite por XP de PROCESO — nunca por P&amp;L ni volumen. Top 10 sube de división, últimos 5 bajan.</p>
    <div class="card">
      <h3>🏆 Tu posición: #${L.rank} de ${L.total}</h3>
      <div class="liga-tabla">${filas}</div>
      <p class="hint" style="margin-top:10px">⚠️ Liga demo con estudiantes simulados — se conectará a la comunidad real INGRESARIOS. Tu XP semanal sí es real.</p>
    </div>
    <div class="card">
      <h3>🎖 Insignias de proceso (${(state.game.badges || []).length}/${BADGES.length})</h3>
      <div class="badges-grid">${badgesHtml}</div>
    </div>
    <div class="card">
      <h3>🤝 Compañero de accountability</h3>
      <p class="hint" style="margin-bottom:12px">Los que rinden cuentas a alguien llegan más lejos. Registra a tu compañero y envíale tu progreso semanal por WhatsApp con un clic.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <input id="p-nombre" placeholder="Nombre" value="${partner ? esc(partner.nombre) : ''}" style="flex:1;min-width:140px">
        <input id="p-tel" placeholder="WhatsApp con código de país: 573001234567" value="${partner ? esc(partner.tel) : ''}" style="flex:2;min-width:200px">
        <button class="btn btn-ghost btn-sm" onclick="guardarPartner()">Guardar</button>
      </div>
      ${partner ? `<button class="btn btn-green btn-sm" style="margin-top:12px" onclick="enviarWhatsApp()">📲 Enviar mi progreso a ${esc(partner.nombre)}</button>` : ''}
    </div>`;
}

window.guardarPartner = async () => {
  const nombre = $('#p-nombre').value.trim(), tel = $('#p-tel').value.trim().replace(/\D/g, '');
  if (!nombre || !tel) { toast('Falta el nombre o el WhatsApp.'); return; }
  localStorage.setItem('partner', JSON.stringify({ nombre, tel }));
  // También al servidor: alimenta el campo pedem_tiene_partner del journey en GHL
  await api('/config', { method: 'POST', body: JSON.stringify({ partnerNombre: nombre, partnerTel: tel }) });
  toast(`🤝 ${nombre} es tu compañero de accountability.`);
  render();
};

window.enviarWhatsApp = () => {
  const partner = JSON.parse(localStorage.getItem('partner') || 'null');
  if (!partner) return;
  const msg = `¡Hola ${partner.nombre}! Te comparto mi avance del Reto 21 📈\n\n${shareCardTexto()}\n\nSígueme la pista: si un día no reporto, ¡cóbramelo! 💪`;
  trackShare();
  window.open(`https://wa.me/${partner.tel}?text=${encodeURIComponent(msg)}`, '_blank');
};

// ============ ACADEMIA ============
let academiaTab = 'pedem';
function academia() {
  const tabs = [
    ['cimientos', '🌱 Cimientos'],
    ['pedem', '🧭 Método PEDEM'],
    ['videos', '🎬 Videos'],
    ['estrategias', '♟ Estrategias'],
    ['selector', '🎯 Selector'],
    ['greeks', 'Δ Greeks'],
    ['riesgo', '🛡 Gestión de riesgo'],
    ['glosario', '📖 Glosario']
  ].map(([id, label]) => `<div class="tab ${academiaTab === id ? 'active' : ''}" onclick="setTab('${id}')">${label}</div>`).join('');

  main.innerHTML = `
    <h1>ACADEMIA <span class="accent">INGRESARIOS</span></h1>
    <p class="subtitle">Concepto → por qué importa → ejemplo numérico → conexión con PEDEM.</p>
    <div class="tabs">${tabs}</div>
    <div id="academia-body"></div>`;
  renderAcademiaTab();
}

window.setTab = id => { academiaTab = id; academia(); };

function renderAcademiaTab() {
  const body = $('#academia-body');
  if (academiaTab === 'pedem') {
    body.innerHTML = K.pedem.map(f => `
      <div class="card pedem-fase-card" style="--fase-color:${f.color}">
        <div style="display:flex;gap:16px;align-items:center">
          <span class="letra-big">${f.letra}</span>
          <div><b style="font-size:16px">${f.nombre}</b><br><span style="color:var(--text-dim);font-size:13px">${f.desc}</span></div>
        </div>
        <ul>${f.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`).join('');
  } else if (academiaTab === 'estrategias') {
    body.innerHTML = K.estrategias.map((e, i) => `
      <div class="card estrategia-card" id="estr-${i}">
        <div class="estrategia-head" onclick="document.getElementById('estr-${i}').classList.toggle('open')">
          <b>${esc(e.nombre)}</b>
          <span style="display:flex;gap:6px">
            <span class="tag ${e.tipo.split(' ')[0]}">${esc(e.tipo)}</span>
            <span class="tag credito">${esc(e.costo)}</span>
          </span>
        </div>
        <div class="estrategia-body">
          <b>Estructura:</b> ${esc(e.estructura)}<br>
          <b>Max profit:</b> ${esc(e.maxProfit)} · <b>Max loss:</b> ${esc(e.maxLoss)} · <b>Breakeven:</b> ${esc(e.breakeven)}<br>
          <b>Ejemplo:</b> ${esc(e.ejemplo)}<br>
          <b>Cuándo usarla:</b> ${esc(e.cuando)}
        </div>
      </div>`).join('');
  } else if (academiaTab === 'selector') {
    body.innerHTML = `
      <div class="card">
        <h3>🎯 Selector de estrategia</h3>
        <div class="form-grid">
          <label class="field">¿Cuál es tu outlook?<select id="sel-outlook">
            <option>Alcista fuerte</option><option>Alcista moderado</option>
            <option>Bajista fuerte</option><option>Bajista moderado</option>
            <option>Neutral</option><option>Gran movimiento esperado</option>
            <option>Poseo acciones</option>
          </select></label>
          <label class="field">IV Rank<select id="sel-iv"><option value="alto">Alto (&gt; 50%)</option><option value="bajo">Bajo (&lt; 30%)</option></select></label>
        </div>
        <button class="btn btn-green btn-sm" style="margin-top:14px" onclick="runSelector()">Sugerir estrategia</button>
        <div class="selector-result" id="sel-result"></div>
        <p class="hint">Basado en la tabla de selección rápida INGRESARIOS. IV Rank 30-50%: evaluar caso por caso. La sugerencia no reemplaza tu plan PEDEM completo.</p>
      </div>`;
  } else if (academiaTab === 'greeks') {
    body.innerHTML = K.greeks.map(g => `
      <div class="card">
        <h3>${esc(g.nombre)} — ${esc(g.apodo)}</h3>
        <p style="font-size:14px;line-height:1.7;margin-bottom:10px">${esc(g.def)}</p>
        <ul style="margin-left:20px;font-size:13px;line-height:1.9;color:var(--text)">
          ${g.claves.map(c => `<li>${esc(c)}</li>`).join('')}
        </ul>
      </div>`).join('');
  } else if (academiaTab === 'riesgo') {
    const r = K.reglas;
    const bloque = (titulo, items) => `
      <div class="card"><h3>${titulo}</h3>
        <ul style="margin-left:20px;font-size:14px;line-height:2">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
      </div>`;
    body.innerHTML =
      bloque('📏 Sizing', r.sizing) +
      bloque('🛑 Stop loss', r.stopLoss) +
      bloque('💰 Take profit', r.takeProfit) +
      bloque('⏱ Gestión de tiempo', r.tiempo);
  } else if (academiaTab === 'cimientos') {
    const leidas = state.game.awardedKeys || [];
    const total = K.cimientos.length;
    const hechas = K.cimientos.filter(c => leidas.includes('cimiento-' + c.n)).length;
    body.innerHTML = `
      <div class="card" style="border-color:rgba(0,230,118,.35)">
        <h3>🌱 Empieza por aquí — de cero absoluto</h3>
        <p style="font-size:14px;line-height:1.7;margin-bottom:6px">¿Nunca has invertido? Perfecto. Estas 5 lecciones te dan el piso firme <b>antes</b> del Día 1 del reto — sin tecnicismos, como si te lo explicara un amigo.</p>
        <p class="hint">Progreso: <b style="color:var(--green)">${hechas}/${total}</b> lecciones · +10 XP cada una</p>
      </div>
      ${K.cimientos.map(c => {
        const leida = leidas.includes('cimiento-' + c.n);
        return `
        <div class="card cimiento-card" id="cim-${c.n}">
          <div class="cimiento-head" onclick="document.getElementById('cim-${c.n}').classList.toggle('open')">
            <span><span class="cimiento-icono">${c.icono}</span> <b>${c.n}. ${esc(c.titulo)}</b></span>
            <span class="cimiento-chevron">${leida ? '<span class="ok-msg" style="font-size:12px">✓ leída</span> ' : ''}▾</span>
          </div>
          <div class="cimiento-body">
            <p style="font-size:15px;line-height:1.7">${esc(c.concepto)}</p>
            <div class="cimiento-analogia"><b>🔑 Piénsalo así:</b> ${esc(c.analogia)}</div>
            <p style="font-size:14px;line-height:1.7;margin-top:10px"><b style="color:var(--cyan)">¿Por qué importa?</b> ${esc(c.importa)}</p>
            <p style="font-size:14px;line-height:1.7;margin-top:10px"><b style="color:var(--green)">Para recordar:</b> ${esc(c.clave)}</p>
            <button class="btn ${leida ? 'btn-ghost' : 'btn-green'} btn-sm" style="margin-top:12px" ${leida ? 'disabled' : ''} onclick="cimientoLeido(${c.n})">${leida ? '✓ Lección completada (+10 XP)' : 'La entendí — marcar como leída +10 XP'}</button>
          </div>
        </div>`;
      }).join('')}
      <div class="card" style="text-align:center">
        ${hechas === total
          ? '<p class="ok-msg">🎉 ¡Cimientos completos! Ya tienes el piso firme. Ahora sí: al Día 1 del reto. 🚀</p>'
          : '<p class="hint">Cuando termines las 5, estarás listo para empezar el Reto 21 sin sentirte perdido.</p>'}
      </div>`;
  } else if (academiaTab === 'videos') {
    renderVideos();
  } else if (academiaTab === 'glosario') {
    body.innerHTML = `
      <div class="card">
        <input id="glo-search" placeholder="🔎 Buscar término… (theta, IV, wheel…)" oninput="filtrarGlosario()" style="margin-bottom:14px">
        <div id="glo-list">${K.glosario.map(([t, d]) => `<div class="glosario-item"><b>${esc(t)}:</b> ${esc(d)}</div>`).join('')}</div>
      </div>`;
  }
}

window.cimientoLeido = async (n) => {
  await award(10, 'cimiento-' + n, 'Lección de Cimientos completada');
  renderAcademiaTab();
};

// ---------- Videos de la Academia ----------
const VIDEO_CATEGORIAS = ['PEDEM', 'Estrategias', 'Greeks', 'Mentalidad', 'Reto 21', 'Otro'];
let videoFiltro = 'Todos';

function ytIdDesdeUrl(url) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,20})/);
  if (m) return m[1];
  return /^[\w-]{6,20}$/.test(url.trim()) ? url.trim() : null; // permite pegar el ID directo
}

async function renderVideos() {
  const body = $('#academia-body');
  body.innerHTML = '<p class="hint">Cargando videos…</p>';
  const videos = await api('/videos');
  const vistas = state.game.awardedKeys || [];

  const filtros = ['Todos', ...VIDEO_CATEGORIAS]
    .map(c => `<span class="chip ${videoFiltro === c ? 'chip-on' : ''}" onclick="filtrarVideos('${c}')">${c}</span>`).join('');

  const lista = videos.filter(v => videoFiltro === 'Todos' || v.categoria === videoFiltro);

  const grid = lista.length ? lista.map(v => {
    const vista = vistas.includes('video-' + v.id);
    return `
    <div class="video-card">
      <div class="video-thumb" id="vt-${v.id}" onclick="playVideo('${v.id}','${esc(v.ytId)}')">
        <img src="https://i.ytimg.com/vi/${esc(v.ytId)}/hqdefault.jpg" alt="${esc(v.titulo)}" loading="lazy">
        <span class="video-play">▶</span>
      </div>
      <div class="video-info">
        <b>${esc(v.titulo)}</b>
        <span class="hint">${esc(v.categoria)}</span>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          <button class="btn ${vista ? 'btn-ghost' : 'btn-green'} btn-sm" ${vista ? 'disabled' : ''} onclick="videoVisto('${v.id}')">${vista ? '✓ Vista (+15 XP)' : 'Marcar como vista +15 XP'}</button>
          <button class="btn btn-danger btn-sm" onclick="borrarVideo('${v.id}')">🗑</button>
        </div>
      </div>
    </div>`;
  }).join('') : `<div class="empty"><span class="big">🎬</span>${videoFiltro === 'Todos' ? 'Aún no hay videos.<br>Agrega el primero con el formulario de arriba — pega cualquier link de YouTube.' : 'No hay videos en esta categoría.'}</div>`;

  body.innerHTML = `
    <div class="card">
      <h3>➕ Agregar video</h3>
      <div class="form-grid">
        <label class="field">Título<input id="v-titulo" placeholder="PEDEM explicado en 10 minutos"></label>
        <label class="field">Link de YouTube (o ID)<input id="v-url" placeholder="https://youtube.com/watch?v=… · youtu.be/… · Shorts"></label>
        <label class="field">Categoría<select id="v-cat">${VIDEO_CATEGORIAS.map(c => `<option>${c}</option>`).join('')}</select></label>
      </div>
      <button class="btn btn-green btn-sm" style="margin-top:12px" onclick="agregarVideo()">Agregar</button>
      <span id="v-msg" class="hint" style="margin-left:10px"></span>
    </div>
    <div class="chat-suggestions" style="margin-bottom:14px">${filtros}</div>
    <div class="videos-grid">${grid}</div>`;
}

window.filtrarVideos = (c) => { videoFiltro = c; renderVideos(); };

window.agregarVideo = async () => {
  const titulo = $('#v-titulo').value.trim();
  const ytId = ytIdDesdeUrl($('#v-url').value);
  const msg = $('#v-msg');
  if (!titulo) { msg.innerHTML = '<span class="error-msg">Falta el título.</span>'; return; }
  if (!ytId) { msg.innerHTML = '<span class="error-msg">Ese link no parece de YouTube.</span>'; return; }
  await api('/videos', { method: 'POST', body: JSON.stringify({ titulo, ytId, categoria: $('#v-cat').value }) });
  toast('🎬 Video agregado a la Academia.');
  renderVideos();
};

window.playVideo = (id, ytId) => {
  $('#vt-' + id).outerHTML = `
    <div class="video-thumb playing">
      <iframe src="https://www.youtube.com/embed/${esc(ytId)}?autoplay=1" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>`;
};

window.videoVisto = async (id) => {
  await award(15, 'video-' + id, 'Video de la Academia completado');
  renderVideos();
};

window.borrarVideo = async (id) => {
  if (!confirm('¿Quitar este video de la Academia?')) return;
  await api('/videos/' + id, { method: 'DELETE' });
  renderVideos();
};

window.runSelector = () => {
  const outlook = $('#sel-outlook').value;
  const iv = $('#sel-iv').value;
  let match = K.selector.find(s => s.outlook === outlook && s.iv === iv);
  const res = $('#sel-result');
  if (match) {
    res.innerHTML = match.estrategias.map(e => `<span class="pill">${esc(e)}</span>`).join('');
  } else {
    const alt = K.selector.find(s => s.outlook === outlook);
    res.innerHTML = `<p class="hint">Para "${esc(outlook)}" con IV ${iv === 'alto' ? 'alto' : 'bajo'} no hay setup ideal en la tabla.
      ${alt ? `Con IV ${alt.iv} se sugiere: ` + alt.estrategias.map(e => `<span class="pill">${esc(e)}</span>`).join('') : 'Considera esperar mejor condición de IV.'}</p>`;
  }
};

window.filtrarGlosario = () => {
  const q = $('#glo-search').value.toLowerCase();
  $('#glo-list').innerHTML = K.glosario
    .filter(([t, d]) => (t + ' ' + d).toLowerCase().includes(q))
    .map(([t, d]) => `<div class="glosario-item"><b>${esc(t)}:</b> ${esc(d)}</div>`).join('') ||
    '<div class="empty">Sin resultados.</div>';
};

// ============ AJUSTES ============
async function ajustes() {
  const cfg = await api('/config');
  main.innerHTML = `
    <h1>AJUSTES</h1>
    <p class="subtitle">Configuración de Geny y datos de la app.</p>
    <div class="card">
      <h3>🧭 Modo de la app</h3>
      <p class="hint" style="margin-bottom:12px">Actual: <b style="color:var(--green)">${state.cfg.modo === 'explorador' ? '🌱 Explorador — camino guiado de 21 lecciones' : '⚡ Operador — todas las herramientas'}</b></p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" onclick="setModo('explorador')">🌱 Cambiar a Explorador</button>
        <button class="btn btn-ghost btn-sm" onclick="setModo('operador')">⚡ Cambiar a Operador</button>
      </div>
    </div>
    <div class="card">
      <h3>🧠 Motor de IA de Geny — conecta cualquier API</h3>
      <p class="hint" style="margin-bottom:12px">
        Estado: ${cfg.hasKey ? `<span class="ok-msg">conectado — ${esc(cfg.aiProvider)}${cfg.aiModel ? ' · ' + esc(cfg.aiModel) : ''}${cfg.keyPreview ? ' (' + esc(cfg.keyPreview) + ')' : ''}</span>` : '<span class="error-msg">sin configurar</span>'}<br>
        Geny funciona con el proveedor que elijas. La key se guarda solo en tu computadora (data/config.json).
      </p>
      <div class="form-grid">
        <label class="field">Proveedor
          <select id="ai-provider" onchange="aiPlaceholder()">
            <option value="free" ${cfg.aiProvider === 'free' ? 'selected' : ''}>🆓 Gratis sin key (Pollinations)</option>
            <option value="anthropic" ${cfg.aiProvider === 'anthropic' ? 'selected' : ''}>Anthropic (Claude)</option>
            <option value="openai" ${cfg.aiProvider === 'openai' ? 'selected' : ''}>OpenAI (GPT)</option>
            <option value="gemini" ${cfg.aiProvider === 'gemini' ? 'selected' : ''}>Google (Gemini)</option>
            <option value="custom" ${cfg.aiProvider === 'custom' ? 'selected' : ''}>Compatible OpenAI (Groq, OpenRouter, DeepSeek, Ollama…)</option>
          </select>
        </label>
        <label class="field">Modelo (vacío = recomendado)<input id="ai-model" value="${esc(cfg.aiModel)}" placeholder="claude-sonnet-5"></label>
        <label class="field">API Key<input id="ai-key" type="password" placeholder="sk-…"></label>
        <label class="field">Base URL <span style="text-transform:none">(solo para "Compatible OpenAI")</span><input id="ai-baseurl" value="${esc(cfg.aiBaseUrl)}" placeholder="https://openrouter.ai/api/v1 · https://api.groq.com/openai/v1 · http://localhost:11434/v1"></label>
        <p class="hint full" style="grid-column:1/-1">💡 DeepSeek/Qwen gratis: crea una key gratuita en <b>openrouter.ai</b>, elige "Compatible OpenAI", Base URL <b>https://openrouter.ai/api/v1</b> y modelo <b>deepseek/deepseek-chat-v3-0324:free</b> o <b>qwen/qwen3-30b-a3b:free</b>.</p>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="guardarIA()">Guardar</button>
        <button class="btn btn-ghost btn-sm" onclick="probarIA(this)">🔌 Probar motor</button>
      </div>
      <span id="cfg-msg" class="hint"></span>
    </div>
    <div class="card">
      <h3>🔗 GoHighLevel — sync del customer journey</h3>
      <p class="hint" style="margin-bottom:12px">
        Estado: ${cfg.ghlHasToken ? '<span class="ok-msg">token configurado</span>' : '<span class="error-msg">sin configurar</span>'}.
        Cada acción en la app actualiza el contacto en GHL (etapa del journey, racha, disciplina, tags de hitos) para disparar tus workflows de WhatsApp/email.
      </p>
      <div class="form-grid">
        <label class="field full">Private Integration Token<input id="ghl-token" type="password" placeholder="pit-…"></label>
        <label class="field">Location ID<input id="ghl-loc" value="${esc(cfg.ghlLocationId)}"></label>
        <label class="field">Email del contacto (estudiante)<input id="ghl-email" type="email" value="${esc(cfg.ghlEmail)}" placeholder="estudiante@correo.com"></label>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        <button class="btn btn-green btn-sm" onclick="guardarGhl()">Guardar</button>
        <button class="btn btn-ghost btn-sm" onclick="probarGhl(this)">🔌 Probar conexión y crear campos</button>
        <button class="btn btn-ghost btn-sm" onclick="verJourney()">👁 Ver payload del journey</button>
      </div>
      <span id="ghl-msg" class="hint"></span>
      <pre id="ghl-preview" style="display:none;background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:12px;margin-top:12px;font-size:11px;overflow-x:auto;max-height:320px"></pre>
    </div>
    <div class="card">
      <h3>⏰ Recordatorio diario de Geny</h3>
      <p class="hint" style="margin-bottom:12px">Con la app abierta, Geny te avisa a la hora que elijas si aún no has sumado tu día. (Notificación del navegador.)</p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label class="chat-opts" style="margin:0"><input type="checkbox" id="rem-on" ${getReminder().on ? 'checked' : ''}> Activar</label>
        <input type="time" id="rem-hora" value="${getReminder().hora}" style="width:130px">
        <button class="btn btn-ghost btn-sm" onclick="guardarReminder()">Guardar</button>
        <span id="rem-msg" class="hint"></span>
      </div>
    </div>
    <div class="card">
      <h3>📦 Datos</h3>
      <p class="hint">Tus trades y el progreso del Reto 21 se guardan localmente en la carpeta <b>data/</b> de la app (archivos JSON). Puedes respaldarlos copiando esa carpeta.</p>
      <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="exportarBitacora()">⬇ Exportar bitácora (JSON)</button>
    </div>`;
}

window.guardarGhl = async () => {
  const body = { ghlLocationId: $('#ghl-loc').value, ghlEmail: $('#ghl-email').value };
  const token = $('#ghl-token').value.trim();
  if (token) body.ghlToken = token;
  await api('/config', { method: 'POST', body: JSON.stringify(body) });
  $('#ghl-msg').innerHTML = '<span class="ok-msg">✔ Configuración GHL guardada.</span>';
  $('#ghl-token').value = '';
};

window.probarGhl = async (btn) => {
  btn.disabled = true; btn.textContent = 'Conectando…';
  const r = await fetch('/api/ghl/test', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await r.json();
  btn.disabled = false; btn.textContent = '🔌 Probar conexión y crear campos';
  $('#ghl-msg').innerHTML = r.ok
    ? `<span class="ok-msg">✔ Conectado. ${data.camposCreados} campos de journey listos en GHL. Sync inicial enviado.</span>`
    : `<span class="error-msg">${data.error === 'config_incompleta' ? 'Faltan token, Location ID o email.' : 'Error: ' + esc(data.detail || data.error)}</span>`;
};

window.verJourney = async () => {
  const snap = await api('/ghl/preview');
  const pre = $('#ghl-preview');
  pre.style.display = 'block';
  pre.textContent = JSON.stringify({ etapa: snap.etapa, campos: snap.fields, tags: snap.tags }, null, 2);
};

const AI_PLACEHOLDERS = {
  free: 'openai (recomendado — es el que funciona sin key)',
  anthropic: 'claude-sonnet-5',
  openai: 'gpt-4o',
  gemini: 'gemini-2.5-flash',
  custom: 'llama-3.3-70b · deepseek-chat · el modelo de tu endpoint'
};

window.aiPlaceholder = () => {
  $('#ai-model').placeholder = AI_PLACEHOLDERS[$('#ai-provider').value] || '';
};

window.guardarIA = async () => {
  const body = {
    aiProvider: $('#ai-provider').value,
    aiModel: $('#ai-model').value,
    aiBaseUrl: $('#ai-baseurl').value
  };
  const key = $('#ai-key').value.trim();
  if (key) body.aiKey = key;
  await api('/config', { method: 'POST', body: JSON.stringify(body) });
  state.cfg = await api('/config');
  $('#cfg-msg').innerHTML = '<span class="ok-msg">✔ Motor de IA guardado. Prueba la conexión con el botón 🔌.</span>';
  $('#ai-key').value = '';
};

window.probarIA = async (btn) => {
  btn.disabled = true; btn.textContent = 'Probando…';
  const r = await fetch('/api/ai/test', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
  const data = await r.json();
  btn.disabled = false; btn.textContent = '🔌 Probar motor';
  $('#cfg-msg').innerHTML = r.ok
    ? `<span class="ok-msg">✔ Geny respondió: "${esc(data.respuesta)}" — motor conectado.</span>`
    : `<span class="error-msg">${data.error === 'no_key' ? 'Falta la API key del proveedor elegido.' : 'Error: ' + esc(data.detail || data.error)}</span>`;
};

window.exportarBitacora = () => {
  const blob = new Blob([JSON.stringify(state.trades, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bitacora-pedem.json';
  a.click();
};

// ---------- Recordatorio diario (Notification API) ----------
function getReminder() {
  return JSON.parse(localStorage.getItem('reminder') || '{"on":false,"hora":"08:00"}');
}

window.guardarReminder = async () => {
  const on = $('#rem-on').checked, hora = $('#rem-hora').value || '08:00';
  if (on && 'Notification' in window && Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      $('#rem-msg').innerHTML = '<span class="error-msg">Permiso de notificaciones denegado en el navegador.</span>';
      return;
    }
  }
  localStorage.setItem('reminder', JSON.stringify({ on, hora }));
  $('#rem-msg').innerHTML = `<span class="ok-msg">✔ ${on ? 'Recordatorio activo a las ' + hora : 'Recordatorio desactivado'}.</span>`;
};

function startReminderLoop() {
  setInterval(async () => {
    const r = getReminder();
    if (!r.on || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const hhmm = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const flag = 'rem-fired-' + todayStr();
    if (hhmm >= r.hora && !localStorage.getItem(flag)) {
      const g = await api('/game');
      if (!g.activeToday) {
        new Notification('Geny 🔥', { body: coachCheckin() });
      }
      localStorage.setItem(flag, '1');
    }
  }, 60000);
}

// ---------- Init ----------
window.initApp = async function() {
  await loadData();
  updateNav();
  render();
  if (!state.cfg.modo) showOnboarding();
  checkBadges();
  startReminderLoop();
};
