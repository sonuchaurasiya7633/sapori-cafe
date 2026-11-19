import { toast as sonnerToast, ExternalToast } from 'sonner';

// Deduplication cache to prevent toast spamming on double/multi clicks
const recentToasts = new Map<string, number>();
const DEDUPE_WINDOW_MS = 1500;

function shouldSkipDuplicate(message: string): boolean {
  const now = Date.now();
  const lastTime = recentToasts.get(message);
  if (lastTime && now - lastTime < DEDUPE_WINDOW_MS) {
    return true;
  }
  recentToasts.set(message, now);
  // Clean up older entries
  if (recentToasts.size > 50) {
    for (const [k, time] of recentToasts.entries()) {
      if (now - time > 10000) recentToasts.delete(k);
    }
  }
  return false;
}

export interface ToastOptions extends ExternalToast {
  description?: string;
  duration?: number;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    if (shouldSkipDuplicate(message)) return;
    return sonnerToast.success(message, {
      duration: options?.duration || 3500,
      closeButton: true,
      className:
        'sapori-toast-success border-emerald-500/30 bg-white text-[#15370D] shadow-md font-sans',
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    if (shouldSkipDuplicate(message)) return;
    return sonnerToast.error(message, {
      duration: options?.duration || 5500, // Longer for errors so users can read
      closeButton: true,
      className:
        'sapori-toast-error border-rose-500/30 bg-white text-rose-950 shadow-md font-sans',
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    if (shouldSkipDuplicate(message)) return;
    return sonnerToast.warning(message, {
      duration: options?.duration || 4500,
      closeButton: true,
      className:
        'sapori-toast-warning border-amber-500/30 bg-white text-amber-950 shadow-md font-sans',
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    if (shouldSkipDuplicate(message)) return;
    return sonnerToast.info(message, {
      duration: options?.duration || 3500,
      closeButton: true,
      className:
        'sapori-toast-info border-[#DEB853]/40 bg-white text-[#15370D] shadow-md font-sans',
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      closeButton: false,
      className:
        'sapori-toast-loading border-[#15370D]/20 bg-white text-[#15370D] shadow-md font-sans',
      ...options,
    });
  },

  promise: <T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: string | ((result: T) => string);
      error: string | ((err: any) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, {
      loading: data.loading,
      success: data.success,
      error: data.error,
      closeButton: true,
      className: 'sapori-toast-promise shadow-md font-sans',
      ...options,
    });
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

export default toast;
