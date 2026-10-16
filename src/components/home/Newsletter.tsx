import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { RevealText } from '@/components/ui/Reveal';
import { useSubscribe } from '@/hooks/queries';
import { EASE } from '@/lib/utils';

const schema = z.object({ email: z.string().min(1, 'Email is required').email('That doesn’t look like an email') });
type Form = z.infer<typeof schema>;

export function Newsletter() {
  const subscribe = useSubscribe();
  const { register, handleSubmit, formState, getValues } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <section className="relative overflow-hidden bg-ember text-bone">
      <div className="container-x grid min-h-[480px] place-items-center py-20 text-center md:min-h-[520px] md:py-24">
        <AnimatePresence mode="wait">
          {subscribe.isSuccess ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }} className="flex flex-col items-center">
              <svg viewBox="0 0 52 52" className="h-24 w-24" aria-hidden>
                <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
                <motion.path d="M15 27 l7 7 l15 -16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6, ease: EASE }} />
              </svg>
              {/* Little celebratory sparks */}
              <div className="relative">
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      className="absolute h-2 w-2 rounded-full bg-bone"
                      initial={{ x: 0, y: -60, opacity: 1, scale: 1 }}
                      animate={{ x: Math.cos(a) * 140, y: -60 + Math.sin(a) * 140, opacity: 0, scale: 0 }}
                      transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
                    />
                  );
                })}
              </div>
              <h2 className="h-display mt-8 text-5xl md:text-7xl">You’re in.</h2>
              <p className="mt-4 max-w-md text-bone/80">
                We’ll send early access to <strong>{getValues('email')}</strong>. Keep an eye on your inbox — first drop notes land Friday.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full max-w-3xl">
              <p className="eyebrow text-bone/80">The Forge Letter</p>
              <RevealText as="h2" text="First dibs on every drop." className="h-display mt-4 text-[clamp(2.5rem,11vw,6rem)]" />
              <p className="mx-auto mt-6 max-w-md text-bone/80">Members get 48-hour early access, private sale pricing and 10% off their first order.</p>
              <form onSubmit={handleSubmit((v) => subscribe.mutate(v.email))} className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row" noValidate>
                <div className="flex-1 text-left">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    aria-invalid={!!formState.errors.email}
                    className="h-14 w-full border border-bone/40 bg-transparent px-5 text-bone placeholder:text-bone/50 focus:border-bone focus:outline-none"
                  />
                  <AnimatePresence>
                    {formState.errors.email && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-xs text-bone">
                        {formState.errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button type="submit" variant="primary" size="lg" className="h-14 w-full sm:w-auto" loading={subscribe.isPending} magnetic>
                  Subscribe
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
