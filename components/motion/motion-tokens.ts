export const MOTION_EASE = "power2.out";
export const REVEAL_DISTANCE = 24;
export const REVEAL_DURATION = 0.55;
export const REVEAL_STAGGER = 0.08;

export function getRevealStart(amount = 0.2) {
  const viewportOffset = Math.min(92, Math.max(72, Math.round((1 - amount) * 100)));
  return `top ${viewportOffset}%`;
}
