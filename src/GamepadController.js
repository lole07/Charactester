/** Browser Gamepad API adapter. Pair Bluetooth controllers in the OS first. */
const DEFAULT_BUTTON_MAP = {
  0: 'Space', 1: 'KeyC', 2: 'Click', 3: 'KeyE', 4: 'KeyF', 5: 'KeyR',
  6: 'KeyH', 8: 'KeyY', 9: 'KeyT', 10: 'Next', 11: 'Digit5',
  12: 'Digit1', 13: 'Digit3', 14: 'Digit4', 15: 'Digit2'
};

const shortName = (gamepad, max) => (gamepad?.id || 'Mando genérico').replace(/\s*\(.*$/, '').trim().slice(0, max);
const nonStandard = gamepad => (gamepad?.mapping === 'standard' ? '' : ' · mapeo no estándar');

export class GamepadController {
  /**
   * @param {object} options
   * @param {object} [options.config]        deadzone, cameraDeadzone, cameraSpeed, cameraSpeedY, buttonMap
   * @param {(message:string, connected:boolean)=>void} [options.onStatus]  texto del HUD
   * @param {(message:string)=>void} [options.onConnect]     aviso al conectar
   * @param {(message:string)=>void} [options.onDisconnect]  aviso al desconectar
   * @param {()=>void} [options.onActivity]  primera vez que el mando mueve un stick o pulsa un botón
   */
  constructor({ config = {}, onStatus = null, onConnect = null, onDisconnect = null, onActivity = null } = {}) {
    this.config = { deadzone: 0.15, cameraDeadzone: 0.15, cameraSpeed: 3, cameraSpeedY: 2, ...config };
    this.onStatus = onStatus;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onActivity = onActivity;
    this.previousButtons = new Map();
    this.activeIndex = null;
    this.lastStatus = '';
    this.activated = false;
    this.buttonMap = { ...DEFAULT_BUTTON_MAP, ...(config.buttonMap || {}) };
    window.addEventListener('gamepadconnected', event => {
      this.activeIndex = event.gamepad.index;
      this.previousButtons.clear();
      const note = event.gamepad.mapping === 'standard' ? '' : ' (mapeo no estándar, los botones pueden variar)';
      this.onConnect?.(`🎮 Mando conectado: ${shortName(event.gamepad, 36)}${note}`);
      this.rumble(200, 0.4, 0.4);
    });
    window.addEventListener('gamepaddisconnected', event => {
      if (this.activeIndex === event.gamepad.index) this.activeIndex = null;
      this.previousButtons.clear();
      this.onDisconnect?.('🎮 Mando desconectado');
    });
  }

  #status(gamepad) {
    const message = gamepad
      ? `🎮 ${shortName(gamepad, 32)}${nonStandard(gamepad)}`
      : '🎮 Pulsa un botón del mando para detectarlo';
    if (message !== this.lastStatus) {
      this.lastStatus = message;
      this.onStatus?.(message, Boolean(gamepad));
    }
  }

  #axisPair(x, y, deadzone) {
    const magnitude = Math.hypot(x || 0, y || 0);
    if (magnitude < deadzone) return [0, 0];
    const scaled = Math.min(1, (magnitude - deadzone) / (1 - deadzone)) / magnitude;
    return [x * scaled, y * scaled];
  }

  /** Vibración (si el navegador y el mando la soportan). */
  rumble(duration, strong, weak) {
    try {
      const pad = navigator.getGamepads?.()[this.activeIndex];
      const actuator = pad && (pad.vibrationActuator || (pad.hapticActuators && pad.hapticActuators[0]));
      if (actuator?.playEffect) {
        actuator.playEffect('dual-rumble', { duration, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
      }
    } catch (_) { /* sin vibración */ }
  }

  update(_dt, { PAD, pressed, onCamera } = {}) {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(p => p?.connected) : [];
    let pad = null;
    for (const candidate of pads) if (!pad || candidate.timestamp > pad.timestamp) pad = candidate;
    if (!pad) {
      PAD.on = false;
      PAD.x = PAD.y = PAD.sprint = PAD.jump = PAD.dive = 0;
      this.#status(null);
      return;
    }

    this.activeIndex = pad.index;
    PAD.on = true;
    this.#status(pad);
    const [leftX, leftY] = this.#axisPair(pad.axes[0] || 0, pad.axes[1] || 0, this.config.deadzone);
    const [rightX, rightY] = this.#axisPair(pad.axes[2] || 0, pad.axes[3] || 0, this.config.cameraDeadzone);
    PAD.x = leftX;
    PAD.y = leftY;
    onCamera?.(rightX, rightY);

    const button = index => pad.buttons[index];
    PAD.sprint = (button(7)?.value || 0) > 0.4 ? 1 : 0;
    PAD.jump = Boolean(button(0)?.pressed);
    PAD.dive = Boolean(button(1)?.pressed);
    if (!this.activated && (leftX || leftY || pad.buttons.some(b => b.pressed))) {
      this.activated = true;
      this.onActivity?.();
    }
    for (const [indexText, key] of Object.entries(this.buttonMap)) {
      const index = Number(indexText);
      const down = Boolean(button(index)?.pressed);
      const wasDown = Boolean(this.previousButtons.get(index));
      if (down && !wasDown) pressed[key] = 1;
      this.previousButtons.set(index, down);
    }
  }
}
