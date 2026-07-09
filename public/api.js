const _supabaseUrl = 'https://trfuismpiuercyfbtygb.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZnVpc21waXVlcmN5ZmJ0eWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NjE4ODEsImV4cCI6MjA5OTAzNzg4MX0.HccXcq3afxTQU1OnYu5cLn2isUK2lKYbowsXH6wugVo';
const sb = window.supabase.createClient(_supabaseUrl, _supabaseKey);

let currentUser = null;

async function checkAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    showApp();
  } else {
    showAuth();
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (session && (!currentUser || currentUser.id !== session.user.id)) {
        currentUser = session.user;
        showApp();
      }
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      showAuth();
    }
  });
}

function showAuth() {
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
}

function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'flex';
  if (window.initApp) window.initApp();
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  let isLoginMode = true;

  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const isLogin = isLoginMode;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('auth-submit');
    btn.disabled = true;
    btn.innerText = 'Cargando...';

    try {
      if (isLogin) {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registro exitoso. Iniciando sesión...');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerText = isLogin ? 'Entrar' : 'Registrarse';
    }
  });

  document.getElementById('auth-toggle-btn').addEventListener('click', (e) => {
    e.preventDefault();
    if (isLoginMode) {
      isLoginMode = false;
      document.getElementById('auth-title').innerText = 'Registro';
      document.getElementById('auth-toggle-text').innerText = '¿Ya tienes cuenta?';
      e.target.innerText = 'Inicia Sesión';
      document.getElementById('auth-submit').innerText = 'Registrarse';
    } else {
      isLoginMode = true;
      document.getElementById('auth-title').innerText = 'Iniciar Sesión';
      document.getElementById('auth-toggle-text').innerText = '¿No tienes cuenta?';
      e.target.innerText = 'Regístrate';
      document.getElementById('auth-submit').innerText = 'Entrar';
    }
  });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    await sb.auth.signOut();
  });
});

window.api = async function(path, opts = {}) {
  if (!currentUser) throw new Error("No autenticado");
  const method = opts.method || 'GET';
  const body = opts.body ? JSON.parse(opts.body) : null;
  const uid = currentUser.id;

  try {
    if (path === '/config') {
      if (method === 'GET') {
        let { data } = await sb.from('profiles').select().eq('id', uid).single();
        return data || { modo: '' };
      } else {
        await sb.from('profiles').upsert({ id: uid, ...body });
        return { ok: true };
      }
    }

    if (path === '/trades') {
      if (method === 'GET') {
        const { data } = await sb.from('trades').select().eq('user_id', uid).order('created_at', { ascending: false });
        return data || [];
      } else {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const t = { ...body, id, user_id: uid, status: body.status || 'abierto' };
        await sb.from('trades').insert(t);
        return t;
      }
    }
    if (path.startsWith('/trades/')) {
      const id = path.split('/')[2];
      if (method === 'PUT') {
        await sb.from('trades').update(body).eq('id', id).eq('user_id', uid);
        return { id, ...body };
      } else if (method === 'DELETE') {
        await sb.from('trades').delete().eq('id', id).eq('user_id', uid);
        return { ok: true };
      }
    }

    if (path === '/reto21') {
      if (method === 'GET') {
        const { data } = await sb.from('reto21').select().eq('user_id', uid).single();
        return data || { startDate: null, days: {} };
      } else {
        const { action, date, note } = body;
        const { data } = await sb.from('reto21').select().eq('user_id', uid).single();
        let r = data || { startDate: null, days: {} };
        if (action === 'start') r.start_date = date;
        else if (action === 'reset') { r.start_date = null; r.days = {}; }
        else if (action === 'check') r.days[date] = true;
        else if (action === 'uncheck') delete r.days[date];
        await sb.from('reto21').upsert({ user_id: uid, ...r });
        return { startDate: r.start_date, days: r.days };
      }
    }

    if (path.startsWith('/game')) {
      const ESCUDO_COSTO = 200, ESCUDO_MAX = 2, APUESTA_MONTO = 200;
      let { data: game } = await sb.from('game').select().eq('user_id', uid).single();
      if (!game) game = { xp: 0, xp_total: 0, escudos: 0, escudo_dates: [], activity: {}, awarded_keys: [], wager: null, last_wager: null, badges: [], weekly_xp: {}, mental_edge: null, chat_count: 0, share_count: 0, apuestas_ganadas: 0, racha_max: 0 };
      
      const localDateStr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const addDays = (ds, n) => { const d = new Date(ds + 'T00:00:00'); d.setDate(d.getDate() + n); return localDateStr(d); };
      const isWeekend = ds => { const day = new Date(ds + 'T00:00:00').getDay(); return day === 0 || day === 6; };
      const weekKey = date => {
        const t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const day = (t.getDay() + 6) % 7; t.setDate(t.getDate() - day + 3);
        const firstThu = new Date(t.getFullYear(), 0, 4);
        const fday = (firstThu.getDay() + 6) % 7; firstThu.setDate(firstThu.getDate() - fday + 3);
        const wk = 1 + Math.round((t - firstThu) / (7 * 86400000));
        return t.getFullYear() + '-W' + String(wk).padStart(2, '0');
      };

      if (game.wager && game.wager.status === 'active') {
        const today = localDateStr(new Date());
        let broken = false;
        for (let ds = game.wager.startDate; ds <= game.wager.endDate && ds < today; ds = addDays(ds, 1)) {
          if (!game.activity[ds] && !isWeekend(ds) && !game.escudo_dates.includes(ds)) { broken = true; break; }
        }
        if (broken) game.wager.status = 'lost';
        else if (today > game.wager.endDate || (today === game.wager.endDate && game.activity[today])) {
          game.wager.status = 'won';
          game.xp += game.wager.amount * 2;
          game.xp_total += game.wager.amount;
          game.apuestas_ganadas++;
          const wk = weekKey(new Date());
          game.weekly_xp[wk] = (game.weekly_xp[wk] || 0) + game.wager.amount;
        }
        if (game.wager.status !== 'active') { game.last_wager = game.wager; game.wager = null; }
      }

      const computeStreak = (g) => {
        const today = localDateStr(new Date());
        const activeDates = Object.keys(g.activity || {});
        if (!activeDates.length) return 0;
        let streak = 0, ds = today;
        if (!g.activity[today]) ds = addDays(ds, -1);
        for (let i = 0; i < 400; i++) {
          if (g.activity[ds]) streak++;
          else if (isWeekend(ds) || g.escudo_dates.includes(ds)) {}
          else if (g.escudos > 0 && activeDates.some(a => a < ds)) {
            g.escudos--; g.escudo_dates.push(ds);
          } else break;
          ds = addDays(ds, -1);
        }
        return streak;
      };

      if (path === '/game' && method === 'GET') {
        const streak = computeStreak(game);
        if (streak > game.racha_max) game.racha_max = streak;
        await sb.from('game').upsert({ user_id: uid, ...game });
        return { ...game, escudoDates: game.escudo_dates, xpTotal: game.xp_total, awardedKeys: game.awarded_keys, lastWager: game.last_wager, weeklyXp: game.weekly_xp, mentalEdge: game.mental_edge, apuestasGanadas: game.apuestas_ganadas, rachaMax: game.racha_max, streak, activeToday: !!game.activity[localDateStr(new Date())], today: localDateStr(new Date()), escudoCosto: ESCUDO_COSTO, escudoMax: ESCUDO_MAX, apuestaMonto: APUESTA_MONTO };
      }

      if (path === '/game/activity') {
        const { xp, key, date } = body;
        const ds = date || localDateStr(new Date());
        game.activity[ds] = true;
        let awarded = 0;
        if (key && !game.awarded_keys.includes(key)) {
          game.awarded_keys.push(key);
          awarded = Math.max(0, parseInt(xp) || 0);
          game.xp += awarded;
          game.xp_total += awarded;
          const wk = weekKey(new Date());
          game.weekly_xp[wk] = (game.weekly_xp[wk] || 0) + awarded;
        }
        const streak = computeStreak(game);
        if (streak > game.racha_max) game.racha_max = streak;
        await sb.from('game').upsert({ user_id: uid, ...game });
        return { ...game, escudoDates: game.escudo_dates, xpTotal: game.xp_total, awardedKeys: game.awarded_keys, lastWager: game.last_wager, weeklyXp: game.weekly_xp, mentalEdge: game.mental_edge, apuestasGanadas: game.apuestas_ganadas, rachaMax: game.racha_max, streak, activeToday: !!game.activity[localDateStr(new Date())], today: localDateStr(new Date()), escudoCosto: ESCUDO_COSTO, escudoMax: ESCUDO_MAX, apuestaMonto: APUESTA_MONTO, awarded };
      }

      if (path === '/game/badges') {
        const ids = Array.isArray(body.ids) ? body.ids : [];
        ids.forEach(id => { if (!game.badges.includes(id)) game.badges.push(id); });
        await sb.from('game').upsert({ user_id: uid, ...game });
        const streak = computeStreak(game);
        return { ...game, escudoDates: game.escudo_dates, xpTotal: game.xp_total, awardedKeys: game.awarded_keys, lastWager: game.last_wager, weeklyXp: game.weekly_xp, mentalEdge: game.mental_edge, apuestasGanadas: game.apuestas_ganadas, rachaMax: game.racha_max, streak, activeToday: !!game.activity[localDateStr(new Date())], today: localDateStr(new Date()), escudoCosto: ESCUDO_COSTO, escudoMax: ESCUDO_MAX, apuestaMonto: APUESTA_MONTO };
      }
    }

    if (path === '/videos') {
      if (method === 'GET') {
        const { data } = await sb.from('videos').select().eq('user_id', uid).order('created_at', { ascending: false });
        return data || [];
      } else {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        const v = { id, user_id: uid, titulo: body.titulo, yt_id: body.ytId, categoria: body.categoria };
        await sb.from('videos').insert(v);
        return { ytId: v.yt_id, ...v };
      }
    }
    if (path.startsWith('/videos/')) {
      const id = path.split('/')[2];
      await sb.from('videos').delete().eq('id', id).eq('user_id', uid);
      return { ok: true };
    }

    if (path === '/league') {
      return [];
    }

    if (path === '/chat' || path === '/api/chat') {
      const { data, error } = await sb.functions.invoke('chat', {
        body
      });
      if (error) throw error;
      return data;
    }

    if (path.startsWith('/ghl')) {
      const { data, error } = await sb.functions.invoke('ghl-sync', {
        body
      });
      if (error) throw error;
      return data;
    }

    console.warn('Unhandled API:', path);
    return {};
  } catch (err) {
    console.error('API Error', err);
    throw err;
  }
};
