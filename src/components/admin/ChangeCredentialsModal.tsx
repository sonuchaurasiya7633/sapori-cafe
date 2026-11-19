'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, Lock, User, Eye, EyeOff, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from '@/lib/toast';

interface ChangeCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { email: string; name: string }) => void;
}

export default function ChangeCredentialsModal({
  isOpen,
  onClose,
  onSuccess,
}: ChangeCredentialsModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch current admin profile info when modal opens
  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      fetch('/api/auth/profile')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.user) {
            setNewEmail(data.user.email || '');
            setNewName(data.user.name || '');
          }
        })
        .catch(console.warn)
        .finally(() => setFetching(false));
    } else {
      // Reset sensitive fields when closed
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrentPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword.trim()) {
      toast.warning('Please enter your current password to authorize changes.');
      return;
    }

    if (!newEmail.trim()) {
      toast.warning('Admin email or ID cannot be empty.');
      return;
    }

    if (newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        toast.warning('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.warning('New password and confirm password do not match.');
        return;
      }
    }

    setSubmitting(true);
    toast.loading('Updating administrator credentials...');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newEmail: newEmail.trim(),
          newName: newName.trim(),
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      toast.dismiss();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      // Update local storage
      localStorage.setItem('sapori_admin_email', data.user.email);

      toast.success('Admin credentials updated successfully!', {
        description: `New ID: ${data.user.email}${newPassword ? ' • Password changed' : ''}`,
      });

      if (onSuccess) {
        onSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error updating administrator credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-[#15370D]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#15370D] text-[#DEB853] flex items-center justify-center shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#15370D]">
                Change Admin ID &amp; Password
              </h3>
              <p className="text-[11px] text-[#15370D]/60">
                Update access email, display name, or security password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded-full transition-colors cursor-pointer"
            aria-label="Close credentials modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {fetching ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-7 h-7 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#15370D]/70 uppercase tracking-wider">
              Loading current security profile...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password (Authorization) */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D] flex items-center justify-between">
                <span>Current Password *</span>
                <span className="text-[10px] font-normal text-rose-600 lowercase font-mono">
                  required to authorize changes
                </span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white border border-[#15370D]/25 rounded-xl p-2.5 pr-10 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#15370D] cursor-pointer"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin ID / Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D] mb-1">
                Admin ID / Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#15370D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@saporicafe.in"
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 pl-9 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                This is the ID/email you use to sign in to the operations portal.
              </p>
            </div>

            {/* Admin Display Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D] mb-1">
                Administrator Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#15370D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sapori Manager"
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 pl-9 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="pt-2 border-t border-[#15370D]/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/70 block mb-2">
                New Password (Leave blank if keeping current password)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D] mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 pr-9 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#15370D] cursor-pointer"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#15370D] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Repeat new password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#15370D]/10 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-[#15370D]/70 hover:bg-[#F5EFE1] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#DEB853]" />
                <span>{submitting ? 'Updating...' : 'Save Credentials'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
