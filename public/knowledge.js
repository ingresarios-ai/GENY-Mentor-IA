// Base de conocimiento INGRESARIOS — PEDEM, estrategias, Greeks, glosario, reglas
window.KNOWLEDGE = {

  // Cimientos: para el que arranca de CERO absoluto. "Explícamelo como si tuviera 12 años."
  cimientos: [
    {
      n: 1, icono: '🏢', titulo: '¿Qué es una acción?',
      concepto: 'Una acción es un pedacito de una empresa. Si Apple fuera una pizza de 1,000 millones de rebanadas, una acción es UNA rebanada. Al comprarla, eres dueño de esa parte de Apple.',
      analogia: 'Imagina que tu tío abre una panadería y necesita plata. Te vende el 10% del negocio. Ahora, cuando la panadería gana, tú ganas tu parte; cuando le va mal, tu parte también baja. Eso es una acción: ser dueño de un pedazo.',
      importa: 'Todo lo que hacemos en trading gira alrededor de acciones (o de canastas de acciones). Antes de opciones, tienes que sentir esto: comprar una acción = comprar un pedazo de un negocio real.',
      clave: 'Una acción sube cuando más gente la quiere comprar que vender, y baja cuando pasa lo contrario. No es magia: es oferta y demanda.'
    },
    {
      n: 2, icono: '🌎', titulo: '¿Qué es el mercado y por qué sube y baja?',
      concepto: 'El "mercado" es simplemente millones de personas comprando y vendiendo acciones al mismo tiempo. La bolsa es la plaza de mercado donde todo eso pasa, ordenado y en segundos.',
      analogia: 'Es como el precio del aguacate en la plaza. Si hay cosecha buena y pocos compradores, baja. Si hay escasez y todos quieren guacamole, sube. Las acciones son iguales: el precio es el acuerdo entre el que vende y el que compra, minuto a minuto.',
      importa: 'El novato cree que el mercado "sabe algo" o que hay un plan. No. El precio solo refleja el ánimo de la multitud: miedo o codicia. Entender esto te quita la ansiedad de "adivinar".',
      clave: 'SPY, que verás en todos los ejemplos, es una canasta con las 500 empresas más grandes de EE.UU. juntas. Cuando dicen "el mercado subió", casi siempre hablan de esa canasta.'
    },
    {
      n: 3, icono: '🎟️', titulo: '¿Qué es una opción, en cristiano?',
      concepto: 'Una opción es el DERECHO (no la obligación) de comprar o vender una acción a un precio fijo, antes de una fecha. Pagas una pequeña prima por ese derecho, como una reserva.',
      analogia: 'Ves un apartamento en $100,000. No tienes toda la plata hoy, pero le pagas $2,000 al dueño para "apartarlo": tienes 3 meses para comprarlo a ese precio. Si en ese tiempo sube a $130,000, ejerces tu derecho, pagas los $100,000 pactados y ganaste. Si no te conviene, dejas ir los $2,000 y ya. Esa reserva es una opción (un "call").',
      importa: 'Las opciones te dejan controlar mucho con poco, y definir exactamente cuánto puedes perder. Pero ese mismo poder, mal usado, quema cuentas. Por eso primero el método, después el acelerador.',
      clave: 'CALL = derecho a COMPRAR (apuestas a que sube). PUT = derecho a VENDER (apuestas a que baja o te proteges). Todo el resto son combinaciones de estas dos.'
    },
    {
      n: 4, icono: '🏦', titulo: '¿Qué es un broker y cómo abro el mío?',
      concepto: 'Un broker es la app o plataforma que te conecta con la bolsa. Es tu puerta de entrada: sin broker no puedes comprar ni una acción ni una opción. Tú le das la orden, él la ejecuta en el mercado.',
      analogia: 'Es como Rappi, pero para acciones: tú pides "cómprame 1 de esto", el broker va al mercado, lo trae a tu cuenta y te cobra una pequeña comisión. Nada más.',
      importa: 'Elegir un broker serio y regulado es tu primera decisión de seguridad. Para opciones necesitas uno que las permita y que te "apruebe" un nivel de opciones (te lo dan respondiendo un formulario de experiencia).',
      clave: 'Empieza con una cuenta de práctica (paper trading): operas con dinero ficticio, en el mercado real, sin arriesgar un peso. En la app puedes registrar esos trades de práctica igual — el hábito vale lo mismo. Pregúntale a Geny cuál broker te conviene según tu país.'
    },
    {
      n: 5, icono: '🛡️', titulo: 'Riesgo: la primera regla antes de tocar dinero',
      concepto: 'En el mercado, perder es parte del juego — hasta los mejores pierden en muchos trades. La diferencia entre el que sobrevive y el que quiebra no es acertar más: es perder POCO cuando se equivoca.',
      analogia: 'Piensa en un casino, pero tú eres la casa. La casa pierde manos individuales todo el tiempo, y aun así siempre gana al final. ¿Por qué? Porque nunca apuesta demasiado en una sola mano. Tú vas a hacer lo mismo con tu capital.',
      importa: 'El 90% de los novatos no muere por no saber análisis técnico. Muere por apostar demasiado a una sola idea "segura" que salió mal. El tamaño de tu apuesta importa más que tu acierto.',
      clave: 'La regla de oro que verás todo el reto: nunca arriesgues más del 2-5% de tu capital en un solo trade. Con eso, necesitas equivocarte MUCHAS veces seguidas para hacerte daño. Ahora sí, estás listo para el Día 1. 🚀'
    }
  ],

  pedem: [
    {
      letra: 'P', nombre: 'PLANEAR', color: '#00e676',
      desc: 'Antes de arriesgar un dólar, el trade existe en papel.',
      items: [
        'Tesis de mercado: ¿direccional, neutral o de volatilidad?',
        'Estrategia seleccionada según Geny Trend + Reditum Sniper',
        'Strikes y expiración definidos',
        'Riesgo máximo y objetivo de ganancia calculados',
        'Condiciones de entrada (precio, IV Rank, catalizadores)',
        'Condición de invalidación escrita'
      ]
    },
    {
      letra: 'E', nombre: 'EJECUTAR', color: '#00b0ff',
      desc: 'Disciplina: solo se entra cuando el plan lo dice.',
      items: [
        'Señal Geny Trend confirmada (tendencia)',
        'Reditum Sniper confirmó la entrada precisa',
        'Tipo de orden decidido: limit vs market, legs simultáneos vs escalados',
        'Trade registrado en la bitácora al momento de entrar'
      ]
    },
    {
      letra: 'D', nombre: 'DOCUMENTAR', color: '#ffd600',
      desc: 'Lo que no se documenta, no se puede mejorar.',
      items: [
        'Captura de la cadena de opciones al momento de entrada',
        'Greeks en entrada (Δ, Γ, Θ, ν)',
        'Costo de la posición o crédito recibido',
        'Screenshots del setup con indicadores'
      ]
    },
    {
      letra: 'E', nombre: 'EVALUAR', color: '#ff6e40',
      desc: 'El resultado importa menos que el proceso.',
      items: [
        '¿Se respetó el plan?',
        'P&L vs objetivo planteado',
        'Comportamiento de los Greeks durante el trade',
        'Impacto de la IV en el resultado'
      ]
    },
    {
      letra: 'M', nombre: 'MEJORAR', color: '#e040fb',
      desc: 'Cada trade deja una lección que se convierte en regla.',
      items: [
        'Ajustar criterios de selección de strike',
        'Optimizar timing con los indicadores',
        'Refinar la gestión de la posición',
        'Convertir la lección en una regla escrita'
      ]
    }
  ],

  checklistPreTrade: [
    '¿Está alineado con la tendencia en Geny Trend?',
    '¿Confirmó Reditum Sniper la entrada?',
    '¿El IV Rank justifica la estrategia (comprar o vender volatilidad)?',
    '¿El spread bid-ask permite una entrada eficiente?',
    '¿Se definió el riesgo máximo?',
    '¿Revisaste catalizadores próximos (earnings, FOMC, datos)?',
    '¿Cumple con las reglas de sizing de capital (2-5% por trade)?'
  ],

  estrategias: [
    {
      nombre: 'Bull Call Spread', tipo: 'Alcista', costo: 'Débito',
      estructura: 'Comprar Call (strike bajo) + Vender Call (strike alto)',
      maxProfit: '(Strike alto − Strike bajo) − Débito', maxLoss: 'Débito pagado',
      breakeven: 'Strike bajo + Débito',
      ejemplo: 'SPY a $500: compras 500C por $5.00, vendes 510C por $2.50. Débito $2.50 ($250/contrato). Max profit $750 si SPY > $510. Breakeven $502.50.',
      cuando: 'Geny Trend alcista moderado; quieres limitar riesgo vs. call largo.'
    },
    {
      nombre: 'Bear Put Spread', tipo: 'Bajista', costo: 'Débito',
      estructura: 'Comprar Put (strike alto) + Vender Put (strike bajo)',
      maxProfit: '(Strike alto − Strike bajo) − Débito', maxLoss: 'Débito pagado',
      breakeven: 'Strike alto − Débito',
      ejemplo: 'SPY a $500: compras 500P por $5.00, vendes 490P por $2.50. Débito $2.50. Max profit $750 si SPY < $490. Breakeven $497.50.',
      cuando: 'Geny Trend bajista con riesgo definido.'
    },
    {
      nombre: 'Iron Condor', tipo: 'Neutral / Income', costo: 'Crédito',
      estructura: 'Bull Put Spread (lado bajo) + Bear Call Spread (lado alto): 4 legs OTM',
      maxProfit: 'Crédito recibido (precio entre strikes cortos)', maxLoss: 'Ancho del spread − Crédito',
      breakeven: 'Put corto − crédito | Call corto + crédito',
      ejemplo: 'SPY a $500, IV Rank 65%: vendes 480P/compras 475P (+$1.20), vendes 520C/compras 525C (+$1.10). Crédito total $2.30. Max loss $2.70. Rango ganador $482.30–$522.30.',
      cuando: 'Mercado lateral con IV Rank > 50%. Cerrar al 50% del crédito; ajustar el lado amenazado.'
    },
    {
      nombre: 'Covered Call', tipo: 'Income', costo: 'Crédito',
      estructura: 'Tener 100 acciones + Vender 1 Call OTM',
      maxProfit: 'Prima + (Strike − precio de compra)', maxLoss: 'Caída de la acción − prima',
      breakeven: 'Precio de compra − prima',
      ejemplo: 'AAPL a $185 con 100 acciones: vendes 190C (30 DTE) por $2.50 → $250/mes de income. Si AAPL > $190, se venden las acciones a $190.',
      cuando: 'Income mensual sobre portafolio. Solo en acciones que no te importaría vender al strike.'
    },
    {
      nombre: 'Cash-Secured Put', tipo: 'Alcista / Income', costo: 'Crédito',
      estructura: 'Vender Put OTM con efectivo reservado para comprar las acciones',
      maxProfit: 'Crédito recibido', maxLoss: 'Strike − crédito (si la acción cae a 0)',
      breakeven: 'Strike − crédito',
      ejemplo: 'AAPL a $185: vendes 180P (30 DTE) por $2.00. Si AAPL > $180 te quedas los $200. Si cae, compras 100 acciones a costo efectivo $178.',
      cuando: 'Quieres entrar a la acción a precio menor mientras cobras premium.'
    },
    {
      nombre: 'Long Straddle', tipo: 'Volatilidad', costo: 'Débito',
      estructura: 'Comprar Call ATM + Comprar Put ATM (mismo strike y expiración)',
      maxProfit: 'Ilimitado (movimiento grande en cualquier dirección)', maxLoss: 'Débito total',
      breakeven: 'Strike ± Débito',
      ejemplo: 'NVDA a $800 antes de earnings: compras 800C + 800P por $40 total. Breakevens $840 / $760. Ganas si NVDA se mueve >5% en cualquier dirección.',
      cuando: 'Antes de earnings o evento de alta volatilidad con IV Rank bajo (<30%). Cuidado con el IV crush.'
    },
    {
      nombre: 'Calendar Spread', tipo: 'Neutral', costo: 'Débito',
      estructura: 'Vender opción próxima + Comprar opción lejana, mismo strike',
      maxProfit: 'Máximo si el precio queda en el strike al vencer la corta', maxLoss: 'Débito pagado',
      breakeven: 'Depende de la IV de la opción larga',
      ejemplo: 'Aprovecha el diferencial de theta: la opción corta decae más rápido que la larga.',
      cuando: 'Mercado lateral, IV baja a corto plazo y alta a largo plazo.'
    },
    {
      nombre: 'Poor Man’s Covered Call (Diagonal)', tipo: 'Alcista / Income', costo: 'Débito',
      estructura: 'Comprar LEAP call deep ITM (Δ ~0.80) + Vender monthly call OTM contra ella',
      maxProfit: 'Similar a covered call con menos capital', maxLoss: 'Débito del LEAP − créditos cobrados',
      breakeven: 'Costo neto del LEAP',
      ejemplo: 'Simula un covered call usando un LEAP en lugar de 100 acciones — mucho menos capital.',
      cuando: 'Quieres income tipo covered call sin comprar las acciones.'
    }
  ],

  selector: [
    { outlook: 'Alcista fuerte', iv: 'bajo', estrategias: ['Long Call', 'Bull Call Spread'] },
    { outlook: 'Alcista moderado', iv: 'alto', estrategias: ['Bull Put Spread', 'Cash-Secured Put'] },
    { outlook: 'Bajista fuerte', iv: 'bajo', estrategias: ['Long Put', 'Bear Put Spread'] },
    { outlook: 'Bajista moderado', iv: 'alto', estrategias: ['Bear Call Spread'] },
    { outlook: 'Neutral', iv: 'alto', estrategias: ['Iron Condor', 'Short Strangle (con gestión)'] },
    { outlook: 'Neutral', iv: 'bajo', estrategias: ['Calendar Spread'] },
    { outlook: 'Gran movimiento esperado', iv: 'bajo', estrategias: ['Long Straddle', 'Long Strangle'] },
    { outlook: 'Poseo acciones', iv: 'alto', estrategias: ['Covered Call'] }
  ],

  greeks: [
    {
      nombre: 'Delta (Δ)', apodo: 'El GPS de la opción',
      def: 'Cambio en el precio de la opción por cada $1 de movimiento del subyacente. Calls: 0 a +1. Puts: −1 a 0. ATM ≈ ±0.50.',
      claves: [
        '|Delta| ≈ probabilidad aproximada de expirar ITM (0.30 Δ ≈ 30%)',
        'Vender puts de 0.20–0.30 Δ da probabilidad favorable',
        'Regla INGRESARIOS: estrategias neutrales con delta total < |0.15| del portafolio',
        'Spreads direccionales: opción larga con Δ 0.40–0.60'
      ]
    },
    {
      nombre: 'Gamma (Γ)', apodo: 'La aceleración del Delta',
      def: 'Velocidad a la que cambia el Delta por cada $1 de movimiento. Máximo cerca de ATM y cerca de expiración.',
      claves: [
        'Gamma risk: cerca de expiración, movimientos pequeños = cambios grandes de delta',
        'Vendedores tienen gamma negativo: ganan con el tiempo, no con el movimiento',
        'Regla INGRESARIOS: evitar alto gamma negativo los últimos 5-7 días si el precio está cerca de strikes cortos',
        'Reducir posiciones con gamma significativo antes de fines de semana y feriados'
      ]
    },
    {
      nombre: 'Theta (Θ)', apodo: 'Tu amigo (o enemigo)',
      def: 'Cuánto valor pierde la opción por cada día que pasa. Negativo para compradores, positivo para vendedores. El decay NO es lineal: ~50% del valor se pierde en el último 30% de la vida.',
      claves: [
        'Credit spreads e Iron Condors: Θ trabaja a tu favor cada día',
        'Income trading: objetivo Θ/día > 0.5% del riesgo máximo',
        'Cerrar al 50% del crédito antes de que Gamma compense las ganancias de Theta',
        'Ejemplo: Iron Condor crédito $2.30, Θ $0.12/día → cerrar cuando valga $1.15'
      ]
    },
    {
      nombre: 'Vega (ν)', apodo: 'El Greek de la volatilidad',
      def: 'Cambio en el precio de la opción por cada 1% de cambio en IV. Positivo para compradores, negativo para vendedores. Máximo en opciones con más tiempo (LEAPs).',
      claves: [
        'IV Rank > 50%: VENDER volatilidad (Iron Condor, credit spreads)',
        'IV Rank < 30%: COMPRAR volatilidad (straddles, debit spreads)',
        'IV Crush: tras earnings la IV cae en picada — puedes perder aunque el precio se mueva a tu favor',
        'IV Rank = posición de la IV actual en el rango de 52 semanas'
      ]
    },
    {
      nombre: 'Rho (ρ)', apodo: 'El olvidado',
      def: 'Sensibilidad a las tasas de interés. Relevante en LEAPs y entornos de tasas altas.',
      claves: ['Casi irrelevante en opciones de corto plazo', 'Considerarlo al comprar LEAPs de más de 1 año']
    }
  ],

  reglas: {
    sizing: [
      'Máximo 2-5% del capital por trade',
      'Máximo 20% del capital en opciones simultáneamente',
      'Preferir riesgo definido: spreads antes que posiciones desnudas'
    ],
    stopLoss: [
      'Cerrar si la posición pierde 2x el crédito recibido (credit spreads)',
      'Cerrar si el Delta supera el umbral predefinido (posiciones neutrales)',
      'Stop temporal: cerrar antes de catalizadores no planificados'
    ],
    takeProfit: [
      'Credit spreads: cerrar al 50-75% del crédito máximo recibido',
      'Debit spreads: cerrar al alcanzar 100-150% de lo pagado',
      'Ajustar parcialmente al alcanzar 50% de ganancia'
    ],
    tiempo: [
      'Opciones vendidas: entrar en 30-45 DTE, cerrar a 21 DTE',
      'Opciones compradas direccionales: expiración > 60 DTE',
      'Evitar posiciones en semana de expiración salvo estrategia específica'
    ]
  },

  glosario: [
    ['ATM (At The Money)', 'Strike igual (o muy cercano) al precio actual del subyacente. "En el dinero."'],
    ['American style', 'Opción ejercible en cualquier momento antes del vencimiento. La mayoría de acciones individuales.'],
    ['Bid/Ask Spread', 'Diferencia entre precio de compra y venta. Spread amplio = poca liquidez — evitar.'],
    ['Black-Scholes', 'Modelo matemático para valorar opciones. Base de los Greeks teóricos.'],
    ['Breakeven', 'Precio del subyacente al que la estrategia no gana ni pierde al vencimiento.'],
    ['Call', 'Derecho (no obligación) de COMPRAR el subyacente al strike antes del vencimiento.'],
    ['Contrato', 'Una opción representa 100 acciones del subyacente.'],
    ['Credit Spread', 'Estrategia donde recibes dinero al entrar. Objetivo: que las opciones venzan sin valor.'],
    ['Debit Spread', 'Estrategia donde pagas al entrar. Objetivo: que el subyacente se mueva a tu favor.'],
    ['DTE (Days To Expiration)', 'Días restantes al vencimiento. Clave para la gestión de posición.'],
    ['European style', 'Solo ejercible al vencimiento. Índices como SPX, VIX.'],
    ['Expiración / Vencimiento', 'Fecha en que la opción deja de existir. Tercer viernes del mes para mensuales estándar.'],
    ['Greeks', 'Delta, Gamma, Theta, Vega, Rho — el tablero de instrumentos del trader de opciones.'],
    ['ITM (In The Money)', 'Call: precio > strike. Put: precio < strike. Tienen valor intrínseco.'],
    ['IV (Volatilidad Implícita)', 'Expectativa del mercado sobre la volatilidad futura. Afecta directamente el precio de las opciones.'],
    ['IV Crush', 'Caída abrupta de IV tras un evento (earnings). Las opciones pierden valor rápidamente.'],
    ['IV Rank', 'Posición de la IV actual en el rango de 52 semanas (0% = mínimo, 100% = máximo del año).'],
    ['LEAP', 'Opción con vencimiento > 1 año. Útil para largo plazo y Poor Man’s Covered Call.'],
    ['Legs', 'Componentes individuales de una estrategia multi-parte. Un Iron Condor tiene 4 legs.'],
    ['Liquidez', 'Facilidad de entrar y salir. Preferir alto volumen y open interest.'],
    ['Max Loss', 'Pérdida máxima posible. SIEMPRE calcularla antes de entrar.'],
    ['Max Profit', 'Ganancia máxima posible de una estrategia.'],
    ['OI (Open Interest)', 'Contratos abiertos en circulación. Alto OI = mayor liquidez.'],
    ['OTM (Out of The Money)', 'Call: strike > precio. Put: strike < precio. Solo valor extrínseco (temporal).'],
    ['Premium / Prima', 'Precio de la opción. Lo que paga el comprador o recibe el vendedor.'],
    ['Put', 'Derecho (no obligación) de VENDER el subyacente al strike antes del vencimiento.'],
    ['Put-Call Parity', 'Relación matemática entre puts y calls del mismo strike/vencimiento.'],
    ['Roll / Rodar', 'Cerrar una posición próxima a vencer y abrir otra más lejana (y quizá otro strike).'],
    ['Risk/Reward', 'Relación entre riesgo máximo y beneficio potencial.'],
    ['Skew', 'Diferencia de IV entre puts y calls. Los puts suelen tener mayor IV por demanda de protección.'],
    ['Strike / Precio de ejercicio', 'Precio al que la opción permite comprar o vender el subyacente.'],
    ['Subyacente / Underlying', 'Activo sobre el que se basa la opción (acción, ETF, índice).'],
    ['Theta Decay', 'Pérdida de valor temporal con el paso del tiempo. Acelera cerca del vencimiento.'],
    ['Time Value', 'Parte del precio que refleja el tiempo restante. Decrece hacia cero al vencimiento.'],
    ['Vega', 'Sensibilidad al cambio en IV. Alto vega = reacciona mucho a la volatilidad.'],
    ['Vertical Spread', 'Dos opciones del mismo tipo, subyacente y vencimiento, distinto strike.'],
    ['Wheel Strategy', 'Ciclo: Cash-Secured Put → (si ejercen) Covered Call → repetir. Income continuo.']
  ],

  estrategiasLista: [
    'Long Call', 'Long Put', 'Bull Call Spread', 'Bear Put Spread', 'Bull Put Spread',
    'Bear Call Spread', 'Iron Condor', 'Iron Butterfly', 'Covered Call', 'Cash-Secured Put',
    'Long Straddle', 'Long Strangle', 'Short Strangle', 'Calendar Spread', 'Diagonal / PMCC',
    'Collar', 'Otra'
  ]
};
