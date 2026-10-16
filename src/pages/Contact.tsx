import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Bits';
import { RevealImage, RevealText } from '@/components/ui/Reveal';
import { editorial } from '@/config/media';
import { useDocumentTitle } from '@/hooks/dom';
import { useContact } from '@/hooks/queries';
import { cn, EASE } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Tell us your name'),
  email: z.string().email('Enter a valid email'),
  subject: z.string().min(1, 'Pick a topic'),
  message: z.string().min(10, 'A little more detail, please (10+ characters)'),
});
type Form = z.infer<typeof schema>;

const TOPICS = ['Order help', 'Returns & exchanges', 'Sizing advice', 'Wholesale', 'Press', 'Something else'];

export default function Contact() {
  useDocumentTitle('Contact');
  const contact = useContact();
  const { register, handleSubmit, formState, reset } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { subject: '' } });
  const e = formState.errors;

  return (
    <PageTransition>
      <section className="container-x pb-20 pt-28 md:pb-24 md:pt-44">
        <p className="eyebrow text-muted">Contact</p>
        <RevealText as="h1" text="Talk to a human." immediate delay={0.3} className="h-display mt-5 text-[clamp(2.75rem,12vw,8vw)] md:text-[8vw]" />

        <div className="mt-10 grid grid-cols-1 gap-14 md:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {contact.isSuccess ? (
                <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border border-line p-6 sm:p-10">
                  <p className="h-display text-4xl">Message sent.</p>
                  <p className="mt-3 text-sm text-ink-soft">Thanks for reaching out. We reply within one working day — usually much sooner.</p>
                  <Button
                    variant="outline"
                    className="mt-8"
                    onClick={() => {
                      reset();
                      contact.reset();
                    }}
                  >
                    Send another
                  </Button>
                </motion.div>
              ) : (
                <motion.form key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE }} onSubmit={handleSubmit((v) => contact.mutate(v))} className="grid gap-7 sm:grid-cols-2" noValidate>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Name</span>
                    <input {...register('name')} autoComplete="name" className={cn('input', e.name && 'border-ember')} />
                    {e.name && <span className="field-error block">{e.name.message}</span>}
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Email</span>
                    <input {...register('email')} type="email" autoComplete="email" className={cn('input', e.email && 'border-ember')} />
                    {e.email && <span className="field-error block">{e.email.message}</span>}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Topic</span>
                    <select {...register('subject')} className={cn('input', e.subject && 'border-ember')}>
                      <option value="">Choose a topic</option>
                      {TOPICS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    {e.subject && <span className="field-error block">{e.subject.message}</span>}
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Message</span>
                    <textarea {...register('message')} rows={5} className={cn('input resize-none', e.message && 'border-ember')} />
                    {e.message && <span className="field-error block">{e.message.message}</span>}
                  </label>
                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" loading={contact.isPending} magnetic>
                      Send message
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-20">
              <p className="h-display mb-6 text-3xl">Quick answers</p>
              <Accordion
                defaultOpen={-1}
                items={[
                  { title: 'When will my order arrive?', content: 'Standard delivery takes 3–5 working days in metros and 5–7 elsewhere. Express arrives in 1–2 days in major cities.' },
                  { title: 'How do returns work?', content: 'Request a return within 15 days from your account. We pick up from your door and refund to the original payment method within 5–7 days of receipt.' },
                  { title: 'Do you ship internationally?', content: 'Not yet — we currently ship across India only. International shipping is on the roadmap for 2027.' },
                ]}
              />
            </div>
          </div>

          <aside className="space-y-10 lg:col-span-5">
            <RevealImage src={editorial.contact} alt="The SKY Forge studio store" className="aspect-[4/3]" />
            <ul className="space-y-5 text-sm">
              {[
                { Icon: MapPin, text: 'SKY Forge Studio, 12th Main, Indiranagar, Bengaluru 560038' },
                { Icon: Mail, text: 'hello@skyforge.example' },
                { Icon: Phone, text: '+91 80 4000 1234' },
                { Icon: Clock, text: 'Mon–Sat · 10am–7pm IST' },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                  {text}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </PageTransition>
  );
}
