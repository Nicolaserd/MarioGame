export const TRUMP = {
  health: 120, x: 790, width: 114, height: 194,
  rageDuration: 1.8, castDuration: 0.6, defeatDuration: 3,
  intro: '¡Bienvenido a mi torre! El dato perdido es mío. Un dato fantástico. Enorme.',
  phase: '¡Esto necesita más oro! ¡Y un muro mucho más grande!',
  defeat: 'Está bien… quizá la pizza era el mejor trato.',
  attacks: [
    { type: 'contract', label: 'CONTRATOS VOLADORES', hint: 'Agáchate o salta los contratos.', line: '¡Lee la letra pequeña!', windup: 1.15 },
    { type: 'gold', label: 'LLUVIA DE ORO', hint: 'Aléjate de las columnas doradas.', line: '¡Una lluvia de inversiones!', windup: 1.3 },
    { type: 'wall', label: 'EL GRAN MURO', hint: '¡Salta el muro que viene hacia ti!', line: '¡Nadie salta mi muro! …¿Nadie?', windup: 1.15 },
  ],
}
