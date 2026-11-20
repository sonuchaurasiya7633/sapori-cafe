'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { toast } from '@/lib/toast';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill saved admin email from local storage if previously saved
  React.useEffect(() => {
    const savedEmail = localStorage.getItem('sapori_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      toast.warning('Please enter administrator email and password');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator credentials');
      }

      // Store in localStorage as well for client convenience
      localStorage.setItem('sapori_admin_auth', 'true');
      localStorage.setItem('sapori_admin_email', data.user.email);

      toast.success('Welcome back, Administrator!', {
        description: `Signed in as ${data.user.email}`,
      });

      // Redirect to admin dashboard
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify credentials.';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { signInWithGoogle } = await import('@/lib/firebase/auth');
      const user = await signInWithGoogle();
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.isAdmin) {
        throw new Error(data.error || 'Your Google account is not authorized as an administrator.');
      }
      localStorage.setItem('sapori_admin_auth', 'true');
      localStorage.setItem('sapori_admin_email', data.user.email);
      toast.success('Welcome back, Administrator!');
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      const msg = err.message || 'Google authentication failed';
      if (!msg.includes('closed-by-user')) {
        toast.error(msg);
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE1] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Logo size="lg" variant="green" />
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] uppercase tracking-wide">
            Operations Portal Login
          </h1>
          <p className="text-xs text-[#15370D]/75">
            Internal Restaurant Management, POS & Kitchen Display
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          {errorMsg && (
            <div className="bg-[#F5EFE1] border border-[#15370D] p-3 rounded-lg flex items-start space-x-2 text-xs font-bold text-[#15370D]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                Staff Email ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#15370D]/50" />
                <input
                  type="text"
                  required
                  placeholder="admin@saporicafe.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FFFFFF] border border-[#15370D]/25 rounded-lg text-xs font-bold text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#15370D] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#15370D]/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FFFFFF] border border-[#15370D]/25 rounded-lg text-xs font-bold text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#15370D]/60 hover:text-[#15370D]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow-md disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#15370D]/15" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-[#15370D]/60 font-semibold uppercase">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={loading}
            className="w-full border border-[#15370D]/25 bg-white hover:bg-stone-50 text-[#15370D] py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60 shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="pt-2 border-t border-[#15370D]/10 flex items-center justify-between text-xs">
            <Link href="/" className="text-[#15370D]/70 hover:text-[#15370D] font-semibold">
              ← Return to Public Website
            </Link>
            <span className="text-[#15370D]/50 font-mono text-[11px]">
              Branch #01 Jaipur
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#15370D]/60">
          <ShieldCheck className="w-3.5 h-3.5 text-[#15370D]" />
          <span>Role-Based Access Protected Environment</span>
        </div>
      </div>
    </div>
  );
}
