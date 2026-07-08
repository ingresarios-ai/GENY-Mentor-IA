# Geny tu Mentor IA — Guía de Deployment

## Requisitos
- Node.js 18+ (usa `fetch` nativo)
- Nada más: sin base de datos externa (v1 guarda en archivos JSON en `data/`, se crea sola al arrancar)

## Arranque local / VPS
```bash
npm install
npm start          # http://localhost:3210
```
Variables de entorno opcionales:
- `PORT` — puerto del servidor (default 3210)
- `ANTHROPIC_API_KEY` — key de Claude si no quieres pegarla en Ajustes

## Configuración inicial (en la app, ⚙️ Ajustes)
1. **Motor de IA de Geny**: elige proveedor.
   - 🆓 Gratis sin key (Pollinations, modelo `openai`) — funciona de inmediato, ideal para demo.
   - Anthropic `claude-sonnet-5` / OpenAI `gpt-4o` / Gemini `gemini-2.5-flash` — pega la key.
   - Compatible OpenAI: OpenRouter (`https://openrouter.ai/api/v1`, modelos free de DeepSeek/Qwen con key gratuita), Groq, u Ollama local (`http://localhost:11434/v1`, sin key).
   - Usa "🔌 Probar motor" para validar.
2. **GoHighLevel** (opcional): Private Integration Token + Location ID + email del contacto → "Probar conexión y crear campos" (crea los 28 custom fields automáticamente).
   - Webhook inbound para compras: apunta tu workflow de GHL a `POST https://TU-DOMINIO/api/ghl/webhook`.

## Deploy en PaaS (URL de demo pública)

El server ya está listo: lee `process.env.PORT`, `process.env.DATA_DIR` (para disco persistente) y arranca con el motor de IA **gratis** por defecto (Geny funciona sin configurar nada). Elige tu plataforma:

### Opción A — Railway (la más rápida, recomendada para demo)
Desde esta carpeta, con la [CLI de Railway](https://docs.railway.app/develop/cli) instalada y logueado (`railway login`):
```bash
railway init                 # crea el proyecto
railway up                   # sube y despliega (autodetecta Node por package.json)
railway domain               # te da la URL pública con HTTPS
```
Persistencia (para que los datos sobrevivan a redeploys): en el dashboard de Railway → tu servicio → **Variables** agrega `DATA_DIR=/data`, y en **Settings → Volumes** monta un volumen en `/data`. (Para una demo efímera puedes saltarte esto; los datos se reinician en cada deploy.)

### Opción B — Render (blueprint incluido)
1. Sube esta carpeta a un repo de GitHub/GitLab (el `.gitignore` ya excluye `node_modules` y `data/`).
2. En Render: **New → Blueprint** → conecta el repo → detecta `render.yaml` (ya trae build, start, `DATA_DIR`, motor gratis y un disco persistente de 1 GB).
3. Deploy. HTTPS y URL automáticos.

### Opción C — Fly.io (Dockerfile incluido)
Con [flyctl](https://fly.io/docs/flyctl/) instalado y logueado:
```bash
fly launch --no-deploy       # detecta el Dockerfile; di NO a bases de datos
fly volumes create geny_data --size 1     # disco persistente
# en fly.toml, monta el volumen:  [mounts]  source="geny_data"  destination="/data"
fly deploy
```

### Notas comunes a las tres
- **HTTPS y dominio**: los da la plataforma. Para dominio propio (ej. `geny.ingresarios.com`) apunta un CNAME según tu PaaS.
- **Motor de IA**: arranca en modo gratis (Pollinations). Para producción, en Ajustes (o por variable `AI_PROVIDER`) pon Claude/GPT/Gemini con tu key — server-side, no del lead.
- **Webhook GHL/Hotmart**: `POST https://TU-URL/api/ghl/webhook`.
- **Persistencia**: sin disco/volumen montado en `DATA_DIR`, los datos (trades, reto, config) se borran en cada redeploy. Aceptable para demo; imprescindible para uso real.

## Seguridad (antes de abrirla a estudiantes)
- Esta v1.1 es **single-user, sin login**: cualquiera con la URL usa la misma cuenta y puede leer/escribir la config (incluidas keys). Para uso personal o demo interna está bien; para estudiantes reales implementa primero auth multi-usuario (ver PRD.md §5.1).
- En producción pasa las keys por variables de entorno, no por Ajustes.
- `data/` contiene información personal y keys: nunca lo subas a un repo público.

## Estructura del paquete
```
server.js        # Backend Express completo (API + proxy IA + GHL + gamificación)
package.json     # Única dependencia: express
public/          # Frontend (index.html, app.js, knowledge.js, style.css)
PRD.md           # Documento de producto: estado actual + roadmap a producción
DEPLOY.md        # Esta guía
```

## Checklist post-deploy
- [ ] La app carga y aparece el onboarding de Geny
- [ ] "Probar motor" responde OK
- [ ] Registrar un trade de prueba → aparece en bitácora y suma XP
- [ ] Share card se genera y descarga
- [ ] (Si GHL) "Ver payload del journey" muestra los 28 campos y el test crea los fields
