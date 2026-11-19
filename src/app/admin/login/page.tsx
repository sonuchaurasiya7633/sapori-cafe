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
