export const SYT_LINES = {
  intro: '¡Mario! ¡Ese dato no tiene permiso de salida!',
  low: '¡Te mando un adjunto… por el suelo!',
  high: '¡A ver si esquivas este correo prioritario!',
  minion: '¡Soporte! ¡Ciérrenle el ticket!',
  obstacle: '¡Activando el protocolo de tropiezos!',
  platform: '¡Ni saltando te libras de la auditoría!',
  dodge: '¡Eso no estaba en el manual!',
  hit: '¡Ja, ja! Error de usuario.',
  won: '¡Vuelve! ¡Nos falta la encuesta de satisfacción!',
  lost: 'Papelera vaciada. ¡Qué eficiencia la mía!',
}

export function setSytReaction(state, pose, line, duration = 2.1) {
  state.boss.pose = pose
  state.boss.poseTime = duration
  state.speech = line
  state.speechTime = duration
}

export function stepSyt(state, dt) {
  state.boss.poseTime = Math.max(0, state.boss.poseTime - dt)
  if (!state.boss.poseTime) state.boss.pose = 'run'
  state.speechTime = Math.max(0, state.speechTime - dt)
  if (!state.speechTime) state.speech = ''
  state.boss.x = state.player.x - state.gap - 130
}
