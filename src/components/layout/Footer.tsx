import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Instagram, Twitter, Youtube } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useSubscribe } from '@/hooks/queries';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'New drop', to: '/shop?tag=new' },
      { label: 'Men', to: '/shop?category=men' },
      { label: 'Women', to: '/shop?category=women' },
      { label: 'Accessories', to: '/shop?category=accessories' },
      { label: 'Sale', to: '/shop?tag=sale' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact us', to: '/contact' },
      { label: 'Shipping & returns', to: '/contact' },
      { label: 'Track an order', to: '/account' },
      { label: 'Size guide', to: '/shop' },
    ],
  },
  {
    title: 'Brand',
    links: [
      { label: 'Our story', to: '/about' },
      { label: 'Account', to: '/account' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
];

const schema = z.object({ email: z.string().email('Enter a valid email') });

/** Simple brand-neutral payment marks drawn inline (no third-party logos). */
const PAYMENTS = ['UPI', 'VISA', 'MC', 'RuPay', 'AMEX', 'COD'];

export function Footer() {
  const subscribe = useSubscribe();
  const { register, handleSubmit, formState } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  return (
    <footer className="relative overflow-hidden bg-ink pt-16 text-bone md:pt-20">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="h-display text-4xl md:text-5xl">Join the forge.</p>
            <p className="mt-3 max-w-sm text-sm text-bone/60">Early access to drops, members-only pricing and zero spam. Promise.</p>
            <AnimatePresence mode="wait">
              {subscribe.isSuccess ? (
                <motion.p key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-ember" /> You’re on the list.
                </motion.p>
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} onSubmit={handleSubmit((v) => subscribe.mutate(v.email))} className="mt-8 max-w-md">
                  <div className="flex items-center border-b border-bone/30 focus-within:border-bone">
                    <input {...register('email')} type="email" placeholder="Email address" aria-label="Email address" className="w-full min-w-0 bg-transparent py-3 text-sm placeholder:text-bone/40 focus:outline-none" />
                    <button aria-label="Subscribe" className="grid h-10 w-10 place-items-center transition-transform hover:translate-x-1" disabled={subscribe.isPending} data-cursor="link">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  {formState.errors.email && <p className="mt-2 text-xs text-ember-light">{formState.errors.email.message}</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-7 lg:justify-items-end">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow text-bone/40">{col.title}</p>
                <ul className="mt-5 space-y-3 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="link-underline text-bone/80 hover:text-bone" data-cursor="link">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-bone/10 py-8 md:mt-20 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {[
              { Icon: Instagram, label: 'Instagram' },
              { Icon: Twitter, label: 'X / Twitter' },
              { Icon: Youtube, label: 'YouTube' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} data-cursor="link" className="grid h-10 w-10 place-items-center rounded-full border border-bone/15 transition-colors hover:bg-bone hover:text-ink">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {PAYMENTS.map((p) => (
              <li key={p} className="rounded border border-bone/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-bone/70">
                {p}
              </li>
            ))}
          </ul>
          <p className="text-xs text-bone/40">© {new Date().getFullYear()} SKY Forge. Made in India.</p>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none -mb-[3vw] select-none text-center">
        <Logo className="text-[21vw] text-bone/[0.06]" />
      </div>
    </footer>
  );
}
