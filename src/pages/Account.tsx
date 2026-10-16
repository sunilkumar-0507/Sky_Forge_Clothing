import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, MapPin, Package, Plus, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Bits';
import { useDocumentTitle } from '@/hooks/dom';
import { useAddresses, useMe, useOrders } from '@/hooks/queries';
import { cn, EASE, formatDate, formatINR } from '@/lib/utils';
import { toast, useAuth } from '@/store';
import type { Order, OrderStatus } from '@/types';

const TABS = [
  { id: 'orders', label: 'Orders', Icon: Package },
  { id: 'profile', label: 'Profile', Icon: UserIcon },
  { id: 'addresses', label: 'Addresses', Icon: MapPin },
] as const;
type Tab = (typeof TABS)[number]['id'];

const STATUS_STYLE: Record<OrderStatus, string> = {
  Processing: 'bg-sky/30 text-ink',
  Shipped: 'bg-ember/15 text-ember-dark',
  Delivered: 'bg-ink text-bone',
  Cancelled: 'bg-line text-muted',
};

export default function Account() {
  useDocumentTitle('Account');
  const [tab, setTab] = useState<Tab>('orders');
  const authUser = useAuth((s) => s.user);
  const signOut = useAuth((s) => s.signOut);
  const { data: me } = useMe();
  const user = authUser ?? me;

  return (
    <PageTransition>
      <section className="container-x min-h-[80vh] pb-20 pt-24 md:pb-28 md:pt-36">
        {!authUser && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-wrap items-center justify-between gap-3 bg-ink px-5 py-4 text-sm text-bone">
            <span>You’re viewing a demo account.</span>
            <Link to="/login" className="link-underline text-xs uppercase tracking-[0.16em] text-ember-light">
              Sign in
            </Link>
          </motion.div>
        )}
        <p className="eyebrow text-muted">My account</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="h-display text-[clamp(2.5rem,11vw,4.5rem)]">Hey, {user?.firstName ?? '…'}.</h1>
          {authUser && (
            <button onClick={() => { signOut(); toast({ title: 'Signed out' }); }} className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted hover:text-ink">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:mt-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <nav className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account sections">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={cn('relative flex shrink-0 items-center gap-3 px-4 py-3 text-left text-sm transition-colors', tab === id ? 'text-bone' : 'text-ink-soft hover:text-ink')} data-cursor="link">
                {tab === id && <motion.span layoutId="account-tab" className="absolute inset-0 bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            ))}
          </nav>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
              {tab === 'orders' && <Orders />}
              {tab === 'profile' && <Profile defaults={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: me?.phone ?? '' } : undefined} />}
              {tab === 'addresses' && <Addresses />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </PageTransition>
  );
}

function Orders() {
  const { data: orders, isLoading } = useOrders();
  const [open, setOpen] = useState<number | null>(null);
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>;
  return (
    <ul className="space-y-3">
      {orders?.map((o, i) => (
        <motion.li key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5, ease: EASE }} className="border border-line">
          <button onClick={() => setOpen(open === o.id ? null : o.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 p-4 text-left sm:gap-x-8 sm:p-5" aria-expanded={open === o.id}>
            <div className="flex -space-x-4">
              {o.items.slice(0, 3).map((it) => (
                <img key={it.productId + it.size} src={it.image} alt="" className="h-16 w-12 border-2 border-bone object-cover" />
              ))}
            </div>
            <div className="min-w-[140px] flex-1">
              <p className="text-sm font-medium">{o.orderNumber}</p>
              <p className="text-xs text-muted">
                {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
              </p>
            </div>
            <span className={cn('rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider', STATUS_STYLE[o.status])}>{o.status}</span>
            <span className="text-sm font-medium">{formatINR(o.total)}</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-500', open === o.id && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open === o.id && <OrderDetails order={o} />}
          </AnimatePresence>
        </motion.li>
      ))}
    </ul>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const steps: OrderStatus[] = ['Processing', 'Shipped', 'Delivered'];
  const reached = steps.indexOf(order.status);
  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="overflow-hidden">
      <div className="border-t border-line p-5">
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5 sm:gap-2">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', i <= reached ? 'bg-ember' : 'bg-line')} />
              <span className={cn('text-[10px] uppercase tracking-wider sm:text-[11px]', i <= reached ? 'text-ink' : 'text-muted')}>{s}</span>
              {i < steps.length - 1 && <span className={cn('h-px flex-1', i < reached ? 'bg-ember' : 'bg-line')} />}
            </div>
          ))}
        </div>
        <ul className="space-y-3">
          {order.items.map((it) => (
            <li key={it.productId + it.size} className="flex items-center gap-3 text-sm sm:gap-4">
              <img src={it.image} alt="" className="h-16 w-12 shrink-0 object-cover" />
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
                <Link to={`/product/${it.slug}`} className="link-underline block truncate sm:flex-1">
                  {it.name}
                </Link>
                <span className="block text-xs text-muted">
                  {it.color} · {it.size} · ×{it.quantity}
                </span>
              </div>
              <span className="shrink-0">{formatINR(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted">
          Shipping to {order.shippingAddress.city} · {order.shippingMethod} · {order.shipping === 0 ? 'Free shipping' : formatINR(order.shipping)}
        </p>
      </div>
    </motion.div>
  );
}

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

function Profile({ defaults }: { defaults?: ProfileForm }) {
  const { register, handleSubmit, reset, formState } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  useEffect(() => {
    if (defaults) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults?.email]);
  const e = formState.errors;
  const fields: { name: keyof ProfileForm; label: string; type?: string }[] = [
    { name: 'firstName', label: 'First name' },
    { name: 'lastName', label: 'Last name' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
  ];
  return (
    <form onSubmit={handleSubmit(() => toast({ title: 'Profile saved', description: 'Changes are kept for this demo session.', variant: 'success' }))} className="grid max-w-2xl gap-6 sm:grid-cols-2" noValidate>
      {fields.map((f) => (
        <label key={f.name} className="block">
          <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{f.label}</span>
          <input {...register(f.name)} type={f.type ?? 'text'} className={cn('input', e[f.name] && 'border-ember')} />
          {e[f.name] && <span className="field-error block">{e[f.name]?.message}</span>}
        </label>
      ))}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={!formState.isDirty}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses?.map((a, i) => (
        <motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="relative border border-line p-6">
          {a.isDefault && <span className="absolute right-4 top-4 bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-bone">Default</span>}
          <p className="font-medium">{a.fullName}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {a.line1}
            {a.line2 && (
              <>
                <br />
                {a.line2}
              </>
            )}
            <br />
            {a.city}, {a.state} {a.pincode}
            <br />
            {a.phone}
          </p>
          <div className="mt-4 flex gap-4 text-xs">
            <button className="link-underline">Edit</button>
            {!a.isDefault && <button className="link-underline">Set as default</button>}
          </div>
        </motion.div>
      ))}
      <button onClick={() => toast({ title: 'Address form is UI-only in this demo' })} className="grid min-h-[180px] place-items-center border border-dashed border-line text-sm text-muted transition-colors hover:border-ink hover:text-ink" data-cursor="link">
        <span className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add new address
        </span>
      </button>
    </div>
  );
}
