/**
 * Reusable Three.js actor/animation controller for the Cyborg GLB.
 * The gameplay simulation (movement, combat, AI, vehicles and collisions)
 * remains in main.js during this compatibility-first modularization pass.
 */
export class CyborgController {
  constructor(model, { THREE, config = {}, clips = [], onAnimation = null } = {}) {
    if (!model || !THREE) throw new Error('CyborgController necesita un modelo y THREE');
    this.THREE = THREE;
    this.config = config;
    this.clips = clips;
    this.onAnimation = onAnimation;
    this.root = new THREE.Group();
    this.root.add(model);
    this.mx = new THREE.AnimationMixer(model);
    this.cache = new Map();
    this.cur = null;
    this.name = '';
    this.model = model;
  }

  play(name, options = {}) {
    const clip = this.clips[name];
    if (!clip) return false;
    let action = this.cache.get(name);
    if (!action) {
      action = this.mx.clipAction(clip);
      this.cache.set(name, action);
    }
    const once = Boolean(options.once);
    action.setLoop(once ? this.THREE.LoopOnce : this.THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = once;
    action.timeScale = (options.ts ?? 1) * (this.config.anim ?? 1);
    if (this.cur === action && !options.restart) return true;
    action.reset().play();
    if (this.cur && this.cur !== action) {
      this.cur.crossFadeTo(action, options.fade ?? this.config.fade ?? 0.14, false);
    }
    this.cur = action;
    this.name = name;
    this.onAnimation?.(name, this);
    return true;
  }

  update(deltaSeconds) {
    this.mx.update(deltaSeconds);
  }

  setConfig(nextConfig = {}) {
    this.config = nextConfig;
    return this;
  }

  getAnimationNames() {
    return Object.keys(this.clips).sort((a, b) => a.localeCompare(b));
  }

  dispose({ disposeMaterials = false } = {}) {
    this.mx.stopAllAction();
    this.cache.clear();
    if (disposeMaterials) {
      this.model?.traverse?.(object => {
        if (!object.isMesh) return;
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material?.dispose?.());
      });
    }
    this.root.removeFromParent();
  }
}
