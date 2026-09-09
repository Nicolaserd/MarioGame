export function createEmptyKeys() {
  return {
    left: false, right: false, down: false, jumpQueued: false,
    throwQueued: false, throwHeld: false, utilityQueued: false,
    utilityHeld: false, shieldQueued: false, shieldHeld: false, deathQueued: false,
  }
}

export function clearGameInput(keysRef) {
  keysRef.current = createEmptyKeys()
}
