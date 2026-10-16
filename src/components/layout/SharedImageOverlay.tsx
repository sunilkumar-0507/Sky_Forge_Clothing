import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUI } from '@/store';

/**
 * Card → product-detail shared-element transition.
 *
 * Framer's `layoutId` can't bridge two routes here: the old page unmounts before the
 * new one mounts (AnimatePresence mode="wait") and the scroll position resets in
 * between. So the card records its viewport rect, this fixed overlay holds the image
 * above the route curtain, and the gallery reports its rect on mount — then we FLIP
 * between the two using transforms only.
 */
export function SharedImageOverlay() {
  const shared = useUI((s) => s.sharedImage);
  const setShared = useUI((s) => s.setSharedImage);
  const reduce = useReducedMotion();

  // Safety net: never leave the detail image hidden if the target never reports in.
  useEffect(() => {
    if (!shared) return;
    const t = setTimeout(() => setShared(null), 2500);
    return () => clearTimeout(t);
  }, [shared, setShared]);

  useEffect(() => {
    if (shared && reduce) setShared(null);
  }, [shared, reduce, setShared]);

  if (!shared || reduce) return null;
  const { from, to, src } = shared;

  return createPortal(
    <motion.img
      src={src}
      alt=""
      aria-hidden
      className="pointer-events-none fixed z-[95] object-cover"
      style={{ top: from.top, left: from.left, width: from.width, height: from.height, transformOrigin: '0 0' }}
      initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1 }}
      animate={
        to
          ? {
              x: to.left - from.left,
              y: to.top - from.top,
              scaleX: to.width / from.width,
              scaleY: to.height / from.height,
            }
          : { x: 0, y: 0, scaleX: 1, scaleY: 1 }
      }
      transition={{ duration: to ? 0.9 : 0, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => to && setShared(null)}
    />,
    document.body,
  );
}
