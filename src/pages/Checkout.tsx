import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Banknote, Check, ChevronDown, CreditCard, Lock, ShoppingBag, Smartphone, Truck, Zap } from 'lucide-react';
import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { EmptyCart } from '@/components/cart/CartContents';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { SHOP } from '@/config/env';
import { useDocumentTitle } from '@/hooks/dom';
import { useCreateOrder } from '@/hooks/queries';
import { cn, EASE, formatINR } from '@/lib/utils';
import { cartSubtotal, toast, useCart } from '@/store';
import type { Order } from '@/types';

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'];

const addressSchema = z.object({
  email: z.string().email('Enter a valid email'),
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number')),
  line1: z.string().min(5, 'Enter your street address'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(1, 'Choose a state'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a 6-digit PIN code'),
});
type AddressForm = z.input<typeof addressSchema>;

const shippingSchema = z.object({ method: z.enum(['standard', 'express']) });
type ShippingForm = z.infer<typeof shippingSchema>;

const paymentSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('upi'), upiId: z.string().regex(/^[\w.-]{2,}@[a-z]{2,}$/i, 'Enter a valid UPI ID, e.g. name@okbank') }),
  z.object({
    method: z.literal('card'),
    cardNumber: z.string().transform((v) => v.replace(/\s/g, '')).pipe(z.string().regex(/^\d{16}$/, 'Card number must be 16 digits')),
    cardName: z.string().min(2, 'Name on card'),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'MM/YY'),
    cvv: z.string().regex(/^\d{3}$/, '3 digits'),
  }),
  z.object({ method: z.literal('cod') }),
]);
type PaymentForm = z.input<typeof paymentSchema>;

const STEPS = ['Address', 'Shipping', 'Payment', 'Review'] as const;
const SHIPPING_LABEL = { standard: 'Standard (3–5 days)', express: 'Express (1–2 days)' } as const;

const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -60 }),
};

export default function Checkout() {
  useDocumentTitle('Checkout');
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(cartSubtotal);
  const createOrder = useCreateOrder();
  const [[step, dir], setStep] = useState<[number, number]>([0, 1]);
  const [address, setAddress] = useState<z.output<typeof addressSchema> | null>(null);
  const [shipping, setShipping] = useState<ShippingForm>({ method: 'standard' });
  const [payment, setPayment] = useState<z.output<typeof paymentSchema> | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);

  const go = (to: number) => setStep([to, to > step ? 1 : -1]);
  const shippingCost = shipping.method === 'express' ? SHOP.expressShipping : subtotal >= SHOP.freeShippingThreshold ? 0 : SHOP.standardShipping;

  if (placed) return <Success order={placed} />;
  if (!lines.length)
    return (
      <PageTransition footer={false}>
        <div className="container-x pt-28">
          <EmptyCart />
        </div>
      </PageTransition>
    );

  const placeOrder = () => {
    if (!address || !payment) return;
    createOrder.mutate(
      {
        items: lines.map((l) => ({ productId: l.productId, color: l.color, size: l.size, quantity: l.quantity, unitPrice: l.price })),
        shippingAddress: { ...address },
        shippingMethod: SHIPPING_LABEL[shipping.method],
        paymentMethod: payment.method,
      },
      {
        onSuccess: (order) => {
          setPlaced(order);
          clear();
          window.scrollTo(0, 0);
        },
        onError: () => toast({ title: 'Could not place order', description: 'Please try again in a moment.', variant: 'error' }),
      },
    );
  };

  return (
    <PageTransition footer={false}>
      <div className="container-x grid grid-cols-1 gap-12 pb-24 pt-20 md:pt-32 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <MobileSummary lines={lines} total={subtotal + (step < 1 ? 0 : shippingCost)} />
          <Link to="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to bag
          </Link>
          <h1 className="h-display mt-4 text-[clamp(2.5rem,11vw,3.75rem)]">Checkout</h1>
          <StepIndicator step={step} onJump={(i) => i < step && go(i)} />

          <div className="relative mt-10 overflow-hidden">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.45, ease: EASE }}>
                {step === 0 && (
                  <AddressStep
                    defaults={address ?? undefined}
                    onSubmit={(v) => {
                      setAddress(v);
                      go(1);
                    }}
                  />
                )}
                {step === 1 && (
                  <ShippingStep
                    value={shipping}
                    subtotal={subtotal}
                    onBack={() => go(0)}
                    onSubmit={(v) => {
                      setShipping(v);
                      go(2);
                    }}
                  />
                )}
                {step === 2 && (
                  <PaymentStep
                    onBack={() => go(1)}
                    onSubmit={(v) => {
                      setPayment(v);
                      go(3);
                    }}
                  />
                )}
                {step === 3 && address && payment && (
                  <div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <ReviewBlock title="Ship to" onEdit={() => go(0)}>
                        {address.fullName}
                        <br />
                        {address.line1}
                        {address.line2 && (
                          <>
                            <br />
                            {address.line2}
                          </>
                        )}
                        <br />
                        {address.city}, {address.state} {address.pincode}
                        <br />
                        +91 {address.phone}
                      </ReviewBlock>
                      <ReviewBlock title="Delivery" onEdit={() => go(1)}>
                        {SHIPPING_LABEL[shipping.method]}
                        <br />
                        {shippingCost === 0 ? 'Free' : formatINR(shippingCost)}
                      </ReviewBlock>
                      <ReviewBlock title="Payment" onEdit={() => go(2)}>
                        {payment.method === 'upi' && `UPI · ${payment.upiId}`}
                        {payment.method === 'card' && `Card ending ${payment.cardNumber.slice(-4)}`}
                        {payment.method === 'cod' && 'Cash on delivery'}
                      </ReviewBlock>
                    </div>
                    <div className="mt-10 flex flex-col-reverse items-stretch gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <button onClick={() => go(2)} className="link-underline self-center text-xs uppercase tracking-[0.16em]">
                        Back
                      </button>
                      <Button onClick={placeOrder} loading={createOrder.isPending} size="lg" magnetic icon={<Lock className="h-4 w-4" />} className="w-full sm:w-auto">
                        Place order · {formatINR(subtotal + shippingCost)}
                      </Button>
                    </div>
                    <p className="mt-4 text-center text-xs text-muted sm:text-right">Demo only — no payment is taken.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-28 bg-bone-dark/60 p-6 md:p-8">
            <p className="h-display text-2xl">Order summary</p>
            <ul className="mt-6 max-h-[340px] space-y-4 overflow-y-auto pr-1" data-lenis-prevent>
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3">
                  <div className="relative">
                    <img src={l.image} alt="" className="h-20 w-16 object-cover" />
                    <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-bone">{l.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-xs text-muted">
                      {l.color} · {l.size}
                    </p>
                  </div>
                  <p className="text-sm">{formatINR(l.price * l.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2.5 border-t border-line pt-6 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>{step < 1 ? 'Calculated next' : shippingCost === 0 ? 'Free' : formatINR(shippingCost)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatINR(subtotal + (step < 1 ? 0 : shippingCost))}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}

function MobileSummary({ lines, total }: { lines: ReturnType<typeof useCart.getState>['lines']; total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="-mx-4 mb-6 border-b border-line bg-bone-dark/60 px-4 lg:hidden">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between py-4 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <ShoppingBag className="h-4 w-4" /> {open ? 'Hide' : 'Show'} order summary
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
        </span>
        <span className="font-medium">{formatINR(total)}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="space-y-3 overflow-hidden">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 last:pb-4">
                <div className="relative shrink-0">
                  <img src={l.image} alt="" className="h-16 w-12 object-cover" />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-bone">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{l.name}</p>
                  <p className="text-xs text-muted">
                    {l.color} · {l.size}
                  </p>
                </div>
                <p className="shrink-0 text-sm">{formatINR(l.price * l.quantity)}</p>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIndicator({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="relative mt-10 flex justify-between">
      <div className="absolute left-4 right-4 top-4 h-px bg-line" aria-hidden>
        <motion.div className="h-px origin-left bg-ink" animate={{ scaleX: step / (STEPS.length - 1) }} transition={{ duration: 0.7, ease: EASE }} />
      </div>
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="relative z-10 flex flex-col items-center gap-2">
            <button
              onClick={() => onJump(i)}
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              className={cn('grid h-8 w-8 place-items-center rounded-full border text-xs font-medium transition-colors duration-500', done || active ? 'border-ink bg-ink text-bone' : 'border-line bg-bone text-muted')}
            >
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.span key="c" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}>
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {i + 1}
                  </motion.span>
                )}
              </AnimatePresence>
              {active && <motion.span layoutId="step-ring" className="absolute -inset-1.5 rounded-full border border-ember" transition={{ duration: 0.6, ease: EASE }} />}
            </button>
            <span className={cn('text-[10px] uppercase tracking-[0.1em] sm:text-[11px] sm:tracking-[0.14em]', active ? 'text-ink' : 'text-muted')}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, error, reg, className, ...rest }: { label: string; error?: string; reg: UseFormRegisterReturn; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('block', className)}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      <input {...reg} {...rest} aria-invalid={!!error} className={cn('input', error && 'border-ember')} />
      {error && <span className="field-error block">{error}</span>}
    </label>
  );
}

function AddressStep({ defaults, onSubmit }: { defaults?: AddressForm; onSubmit: (v: z.output<typeof addressSchema>) => void }) {
  const { register, handleSubmit, formState } = useForm<AddressForm, unknown, z.output<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: defaults ?? { state: '' },
  });
  const e = formState.errors;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 sm:grid-cols-2" noValidate>
      <Field label="Email" type="email" autoComplete="email" reg={register('email')} error={e.email?.message} className="sm:col-span-2" />
      <Field label="Full name" autoComplete="name" reg={register('fullName')} error={e.fullName?.message} />
      <Field label="Mobile number" type="tel" autoComplete="tel" placeholder="98765 43210" reg={register('phone')} error={e.phone?.message} />
      <Field label="Address" autoComplete="address-line1" placeholder="House no., street, area" reg={register('line1')} error={e.line1?.message} className="sm:col-span-2" />
      <Field label="Landmark (optional)" autoComplete="address-line2" reg={register('line2')} className="sm:col-span-2" />
      <Field label="City" autoComplete="address-level2" reg={register('city')} error={e.city?.message} />
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">State</span>
        <select {...register('state')} className={cn('input', e.state && 'border-ember')}>
          <option value="">Select state</option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {e.state && <span className="field-error block">{e.state.message}</span>}
      </label>
      <Field label="PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" reg={register('pincode')} error={e.pincode?.message} />
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" size="lg" magnetic className="w-full sm:w-auto">
          Continue to shipping
        </Button>
      </div>
    </form>
  );
}

function ShippingStep({ value, subtotal, onBack, onSubmit }: { value: ShippingForm; subtotal: number; onBack: () => void; onSubmit: (v: ShippingForm) => void }) {
  const { register, handleSubmit, watch } = useForm<ShippingForm>({ resolver: zodResolver(shippingSchema), defaultValues: value });
  const method = watch('method');
  const options = [
    { id: 'standard' as const, Icon: Truck, title: SHIPPING_LABEL.standard, price: subtotal >= SHOP.freeShippingThreshold ? 'Free' : formatINR(SHOP.standardShipping) },
    { id: 'express' as const, Icon: Zap, title: SHIPPING_LABEL.express, price: formatINR(SHOP.expressShipping) },
  ];
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {options.map((o) => (
        <label key={o.id} className={cn('relative flex cursor-pointer items-center gap-3 border p-4 sm:gap-4 sm:p-5 transition-colors duration-300', method === o.id ? 'border-ink' : 'border-line hover:border-muted')}>
          <input type="radio" value={o.id} {...register('method')} className="sr-only" />
          <span className={cn('grid h-5 w-5 place-items-center rounded-full border', method === o.id ? 'border-ink' : 'border-line')}>
            {method === o.id && <motion.span layoutId="ship-dot" className="h-2.5 w-2.5 rounded-full bg-ink" />}
          </span>
          <o.Icon className="h-5 w-5" strokeWidth={1.5} />
          <span className="flex-1 text-sm font-medium">{o.title}</span>
          <span className="text-sm">{o.price}</span>
        </label>
      ))}
      <div className="flex items-center justify-between gap-6 pt-7">
        <button type="button" onClick={onBack} className="link-underline text-xs uppercase tracking-[0.16em]">
          Back
        </button>
        <Button type="submit" size="lg" magnetic className="flex-1 sm:flex-none">
          Continue to payment
        </Button>
      </div>
    </form>
  );
}

function PaymentStep({ onBack, onSubmit }: { onBack: () => void; onSubmit: (v: z.output<typeof paymentSchema>) => void }) {
  const { register, handleSubmit, watch, setValue, formState } = useForm<PaymentForm, unknown, z.output<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { method: 'upi' } as PaymentForm,
    shouldUnregister: true,
  });
  const method = watch('method');
  const errors = formState.errors as Record<string, { message?: string } | undefined>;
  const options = [
    { id: 'upi', Icon: Smartphone, title: 'UPI', sub: 'GPay, PhonePe, Paytm & more' },
    { id: 'card', Icon: CreditCard, title: 'Credit / debit card', sub: 'Visa, Mastercard, RuPay, Amex' },
    { id: 'cod', Icon: Banknote, title: 'Cash on delivery', sub: 'Pay when it arrives' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-3">
        {options.map((o) => (
          <div key={o.id} className={cn('border transition-colors duration-300', method === o.id ? 'border-ink' : 'border-line')}>
            <label className="flex cursor-pointer items-center gap-3 p-4 sm:gap-4 sm:p-5">
              <input type="radio" value={o.id} {...register('method')} className="sr-only" />
              <span className={cn('grid h-5 w-5 place-items-center rounded-full border', method === o.id ? 'border-ink' : 'border-line')}>
                {method === o.id && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-ink" />}
              </span>
              <o.Icon className="h-5 w-5" strokeWidth={1.5} />
              <span className="flex-1">
                <span className="block text-sm font-medium">{o.title}</span>
                <span className="text-xs text-muted">{o.sub}</span>
              </span>
            </label>
            <AnimatePresence initial={false}>
              {method === o.id && o.id !== 'cod' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-5 px-4 pb-6 sm:grid-cols-4 sm:px-5">
                    {o.id === 'upi' && <Field label="UPI ID" placeholder="name@okbank" reg={register('upiId' as never)} error={errors.upiId?.message} className="col-span-2 sm:col-span-4" />}
                    {o.id === 'card' && (
                      <>
                        <Field
                          label="Card number"
                          inputMode="numeric"
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          reg={register('cardNumber' as never, {
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                              setValue('cardNumber' as never, e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') as never),
                          })}
                          error={errors.cardNumber?.message}
                          className="col-span-2 sm:col-span-4"
                        />
                        <Field label="Name on card" reg={register('cardName' as never)} error={errors.cardName?.message} className="col-span-2" />
                        <Field
                          label="Expiry"
                          placeholder="MM/YY"
                          maxLength={5}
                          reg={register('expiry' as never, {
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                              const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setValue('expiry' as never, (d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d) as never);
                            },
                          })}
                          error={errors.expiry?.message}
                        />
                        <Field label="CVV" type="password" inputMode="numeric" maxLength={3} reg={register('cvv' as never)} error={errors.cvv?.message} />
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Lock className="h-3.5 w-3.5" /> Payment UI only — nothing is charged in this demo.
      </p>
      <div className="flex items-center justify-between gap-6 pt-7">
        <button type="button" onClick={onBack} className="link-underline text-xs uppercase tracking-[0.16em]">
          Back
        </button>
        <Button type="submit" size="lg" magnetic className="flex-1 sm:flex-none">
          Review order
        </Button>
      </div>
    </form>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-line p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{title}</p>
        <button onClick={onEdit} className="link-underline text-xs">
          Edit
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function Success({ order }: { order: Order }) {
  return (
    <PageTransition>
      <section className="container-x flex min-h-[90svh] flex-col items-center justify-center pb-20 pt-28 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.3 }} className="grid h-24 w-24 place-items-center rounded-full bg-ember text-bone">
          <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.6 }} />
          </svg>
        </motion.div>
        <p className="eyebrow mt-10 text-muted">Order {order.orderNumber}</p>
        <h1 className="h-display mt-3 text-5xl md:text-8xl">Thank you.</h1>
        <p className="mt-5 max-w-md text-ink-soft">
          Your order of <strong>{formatINR(order.total)}</strong> is confirmed and will ship to {order.shippingAddress.city} via {order.shippingMethod.toLowerCase()}. A confirmation is on its way to your inbox.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button to="/account" magnetic>
            View orders
          </Button>
          <Button to="/shop" variant="outline" magnetic>
            Keep shopping
          </Button>
        </div>
      </section>
    </PageTransition>
  );
}
