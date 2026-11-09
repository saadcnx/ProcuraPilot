import React, { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon, TriangleAlertIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';

const ZEROCOMMIT_LOGO = 'https://worker.github-ji.pages.dev/zerocommit.svg';

export function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface text-sm text-ink-variant">
        Checking your session...
      </main>
    );
  }
  if (user) return <Navigate to="/queue" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your work email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const err = await login(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    navigate('/queue');
  };


  return (
    <main className="grid min-h-screen w-full bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(480px,560px)]">
      <section className="hidden flex-col justify-between bg-blush p-12 lg:flex">
        <BrandMark />
        <div className="max-w-lg">
          <h1 className="text-[45px] leading-[52px] text-ink">
            Every bill checked against its order. Every override signed.
          </h1>
          <p className="mt-6 max-w-md text-base leading-6 text-ink-variant">
            ProcuraPilot holds any invoice that doesn’t match its purchase order to the cent — and records who let it
            through, and why.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-variant">
          <span>Built by</span>
          <img src={ZEROCOMMIT_LOGO} alt="zerocommit" className="h-6 w-6" />
          <span className="font-medium text-ink">zerocommit</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <BrandMark />
          </div>
          <h2 className="text-[28px] leading-9 text-ink">Sign in</h2>
          <p className="mt-2 text-sm text-ink-variant">Everything you do here is recorded under your name.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            <TextField label="Work email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="flex h-12 w-12 items-center justify-center rounded-full text-ink-variant transition-colors duration-150 ease-out hover:bg-ink/[0.08]">
                
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              } />
            

            {error &&
            <div role="alert" className="flex gap-3 rounded-lg bg-blush px-4 py-3 text-sm text-on-tertiary-container">
                <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            }

            <Button type="submit" fullWidth loading={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

        </div>
      </section>
    </main>);

}