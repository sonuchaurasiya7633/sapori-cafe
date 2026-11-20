'use client';

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { initFirebaseClient } from './client';

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  if (!authInstance) {
    const app = initFirebaseClient();
    if (app) {
      authInstance = getAuth(app);
      authInstance.useDeviceLanguage();
    }
  }
  return authInstance;
}

/**
 * 1-Click Google Sign In using official Firebase popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available in this environment');

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign In with Email & Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available');

  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Create New Account with Email & Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available');

  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (displayName.trim()) {
    await updateProfile(result.user, { displayName: displayName.trim() });
  }
  return result.user;
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available');
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Initialize Invisible reCAPTCHA verifier for Phone Auth
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available');

  // Clear existing if any
  if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (_) {}
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with submit
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    },
  });

  if (typeof window !== 'undefined') {
    (window as any).recaptchaVerifier = verifier;
  }

  return verifier;
}

/**
 * Send SMS OTP to phone number (+91...)
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth not available');

  // Normalize phone number (default to +91 India if not prefixed)
  let formattedPhone = phoneNumber.trim().replace(/\s+/g, '');
  if (!formattedPhone.startsWith('+')) {
    if (formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`;
    } else {
      formattedPhone = `+${formattedPhone}`;
    }
  }

  return await signInWithPhoneNumber(auth, formattedPhone, verifier);
}

/**
 * Verify SMS OTP Code
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const result = await confirmationResult.confirm(otpCode.trim());
  return result.user;
}

/**
 * Sign Out Current User
 */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  await signOut(auth);
}

/**
 * Human-friendly error translation for Firebase Auth error codes
 */
export function getFriendlyAuthError(err: any): string {
  if (!err) return 'An error occurred during authentication';
  const code = err.code || '';
  const message = err.message || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Popup was closed before finishing.';
    case 'auth/popup-blocked':
      return 'Browser blocked the popup window. Please allow popups for saporicafe.in and try again.';
    case 'auth/unauthorized-domain':
      return 'Domain not authorized. Please add saporicafe.in and www.saporicafe.in to Firebase Console > Authentication > Settings > Authorized Domains.';
    case 'auth/internal-error':
      return 'Firebase setup error. Please ensure saporicafe.in is added to Authorized Domains in Firebase Console.';
    case 'auth/operation-not-allowed':
      if (message.toLowerCase().includes('region') || message.toLowerCase().includes('sms')) {
        return 'SMS delivery for India (+91) is not enabled in your Firebase settings. Please enable India under Firebase Console > Authentication > Settings > SMS Region Policy, or sign in with Google or Email.';
      }
      return 'This sign-in method is currently disabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request allowed at a time.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password or email. Please check your credentials.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-phone-number':
      return 'Invalid mobile number format. Please provide a valid 10-digit number.';
    case 'auth/invalid-verification-code':
      return 'Incorrect OTP code. Please enter the valid 6-digit code received on your phone.';
    case 'auth/code-expired':
      return 'This OTP has expired. Please request a new code.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Access temporarily blocked for security. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for today. Please use Google Sign In or Email.';
    default:
      return message.replace('Firebase: ', '') || 'Authentication failed. Please try again.';
  }
}
