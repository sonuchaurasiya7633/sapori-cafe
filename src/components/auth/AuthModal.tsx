'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  setupRecaptcha,
  sendPhoneOtp,
  verifyPhoneOtp,
  getFriendlyAuthError,
} from '@/lib/firebase/auth';
import { toast } from '@/lib/toast';
import Logo from '@/components/ui/Logo';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalTab, syncProfileWithBackend } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'phone' | 'email'>('google');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email form state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Forgot password mode
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Sync initial tab when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab || 'google');
      setErrorMsg(null);
      setConfirmationResult(null);
      setOtpCode('');
      setIsForgotPassword(false);
      setResetSent(false);
    }
  }, [isAuthModalOpen, authModalTab]);

  // Handle OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  // 1. Google 1-Click Login Handler
  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      await syncProfileWithBackend(user, 'google');
      toast.success(`Welcome to Sapori, ${user.displayName || 'Guest'}!`, {
        description: 'Signed in with your Google Account',
      });
      closeAuthModal();
    } catch (err: any) {
      const friendly = getFriendlyAuthError(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(friendly);
        toast.error(friendly);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Email / Password Login & Registration Handler
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        if (!displayName.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        const user = await signUpWithEmail(email, password, displayName);
        await syncProfileWithBackend(user, 'password');
        toast.success(`Account created! Welcome, ${displayName}!`);
      } else {
        const user = await signInWithEmail(email, password);
        await syncProfileWithBackend(user, 'password');
        toast.success(`Welcome back, ${user.displayName || 'Guest'}!`);
      }
      closeAuthModal();
    } catch (err: any) {
      const friendly = getFriendlyAuthError(err);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  // 3. Password Reset Handler
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      const friendly = getFriendlyAuthError(err);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  // 4. Send Phone SMS OTP Handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOtp(phone, verifier);
      setConfirmationResult(confirmation);
      setOtpCountdown(45);
      toast.info(`OTP sent to +91 ${cleanPhone.slice(-10)}`);
    } catch (err: any) {
      const friendly = getFriendlyAuthError(err);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify Phone OTP Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await verifyPhoneOtp(confirmationResult, otpCode);
      await syncProfileWithBackend(user, 'phone');
      toast.success(`Signed in successfully with mobile!`);
      closeAuthModal();
    } catch (err: any) {
      const friendly = getFriendlyAuthError(err);
      setErrorMsg(friendly);
      toast.error(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Invisible Recaptcha target element */}
      <div id="recaptcha-container"></div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#071c05]/60 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#15370D]/15 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header with Italian Cafe Accents */}
        <div className="bg-gradient-to-r from-[#15370D] to-[#1e4a14] p-6 text-white text-center relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-2">
            <Logo size="sm" variant="white" withLink={false} />
          </div>
          <h3 className="text-lg font-black tracking-wide font-serif">Welcome to Sapori</h3>
          <p className="text-xs text-stone-200/90 mt-1">
            Order artisan pizzas, earn perks & track deliveries
          </p>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex border-b border-[#15370D]/10 bg-[#F5EFE1]/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-[#FFFFFF] text-[#15370D] shadow-xs'
                : 'text-[#15370D]/70 hover:text-[#15370D] hover:bg-[#FFFFFF]/50'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-[#FFFFFF] text-[#15370D] shadow-xs'
                : 'text-[#15370D]/70 hover:text-[#15370D] hover:bg-[#FFFFFF]/50'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#15370D]" />
            <span>Mobile OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'email'
                ? 'bg-[#FFFFFF] text-[#15370D] shadow-xs'
                : 'text-[#15370D]/70 hover:text-[#15370D] hover:bg-[#FFFFFF]/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#15370D]" />
            <span>Email</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6">
          {/* Friendly Error Box */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE ONE-CLICK LOGIN */}
          {activeTab === 'google' && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-16 h-16 rounded-full bg-[#DEB853]/15 border border-[#DEB853]/30 flex items-center justify-center mx-auto mb-1">
                <Sparkles className="w-7 h-7 text-[#DEB853]" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#15370D]">Fastest & Most Secure</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Sign in instantly with your verified Google account. No passwords or OTP codes to memorize.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 bg-[#FFFFFF] hover:bg-[#F5EFE1]/40 border-2 border-[#15370D]/25 hover:border-[#15370D] rounded-2xl flex items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#15370D] transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RotateCw className="w-4 h-4 animate-spin text-[#15370D]" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                )}
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Google Firebase Security</span>
              </div>
            </div>
          )}

          {/* TAB 2: PHONE NUMBER & OTP LOGIN */}
          {activeTab === 'phone' && (
            <div>
              {!confirmationResult ? (
                // Step 2A: Enter Mobile Number
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-[#15370D]/70">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full bg-[#F5EFE1]/30 border border-[#15370D]/20 rounded-xl pl-16 pr-3 py-3 text-sm font-semibold text-[#15370D] tracking-wider focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                        required
                        autoFocus
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      We will send a 6-digit SMS verification code to your phone.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full py-3 bg-[#15370D] hover:bg-[#1a4411] text-[#F5EFE1] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Step 2B: Enter 6-digit OTP
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center pb-1">
                    <p className="text-xs text-stone-600">
                      Code sent to <span className="font-bold text-[#15370D]">+91 {phone}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setConfirmationResult(null)}
                      className="text-[11px] text-[#15370D] font-bold underline hover:opacity-80 mt-0.5 cursor-pointer"
                    >
                      Change Number
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-1 text-center">
                      Enter 6-Digit SMS Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full bg-[#F5EFE1]/40 border-2 border-[#15370D]/30 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-[#15370D] font-bold focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-3 bg-[#15370D] hover:bg-[#1a4411] text-[#F5EFE1] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#DEB853]" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    {otpCountdown > 0 ? (
                      <span className="text-xs text-stone-500">
                        Resend code in <span className="font-bold">{otpCountdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs font-bold text-[#15370D] hover:underline cursor-pointer"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: EMAIL & PASSWORD (LOGIN / REGISTER / FORGOT) */}
          {activeTab === 'email' && (
            <div>
              {isForgotPassword ? (
                // Forgot Password Form
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#15370D]">Reset Your Password</h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Enter your account email to receive a password reset link.
                    </p>
                  </div>

                  {resetSent ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                      ✅ Password reset link has been dispatched to <strong>{email}</strong>. Please check your inbox or spam folder.
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#F5EFE1]/30 border border-[#15370D]/20 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                        required
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                    {!resetSent && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-[#15370D] hover:bg-[#1a4411] text-[#F5EFE1] font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                // Sign In / Sign Up Form
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  {isRegisterMode && (
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3.5 text-[#15370D]/50" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Kabir Sen"
                          className="w-full bg-[#F5EFE1]/30 border border-[#15370D]/20 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                          required={isRegisterMode}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-[#15370D]/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#F5EFE1]/30 border border-[#15370D]/20 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D]/70">
                        Password
                      </label>
                      {!isRegisterMode && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setErrorMsg(null);
                          }}
                          className="text-[11px] text-[#15370D] font-bold hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3.5 text-[#15370D]/50" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F5EFE1]/30 border border-[#15370D]/20 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#15370D]/50 hover:text-[#15370D] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#15370D] hover:bg-[#1a4411] text-[#F5EFE1] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2 border-t border-[#15370D]/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setErrorMsg(null);
                      }}
                      className="text-xs text-[#15370D] font-semibold hover:underline cursor-pointer"
                    >
                      {isRegisterMode
                        ? 'Already have an account? Sign in here'
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
