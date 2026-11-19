/**
 * Automatic ledge acquisition for axis-aligned solid platforms.
 * Uses the same solid AABBs as the legacy collision system; no new input is required.
 */
export class EdgeDetectionSystem {
  constructor({ THREE, reach = 0.72, minHeight = 0.58, maxHeight = 1.88, hangOffset = 1.48 } = {}) {
    if (!THREE) throw new Error('EdgeDetectionSystem necesita THREE');
    this.THREE = THREE;
    this.reach = reach;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.hangOffset = hangOffset;
  }

  detect({ position, velocity, verticalVelocity, yaw, solids }) {
    // Catch only while falling or near the jump apex, never while rising quickly.
    if (verticalVelocity > 2.2) return null;
    const forward = new this.THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    let best = null;
    for (const box of solids) {
      if (!Number.isFinite(box.top) || box.top - position.y < this.minHeight || box.top - position.y > this.maxHeight) continue;
      const x = Math.max(box.x0, Math.min(box.x1, position.x));
      const z = Math.max(box.z0, Math.min(box.z1, position.z));
      const dx = position.x - x, dz = position.z - z;
      const distance = Math.hypot(dx, dz);
      if (distance < 0.015 || distance > this.reach) continue;
      const normal = new this.THREE.Vector3(dx / distance, 0, dz / distance);
      if (normal.dot(forward) < 0.22) continue;
      // Avoid catching the top surface from above: the player must be outside a side face.
      const outsideX = position.x < box.x0 || position.x > box.x1;
      const outsideZ = position.z < box.z0 || position.z > box.z1;
      if (!outsideX && !outsideZ) continue;
      const score = distance + Math.abs((box.top - position.y) - this.hangOffset) * 0.12;
      if (!best || score < best.score) best = { box, normal, anchor: new this.THREE.Vector3(x, 0, z), score };
    }
    return best;
  }

  acquire(player, candidate) {
    if (!candidate) return false;
    player.b = candidate.box;
    player.n.copy(candidate.normal);
    player.pos.set(
      candidate.anchor.x + candidate.normal.x * 0.35,
      candidate.box.top - this.hangOffset,
      candidate.anchor.z + candidate.normal.z * 0.35
    );
    player.vy = 0;
    player.vel.set(0, 0, 0);
    player.st = 'hang';
    player.cornerCooldown = 0.12;
    return true;
  }
}
