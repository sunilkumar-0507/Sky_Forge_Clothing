import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/Button';
import { editorial } from '@/config/media';
import { useDocumentTitle } from '@/hooks/dom';
import { useLogin, useRegister } from '@/hooks/queries';
import { cn, EASE } from '@/lib/utils';
import { toast, useAuth } from '@/store';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters').regex(/\d/, 'Include at least one number'),
    confirm: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms' }) }),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords don’t match' });

export default function Auth() {
  const { pathname } = useLocation();
  const mode = pathname === '/register' ? 'register' : 'login';
  useDocumentTitle(mode === 'login' ? 'Sign in' : 'Create account');

  return (
    <PageTransition footer={false}>
      <section className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ink lg:block">
          <motion.img src={editorial.auth} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-bone">
            <p className="eyebrow text-ember-light">Members</p>
            <p className="h-display mt-3 text-6xl">Early access. Better prices. Free returns.</p>
          </div>
        </div>

        <div className="flex items-start justify-center px-4 pb-16 pt-24 sm:items-center sm:px-10 sm:pt-28">
          <div className="w-full max-w-md">
            <div className="relative flex gap-8 border-b border-line" role="tablist">
              {(['login', 'register'] as const).map((m) => (
                <Link key={m} to={m === 'login' ? '/login' : '/register'} replace role="tab" aria-selected={mode === m} className={cn('relative pb-4 font-display text-2xl font-medium uppercase transition-colors', mode === m ? 'text-ink' : 'text-muted hover:text-ink')} data-cursor="link">
                  {m === 'login' ? 'Sign in' : 'Register'}
                  {mode === m && <motion.span layoutId="auth-tab" className="absolute -bottom-px left-0 right-0 h-0.5 bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                </Link>
              ))}
            </div>
            <div className="relative mt-10">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: mode === 'register' ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === 'register' ? -40 : 40 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);
  const { invalid, ...rest } = props;
  return (
    <div className="relative">
      <input {...rest} type={show ? 'text' : 'password'} className={cn('input pr-10', invalid && 'border-ember')} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{children}</span>;
const Err = ({ msg }: { msg?: string }) => (msg ? <span className="field-error block">{msg}</span> : null);

function LoginForm() {
  const login = useLogin();
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const e = formState.errors;

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit((v) =>
        login.mutate(v, {
          onSuccess: ({ user, token }) => {
            signIn(user, token);
            toast({ title: `Welcome back, ${user.firstName}`, variant: 'success' });
            navigate('/account');
          },
        }),
      )}
    >
      <label className="block">
        <Label>Email</Label>
        <input {...register('email')} type="email" autoComplete="email" className={cn('input', e.email && 'border-ember')} />
        <Err msg={e.email?.message} />
      </label>
      <label className="block">
        <Label>Password</Label>
        <PasswordInput {...register('password')} autoComplete="current-password" invalid={!!e.password} />
        <Err msg={e.password?.message} />
      </label>
      <div className="flex justify-end">
        <button type="button" className="link-underline text-xs" onClick={() => toast({ title: 'Password reset is UI-only in this demo' })}>
          Forgot password?
        </button>
      </div>
      <Button type="submit" full size="lg" loading={login.isPending} magnetic>
        Sign in
      </Button>
      <p className="text-center text-xs text-muted">Demo: any email and 6+ character password works.</p>
    </form>
  );
}

function RegisterForm() {
  const reg = useRegister();
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });
  const e = formState.errors;

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit(({ firstName, lastName, email, password }) =>
        reg.mutate(
          { firstName, lastName, email, password },
          {
            onSuccess: ({ user, token }) => {
              signIn(user, token);
              toast({ title: `Welcome to the forge, ${user.firstName}`, variant: 'success' });
              navigate('/account');
            },
          },
        ),
      )}
    >
      <div className="grid gap-6 sm:grid-cols-2 sm:gap-5">
        <label className="block">
          <Label>First name</Label>
          <input {...register('firstName')} autoComplete="given-name" className={cn('input', e.firstName && 'border-ember')} />
          <Err msg={e.firstName?.message} />
        </label>
        <label className="block">
          <Label>Last name</Label>
          <input {...register('lastName')} autoComplete="family-name" className={cn('input', e.lastName && 'border-ember')} />
          <Err msg={e.lastName?.message} />
        </label>
      </div>
      <label className="block">
        <Label>Email</Label>
        <input {...register('email')} type="email" autoComplete="email" className={cn('input', e.email && 'border-ember')} />
        <Err msg={e.email?.message} />
      </label>
      <label className="block">
        <Label>Password</Label>
        <PasswordInput {...register('password')} autoComplete="new-password" invalid={!!e.password} />
        <Err msg={e.password?.message} />
      </label>
      <label className="block">
        <Label>Confirm password</Label>
        <PasswordInput {...register('confirm')} autoComplete="new-password" invalid={!!e.confirm} />
        <Err msg={e.confirm?.message} />
      </label>
      <label className="flex items-start gap-3 text-xs text-ink-soft">
        <input type="checkbox" {...register('terms')} className="mt-0.5 h-4 w-4 accent-ink" />
        <span>I agree to the Terms of Service and Privacy Policy.</span>
      </label>
      <Err msg={e.terms?.message} />
      <Button type="submit" full size="lg" loading={reg.isPending} magnetic>
        Create account
      </Button>
    </form>
  );
}
