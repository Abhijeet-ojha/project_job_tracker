import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Loader2, Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-primary/8 dark:bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-500/6 dark:bg-violet-500/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-border/60 bg-card dark:bg-card shadow-[0_20px_60px_-12px_rgba(42,52,57,0.10)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)] p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] shadow-md mb-4">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in to continue tracking your opportunities
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1.5"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background dark:bg-surface-container text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background dark:bg-surface-container text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-destructive text-sm">
                <span className="shrink-0 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-br from-primary to-[hsl(220,90%,36%)] text-white font-semibold text-sm hover:brightness-110 transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:underline font-semibold"
            >
              Create one →
            </Link>
          </p>
        </div>

        {/* Footer tagline */}
        <p className="text-center text-[11px] text-muted-foreground/60 mt-5">
          AI-powered job tracking. Secure & private.
        </p>
      </div>
    </div>
  );
}
