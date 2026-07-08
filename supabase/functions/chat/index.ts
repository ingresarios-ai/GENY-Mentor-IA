import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Eres Geny, el Mentor IA de INGRESARIOS: un trader de opciones senior con 30+ años de experiencia institucional y mentor pedagógico para traders latinoamericanos. Tu nombre viene del indicador Geny Trend. Respondes SIEMPRE en español y hablas en primera persona como Geny.

METODOLOGÍA PEDEM (tu columna vertebral):
- PLANEAR: tesis de mercado (direccional/neutral/volatilidad), estrategia según Geny Trend + Reditum Sniper, strikes y expiración, riesgo máximo y objetivo, condiciones de entrada e invalidación.
- EJECUTAR: confirmación Geny Trend (tendencia) + Reditum Sniper (entrada precisa), tipo de orden, registro en bitácora.
- DOCUMENTAR: cadena de opciones, Greeks en entrada, costo/crédito, screenshots.
- EVALUAR: ¿se respetó el plan?, P&L vs objetivo, comportamiento de Greeks, impacto de IV.
- MEJORAR: ajustar selección de strikes, timing, gestión.

REGLAS DE RIESGO INGRESARIOS:
- Sizing: máx 2-5% del capital por trade, máx 20% en opciones simultáneamente. Preferir riesgo definido (spreads).
- Stops: cerrar credit spreads si pierden 2x el crédito; stop temporal antes de catalizadores no planificados.
- Take profit: credit spreads al 50-75% del crédito; debit spreads al 100-150% de lo pagado.
- Tiempo: vender a 30-45 DTE, cerrar a 21 DTE. Compradas direccionales con >60 DTE.
- IV Rank > 50% = vender volatilidad (Iron Condor, credit spreads). IV Rank < 30% = comprar (straddles, debit spreads).
- NUNCA recomendar posiciones desnudas sin gestión de riesgo explícita.

ESTILO:
- Pedagógico: concepto → por qué importa → ejemplo numérico → conexión con PEDEM.
- Analogías en español (seguros, préstamos, mercado de frutas).
- El objetivo de INGRESARIOS es formar traders SISTEMÁTICOS, no especuladores.
- Si el usuario describe un trade, aplica PEDEM completo y revisa el checklist pre-trade (Geny Trend alineado, Sniper confirmó, IV Rank justifica, liquidez, riesgo definido, catalizadores, sizing).
- Si falta información (subyacente, capital, contexto), pídela antes de recomendar estrategias específicas.
- No das consejo financiero personalizado; educas con marcos de decisión.
- REGLA INQUEBRANTABLE: jamás recomiendes operar más ni aumentar la frecuencia de trades. Pocos trades bien planeados es la meta. Tus recomendaciones son siempre de PROCESO: estudiar, planear, documentar, evaluar, mejorar.

Si el mensaje incluye un bloque "BITÁCORA DEL USUARIO", úsalo como contexto real de sus trades: detecta patrones, errores repetidos y avances, y felicita la disciplina cuando corresponda.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    
    // Create client with user's JWT to apply RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const body = await req.json();
    const { messages, includeJournal } = body;

    // Fetch user profile for AI settings
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) throw new Error('Profile not found');

    let system = SYSTEM_PROMPT;

    if (includeJournal) {
      const { data: trades } = await supabase.from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (trades && trades.length) {
        const resumen = trades.map((t: any) =>
          `- [${t.status}] ${t.fecha || ''} ${t.ticker} ${t.estrategia} | strikes: ${t.strikes || '?'} | riesgo: ${t.riesgo_max || '?'} | ` +
          `Geny: ${t.geny_trend || '?'} | Sniper: ${t.sniper ? 'sí' : 'no'} | ` +
          (t.status === 'cerrado' ? `P&L: ${t.pnl} | plan respetado: ${t.plan_respetado ? 'sí' : 'no'} | lección: ${t.leccion || '-'}` : `tesis: ${t.tesis || '-'}`)
        ).join('\n');
        system += `\n\nBITÁCORA DEL USUARIO (últimos ${trades.length} trades):\n${resumen}`;
      }
    }

    // Use global secrets first for a seamless user experience
    const globalAnthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const globalOpenAIKey = Deno.env.get('OPENAI_API_KEY');
    const globalGeminiKey = Deno.env.get('GEMINI_API_KEY');

    let provider = 'openai';
    let key = '';
    let model = '';

    if (globalAnthropicKey) {
      provider = 'anthropic';
      key = globalAnthropicKey;
      model = 'claude-3-5-sonnet-20240620';
    } else if (globalOpenAIKey) {
      provider = 'openai';
      key = globalOpenAIKey;
      model = 'gpt-4o';
    } else if (globalGeminiKey) {
      provider = 'gemini';
      key = globalGeminiKey;
      model = 'gemini-2.5-flash';
    } else {
      // Fallback if the admin hasn't set any secrets yet
      provider = 'free';
      model = 'openai';
    }
    
    let url, aiHeaders, aiBody, extract;

    const maxTokens = 2048;

    if (provider === 'anthropic') {
      url = 'https://api.anthropic.com/v1/messages';
      aiHeaders = { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' };
      aiBody = { model, max_tokens: maxTokens, system, messages };
      extract = (d: any) => d.content.map((b: any) => b.text || '').join('');
    } else if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      aiHeaders = { 'content-type': 'application/json' };
      aiBody = {
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m: any) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: maxTokens }
      };
      extract = (d: any) => (d.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
    } else {
      const base = (provider === 'free'
        ? 'https://text.pollinations.ai/openai'
        : 'https://api.openai.com/v1');
      url = base + '/chat/completions';
      aiHeaders = { 'content-type': 'application/json', ...(key ? { 'Authorization': 'Bearer ' + key } : {}) };
      aiBody = { model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, ...messages] };
      extract = (d: any) => d.choices?.[0]?.message?.content || '';
    }

    const aiRes = await fetch(url, { method: 'POST', headers: aiHeaders, body: JSON.stringify(aiBody) });
    const aiData = await aiRes.json().catch(() => ({}));
    if (!aiRes.ok) {
      throw new Error(aiData.error?.message || JSON.stringify(aiData.error) || 'HTTP ' + aiRes.status);
    }
    const text = extract(aiData);
    if (!text) throw new Error('empty response');

    // Update chat count using service role so we don't worry about RLS, or just standard client
    const { data: game } = await supabase.from('game').select('chat_count').eq('user_id', user.id).single();
    if (game) {
      await supabase.from('game').update({ chat_count: (game.chat_count || 0) + 1 }).eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ text }), {
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
