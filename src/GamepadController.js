/** Browser Gamepad API adapter. Pair Bluetooth controllers in the OS first. */
const DEFAULT_BUTTON_MAP = {
  0: 'Space', 1: 'KeyC', 2: 'Click', 3: 'KeyE', 4: 'KeyF', 5: 'KeyR',
  6: 'KeyH', 8: 'KeyY', 9: 'KeyT', 10: 'Next', 11: 'Digit5',
  12: 'Digit1', 13: 'Digit3', 14: 'Digit4', 15: 'Digit2'
};

export class GamepadController {
  constructor({ config = {}, onStatus = null } = {}) {
    this.config = { deadzone: 0.16, cameraDeadzone: 0.14, cameraSpeed: 3, cameraSpeedY: 2, ...config };
    this.onStatus = onStatus;
    this.previousButtons = new Map();
    this.activeIndex = null;
    this.lastStatus = '';
    this.buttonMap = { ...DEFAULT_BUTTON_MAP, ...(config.buttonMap || {}) };
    window.addEventListener('gamepadconnected', event => {
      this.activeIndex = event.gamepad.index;
      this.previousButtons.clear();
      this.#status(event.gamepad, true);
    });
    window.addEventListener('gamepaddisconnected', event => {
      if (this.activeIndex === event.gamepad.index) this.activeIndex = null;
      this.previousButtons.clear();
      this.onStatus?.('Mando desconectado', false);
    });
  }

  #status(gamepad, connected) {
    const name = gamepad?.id?.trim() || 'Mando genérico';
    const message = connected ? `Mando conectado: ${name}` : 'Mando: buscando…';
    if (message !== this.lastStatus) {
      this.lastStatus = message;
      this.onStatus?.(message, connected);
    }
  }

  #axisPair(x, y, deadzone) {
    const magnitude = Math.min(1, Math.hypot(x || 0, y || 0));
    if (magnitude <= deadzone) return [0, 0];
    const scaled = (magnitude - deadzone) / (1 - deadzone);
    return [(x / magnitude) * scaled, (y / magnitude) * scaled];
  }

  update(_dt, { PAD, pressed, onCamera } = {}) {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
    let pad = this.activeIndex == null ? null : pads[this.activeIndex];
    if (!pad?.connected) pad = pads.find(candidate => candidate?.connected) || null;
    if (!pad) {
      PAD.on = false;
      PAD.x = PAD.y = PAD.sprint = PAD.jump = PAD.dive = 0;
      if (this.lastStatus !== 'Mando: buscando…') this.#status(null, false);
      return;
    }

    this.activeIndex = pad.index;
    PAD.on = true;
    this.#status(pad, true);
    const [leftX, leftY] = this.#axisPair(pad.axes[0] || 0, pad.axes[1] || 0, this.config.deadzone);
    const [rightX, rightY] = this.#axisPair(pad.axes[2] || 0, pad.axes[3] || 0, this.config.cameraDeadzone);
    PAD.x = leftX;
    PAD.y = leftY;
    onCamera?.(rightX, rightY);

    const button = index => pad.buttons[index];
    PAD.sprint = (button(7)?.value || 0) > 0.4 ? 1 : 0;
    PAD.jump = Boolean(button(0)?.pressed);
    PAD.dive = Boolean(button(1)?.pressed);
    for (const [indexText, key] of Object.entries(this.buttonMap)) {
      const index = Number(indexText);
      const down = Boolean(button(index)?.pressed);
      const wasDown = Boolean(this.previousButtons.get(index));
      if (down && !wasDown) pressed[key] = 1;
      this.previousButtons.set(index, down);
    }
  }
}
