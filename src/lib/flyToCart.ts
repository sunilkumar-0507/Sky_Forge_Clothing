import { prefersReducedMotion } from './utils';

/**
 * Clones an image at `from` and flies it in an arc into the visible cart icon
 * (any element with [data-cart-target]). Uses the Web Animations API on
 * transform/opacity only, so it never triggers layout.
 */
export function flyToCart(src: string, from: DOMRect | null) {
  const target = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].find((el) => el.offsetParent !== null);
  if (!target) return;

  const bump = () => {
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(0.92)' }, { transform: 'scale(1)' }],
      { duration: 500, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
  };

  if (!from || from.width === 0 || prefersReducedMotion()) {
    bump();
    return;
  }

  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, 180);
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - (size * 4) / 3 / 2;
  const dx = to.left + to.width / 2 - (startX + size / 2);
  const dy = to.top + to.height / 2 - (startY + (size * 4) / 6);
  const endScale = 28 / size;

  const ghost = document.createElement('img');
  ghost.src = src;
  ghost.alt = '';
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${size}px`,
    height: `${(size * 4) / 3}px`,
    objectFit: 'cover',
    zIndex: '120',
    pointerEvents: 'none',
    borderRadius: '4px',
    boxShadow: '0 20px 40px -10px rgba(0,0,0,.35)',
    willChange: 'transform, opacity',
  });
  document.body.appendChild(ghost);

  const anim = ghost.animate(
    [
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 120}px) scale(${0.6}) rotate(-8deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${endScale}) rotate(0deg)`, opacity: 0.4, offset: 1 },
    ],
    { duration: 900, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'forwards' },
  );
  anim.onfinish = () => {
    ghost.remove();
    bump();
  };
}
