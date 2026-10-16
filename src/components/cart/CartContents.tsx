import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Price, QuantityStepper } from '@/components/ui/Bits';
import { SHOP } from '@/config/env';
import { cn, EASE, formatINR } from '@/lib/utils';
import { cartSubtotal, useCart, type CartLine } from '@/store';

export function FreeShippingBar({ subtotal, className }: { subtotal: number; className?: string }) {
  const remaining = Math.max(0, SHOP.freeShippingThreshold - subtotal);
  const pct = Math.min(1, subtotal / SHOP.freeShippingThreshold);
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-xs">
        <Truck className="h-4 w-4" />
        {remaining > 0 ? (
          <span>
            You’re <strong>{formatINR(remaining)}</strong> away from free shipping
          </span>
        ) : (
          <span>
            <strong>Free shipping</strong> unlocked
          </span>
        )}
      </p>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-line">
        <motion.div
          className={cn('h-full origin-left rounded-full', remaining > 0 ? 'bg-ink' : 'bg-ember')}
          initial={false}
          animate={{ scaleX: pct }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

export function CartLineItem({ line, onNavigate, size = 'sm' }: { line: CartLine; onNavigate?: () => void; size?: 'sm' | 'lg' }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.45, ease: EASE } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="overflow-hidden border-b border-line py-5 first:pt-0"
    >
      <div className="flex gap-4">
        <Link to={`/product/${line.slug}`} onClick={onNavigate} className={cn('shrink-0 overflow-hidden bg-bone-dark', size === 'lg' ? 'w-24 sm:w-28 md:w-36' : 'w-20 sm:w-24')}>
          <img src={line.image} alt={line.name} className="aspect-[3/4] h-full w-full object-cover" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/product/${line.slug}`} onClick={onNavigate} className="link-underline truncate text-sm font-medium">
                {line.name}
              </Link>
              <p className="mt-1 text-xs text-muted">
                {line.color} · {line.size}
              </p>
            </div>
            <button onClick={() => remove(line.key)} aria-label={`Remove ${line.name}`} className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-ink/5" data-cursor="link">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
            <QuantityStepper size="sm" value={line.quantity} onChange={(q) => setQuantity(line.key, q)} />
            <Price price={line.price * line.quantity} compareAt={line.compareAtPrice ? line.compareAtPrice * line.quantity : undefined} className="text-sm" />
          </div>
        </div>
      </div>
    </motion.li>
  );
}

export function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-16 text-center">
      <motion.div
        className="grid h-20 w-20 place-items-center rounded-full bg-bone-dark"
        animate={{ rotate: [0, -8, 8, -4, 0] }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <ShoppingBag className="h-8 w-8" strokeWidth={1.4} />
      </motion.div>
      <p className="h-display mt-6 text-3xl">Your bag is empty</p>
      <p className="mt-2 max-w-xs text-sm text-muted">Nothing here yet. The new drop is a good place to start.</p>
      <div onClick={onNavigate} className="mt-8">
        <Button to="/shop?tag=new" magnetic>
          Shop the new drop
        </Button>
      </div>
    </motion.div>
  );
}

/** Body of the slide-out cart drawer. */
export function CartDrawerBody({ onClose }: { onClose: () => void }) {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart(cartSubtotal);

  return (
    <>
      <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">
        <p className="h-display text-2xl">
          Bag <sup className="text-xs text-muted">({lines.reduce((n, l) => n + l.quantity, 0)})</sup>
        </p>
      </div>
      {lines.length === 0 ? (
        <div className="flex-1 overflow-y-auto px-5 sm:px-6">
          <EmptyCart onNavigate={onClose} />
        </div>
      ) : (
        <>
          <FreeShippingBar subtotal={subtotal} className="border-b border-line px-5 py-4 sm:px-6" />
          <ul className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 sm:px-6">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <CartLineItem key={l.key} line={l} onNavigate={onClose} />
              ))}
            </AnimatePresence>
          </ul>
          <div className="pb-safe border-t border-line px-5 pt-5 sm:px-6">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping & taxes calculated at checkout</p>
            <div className="mt-5 grid gap-2" onClick={onClose}>
              <Button to="/checkout" full size="lg">
                Checkout
              </Button>
              <Button to="/cart" full variant="outline">
                View bag
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
