/** Automatic transfer between perpendicular ledge faces at a shared corner. */
export class CornerTraversalSystem {
  constructor({ THREE, maxGap = 0.82, maxTopDelta = 0.42, minTurn = 0.25 } = {}) {
    if (!THREE) throw new Error('CornerTraversalSystem necesita THREE');
    this.THREE = THREE; this.maxGap = maxGap; this.maxTopDelta = maxTopDelta; this.minTurn = minTurn;
  }

  tryTransition(player, solids, direction) {
    if (!player.b || Math.abs(direction) < 0.01) return false;
    const tangent = new this.THREE.Vector3(player.n.z, 0, -player.n.x).multiplyScalar(Math.sign(direction));
    const probe = player.pos.clone().addScaledVector(tangent, 0.48);
    let best = null;
    for (const box of solids) {
      if (box === player.b || Math.abs(box.top - player.b.top) > this.maxTopDelta) continue;
      const x = Math.max(box.x0, Math.min(box.x1, probe.x));
      const z = Math.max(box.z0, Math.min(box.z1, probe.z));
      const dx = probe.x - x, dz = probe.z - z, distance = Math.hypot(dx, dz);
      if (distance < 0.015 || distance > this.maxGap) continue;
      const normal = new this.THREE.Vector3(dx / distance, 0, dz / distance);
      // A corner transition changes the wall direction; do not snap to a parallel surface.
      if (Math.abs(normal.dot(player.n)) > 1 - this.minTurn) continue;
      const score = distance + Math.abs(box.top - player.b.top);
      if (!best || score < best.score) best = { box, normal, x, z, score };
    }
    if (!best) return false;
    player.b = best.box;
    player.n.copy(best.normal);
    player.pos.x = best.x + best.normal.x * 0.35;
    player.pos.z = best.z + best.normal.z * 0.35;
    player.pos.y = best.box.top - 1.48;
    player.cornerCooldown = 0.18;
    return true;
  }
}
