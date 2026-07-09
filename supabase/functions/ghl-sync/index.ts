import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GHL Field Defs removed as we now send a raw JSON payload via webhook

const PERFILES = {
  income: ['Iron Condor', 'Iron Butterfly', 'Covered Call', 'Cash-Secured Put', 'Bull Put Spread', 'Bear Call Spread', 'Short Strangle', 'Calendar Spread', 'Collar'],
  direccional: ['Long Call', 'Long Put', 'Bull Call Spread', 'Bear Put Spread', 'Diagonal / PMCC'],
  volatilidad: ['Long Straddle', 'Long Strangle']
};

function localDateStr(d: Date) {
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
}

function getISOWeek(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function weekKey(d: Date) {
  return `${d.getFullYear()}-W${getISOWeek(d).toString().padStart(2, '0')}`;
}

function isWeekend(dateStr: string) {
  const day = new Date(dateStr + 'T12:00:00Z').getDay();
  return day === 0 || day === 6;
}

function computeStreak(game: any) {
  const dates = Object.keys(game.activity || {}).sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let d = new Date(localDateStr(new Date()) + 'T12:00:00Z');
  
  if (!dates.includes(localDateStr(d)) && !isWeekend(localDateStr(d))) {
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!dates.includes(localDateStr(yesterday)) && !isWeekend(localDateStr(yesterday))) {
      const prev2 = new Date(yesterday);
      prev2.setDate(prev2.getDate() - 1);
      if (!isWeekend(localDateStr(prev2)) || (!dates.includes(localDateStr(yesterday)) && !dates.includes(localDateStr(prev2)))) {
         return 0;
      }
    }
    d = yesterday;
  }
  
  while (true) {
    const s = localDateStr(d);
    if (dates.includes(s)) streak++;
    else if (!isWeekend(s)) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Cache variables removed
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Fetch all user data
    const [{ data: profile }, { data: gameRow }, { data: trades }, { data: reto }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('game').select('*').eq('user_id', user.id).single(),
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('reto21').select('*').eq('user_id', user.id).single()
    ]);

    if (!profile?.ghl_email) {
      return new Response(JSON.stringify({ ok: true, msg: 'No GHL email found for user' }), { headers: corsHeaders });
    }

    const game = gameRow || { activity: {}, escudos: 0, racha_max: 0 };
    const gameActivity = game.activity || {};
    const gameWeeklyXp = game.weekly_xp || {};
    const gameBadges = game.badges || [];
    const tradesList = trades || [];
    const retoData = reto || { days: {} };

    // --- Compute snapshot ---
    const today = localDateStr(new Date());
    const streak = computeStreak(game);
    const rachaMax = Math.max(game.racha_max || 0, streak);
    const wk = weekKey(new Date());

    const fechas = Object.keys(gameActivity).sort();
    const ultimoActivo = fechas[fechas.length - 1] || null;
    const diasInactivo = ultimoActivo ? Math.max(0, Math.round((new Date(today).getTime() - new Date(ultimoActivo).getTime()) / 86400000)) : 999;

    const cerrados = tradesList.filter((t: any) => t.status === 'cerrado');
    const planPct = cerrados.length ? Math.round(100 * cerrados.filter((t: any) => t.plan_respetado).length / cerrados.length) : null;
    const chkPct = tradesList.length ? Math.round(100 * tradesList.filter((t: any) => t.checklist_ok).length / tradesList.length) : null;
    const score = tradesList.length ? Math.round(0.6 * (planPct ?? 100) + 0.4 * (chkPct ?? 100)) : null;
    const grade = score === null ? 'EN FORMACIÓN' : score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D';

    const conteo: Record<string, number> = {};
    tradesList.forEach((t: any) => { conteo[t.estrategia] = (conteo[t.estrategia] || 0) + 1; });
    const favorita = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    
    const porPerfil = { income: 0, direccional: 0, volatilidad: 0 };
    tradesList.forEach((t: any) => {
      for (const [p, lista] of Object.entries(PERFILES)) {
        if (lista.includes(t.estrategia)) porPerfil[p as keyof typeof porPerfil]++;
      }
    });
    const perfil = tradesList.length ? Object.entries(porPerfil).sort((a, b) => b[1] - a[1])[0][0] : null;

    const retoDias = Object.keys(retoData.days || {}).length;
    let retoDia = 0;
    if (retoData.start_date) {
      retoDia = Math.min(21, Math.floor((new Date(today).getTime() - new Date(retoData.start_date).getTime()) / 86400000) + 1);
    }
    const retoCompletado = retoDias >= 21;

    let etapa;
    if (retoCompletado) etapa = 'reto_completado';
    else if (diasInactivo >= 7) etapa = 'inactivo';
    else if (retoData.start_date && diasInactivo >= 2) etapa = 'en_riesgo';
    else if (retoData.start_date) etapa = 'en_reto';
    else if (fechas.length) etapa = 'activado';
    else etapa = 'lead';

    const fields = {
      pedem_etapa_journey: etapa,
      pedem_fecha_registro: fechas[0] || today,
      pedem_ultimo_activo: ultimoActivo || '',
      pedem_dias_inactivo: diasInactivo === 999 ? 0 : diasInactivo,
      pedem_reto_inicio: retoData.start_date || '',
      pedem_reto_dia: retoDia,
      pedem_reto_dias_completados: retoDias,
      pedem_reto_pct: Math.round(100 * retoDias / 21),
      pedem_racha: streak,
      pedem_racha_max: rachaMax,
      pedem_xp_total: game.xp_total || 0,
      pedem_xp_semana: gameWeeklyXp[wk] || 0,
      pedem_insignias: gameBadges.length,
      pedem_ultima_insignia: gameBadges[gameBadges.length - 1] || '',
      pedem_apuestas_ganadas: game.apuestas_ganadas || 0,
      pedem_disciplina_grade: grade,
      pedem_disciplina_score: score ?? 0,
      pedem_trades_registrados: tradesList.length,
      pedem_trades_cerrados: cerrados.length,
      pedem_pct_plan_respetado: planPct ?? 0,
      pedem_pct_checklist: chkPct ?? 0,
      pedem_estrategia_favorita: favorita || '',
      pedem_perfil_trading: perfil || '',
      pedem_mental_edge_score: (game.mental_edge || {}).score || 0,
      pedem_chat_mensajes: game.chat_count || 0,
      pedem_share_cards: game.share_count || 0,
      pedem_tiene_partner: profile.partner_nombre ? 'sí' : 'no',
      pedem_modo: profile.modo || 'operador'
    };

    const tags = ['pedem-app', 'etapa-' + etapa, 'modo-' + (profile.modo || 'operador')];
    if (retoData.start_date) tags.push('r21-empezo');
    if (retoDias >= 3) tags.push('r21-dia-3');
    if (retoDias >= 7) tags.push('r21-dia-7');
    if (retoDias >= 14) tags.push('r21-dia-14');
    if (retoCompletado) tags.push('r21-completado');
    if (rachaMax >= 7) tags.push('racha-7');
    if (rachaMax >= 14) tags.push('racha-14');
    if (rachaMax >= 21) tags.push('racha-21');
    gameBadges.forEach((b: string) => tags.push('insignia-' + b));
    if ((game.share_count || 0) > 0) tags.push('compartio-card');
    if (profile.partner_nombre) tags.push('tiene-partner');
    if ((game.xp_total || 0) >= 500 || (game.chat_count || 0) >= 20) tags.push('candidato-pro');
    if (score !== null && score < 60 && cerrados.length >= 3) tags.push('candidato-mentoria');
    if (perfil) tags.push('perfil-' + perfil);
    
    const lastWager = game.last_wager || {};
    if (lastWager.status === 'won') tags.push('apuesta-ganada');
    if (lastWager.status === 'lost') tags.push('apuesta-perdida');

    // Update rachaMax if changed
    if (rachaMax !== game.racha_max) {
      await supabase.from('game').update({ racha_max: rachaMax }).eq('user_id', user.id);
    }

    // --- Push to Webhook ---
    // Reads GHL_WEBHOOK_URL from Supabase Secrets (or fallbacks to profile.ghl_webhook_url if you prefer)
    const webhookUrl = Deno.env.get('GHL_WEBHOOK_URL') || profile.ghl_webhook_url;
    
    if (!webhookUrl) {
      throw new Error('No webhook URL configured (missing GHL_WEBHOOK_URL secret)');
    }

    const payload = {
      name: profile.nombre || '',
      email: profile.ghl_email,
      phone: profile.phone || '',
      userId: user.id,
      tags,
      ...fields
    };

    const webhookRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!webhookRes.ok) {
      throw new Error(`Webhook failed with status ${webhookRes.status}`);
    }

    return new Response(JSON.stringify({ ok: true, synced: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
