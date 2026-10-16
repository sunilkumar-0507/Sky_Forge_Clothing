import { AnimatePresence } from 'framer-motion';
import { Lock, Tag } from 'lucide-react';
import { useState } from 'react';
import { CartLineItem, EmptyCart, FreeShippingBar } from '@/components/cart/CartContents';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Carousel } from '@/components/ui/Carousel';
import { RevealText } from '@/components/ui/Reveal';
import { SHOP } from '@/config/env';
import { useDocumentTitle } from '@/hooks/dom';
import { useProducts } from '@/hooks/queries';
import { formatINR } from '@/lib/utils';
import { cartCount, cartSubtotal, toast, useCart } from '@/store';

export default function Cart() {
  useDocumentTitle('Your bag');
  const lines = useCart((s) => s.lines);
  const count = useCart(cartCount);
  const subtotal = useCart(cartSubtotal);
  const [promo, setPromo] = useState('');
  const { data: recs } = useProducts({ tag: 'bestseller', pageSize: 8 });
  const shipping = subtotal >= SHOP.freeShippingThreshold || subtotal === 0 ? 0 : SHOP.standardShipping;
  const savings = lines.reduce((s, l) => s + ((l.compareAtPrice ?? l.price) - l.price) * l.quantity, 0);

  return (
    <PageTransition>
      <section className="container-x pb-20 pt-24 md:pb-24 md:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <RevealText as="h1" text="Your bag" immediate delay={0.3} className="h-display text-[clamp(2.75rem,13vw,6rem)]" />
          <p className="text-sm text-muted">{count} items</p>
        </div>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-10 md:mt-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <FreeShippingBar subtotal={subtotal} className="mb-8 max-w-md" />
              <ul className="border-t border-line pt-6">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <CartLineItem key={l.key} line={l} size="lg" />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <aside className="lg:col-span-4">
              <div className="bg-bone-dark/60 p-5 sm:p-6 md:p-8 lg:sticky lg:top-28">
                <p className="h-display text-2xl">Summary</p>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{formatINR(subtotal)}</dd>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-ember-dark">
                      <dt>You save</dt>
                      <dd>−{formatINR(savings)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd>{shipping === 0 ? 'Free' : formatINR(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
                    <dt>Total</dt>
                    <dd>{formatINR(subtotal + shipping)}</dd>
                  </div>
                  <p className="text-xs text-muted">Inclusive of GST</p>
                </dl>
                <form
                  className="mt-6 flex border-b border-line"
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({ title: 'Promo codes are coming soon', description: `“${promo}” isn’t active in the demo.`, variant: 'error' });
                  }}
                >
                  <Tag className="mr-2 mt-3 h-4 w-4 text-muted" />
                  <input value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} placeholder="Promo code" className="flex-1 bg-transparent py-2.5 text-sm uppercase placeholder:normal-case focus:outline-none" aria-label="Promo code" />
                  <button className="text-xs font-medium uppercase tracking-wider disabled:text-muted" disabled={!promo}>
                    Apply
                  </button>
                </form>
                <Button to="/checkout" full size="lg" magnetic className="mt-8" icon={<Lock className="h-4 w-4" />}>
                  Secure checkout
                </Button>
                <p className="mt-4 text-center text-xs text-muted">UPI · Cards · Netbanking · Cash on delivery</p>
              </div>
            </aside>
          </div>
        )}
      </section>

      {recs && (
        <section className="container-x pb-28">
          <Carousel title={<RevealText as="h2" text="Before you go" className="h-display text-4xl md:text-6xl" />}>
            {recs.items.map((p) => (
              <ProductCard key={p.id} product={p} context="cart" />
            ))}
          </Carousel>
        </section>
      )}
    </PageTransition>
  );
}
