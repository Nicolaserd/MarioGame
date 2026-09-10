export const TRUMP = {
  health: 150, x: 790, width: 114, height: 194,
  rageDuration: 1.8, castDuration: 0.6, defeatDuration: 3,
  patterns: [[0, 1, 2], [2, 1, 0, 2, 0, 1]],
  recovery: [1.15, 0.7], speedMultiplier: [1.1, 1.4],
  windupMultiplier: [1, 0.8], volleySize: [3, 4],
  guardDuration: [1.1, 1.2],
  dodge: {
    cooldown: [3.8, 2.6], lookAhead: [0.46, 0.5], recovery: [0.85, 0.7],
    anticipation: 0.14, duckDuration: 0.9, crouchHeight: 124, windupWindow: 0.5,
    jumpVelocity: 790, jumpAnticipation: 0.14, landingDuration: 0.18,
  },
  intro: '¡Bienvenido a mi torre! El dato perdido es mío. Un dato fantástico. Enorme.',
  phase: '¡Esto necesita más oro! ¡Y un muro mucho más grande!',
  defeat: 'Está bien… quizá la pizza era el mejor trato.',
  attacks: [
    { type: 'contract', label: 'CONTRATOS VOLADORES', hint: 'Agáchate o salta los contratos.', line: '¡Lee la letra pequeña!', windup: 1.15 },
    { type: 'gold', label: 'LLUVIA DE ORO', hint: 'Aléjate de las columnas doradas.', line: '¡Una lluvia de inversiones!', windup: 1.3 },
    { type: 'wall', label: 'EL GRAN MURO', hint: '¡Salta el muro que viene hacia ti!', line: '¡Nadie salta mi muro! …¿Nadie?', windup: 1.15 },
  ],
}
