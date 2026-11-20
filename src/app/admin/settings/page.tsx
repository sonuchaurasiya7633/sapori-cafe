'use client';

import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Store,
  Clock,
  Truck,
  Shield,
  Megaphone,
  MapPin,
  Phone,
  MessageSquare,
  Globe,
  AlertCircle,
  Power,
  RotateCcw,
  ImageIcon,
  KeyRound,
  ExternalLink,
  Search,
  FileCheck,
  BellRing,
  Volume2,
  Radio,
  Sparkles,
} from 'lucide-react';
import { SiteSettings } from '@/types';
import { toast } from '@/lib/toast';
import { playOrderChime, startOrderAlarm, stopOrderAlarm } from '@/lib/notifications/sound';
import ImageUpload from '@/components/ui/ImageUpload';
import ChangeCredentialsModal from '@/components/admin/ChangeCredentialsModal';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCredModal, setShowCredModal] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  const handleTestNotification = async () => {
    setTestingNotification(true);
    playOrderChime();
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Live test alert dispatched across all open screens & push subscribers!', {
          description: `Test Order #${data.order.orderNumber} • ₹${data.order.total}`,
        });
      } else {
        toast.error(data.error || 'Failed to dispatch test notification');
      }
    } catch (e) {
      toast.error('Network error triggering test notification');
    } finally {
      setTestingNotification(false);
    }
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.brandName) {
          setSettings(data);
          setInitialSettings(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setErrorMsg('Failed to fetch settings from server');
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setErrorMsg(null);
    toast.loading('Updating store settings...');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update store settings');
      }

      setSettings(data.settings);
      setInitialSettings(data.settings);
      toast.dismiss();
      toast.success('Settings updated successfully!', {
        description: `Brand: ${data.settings.brandName} • GST: ${data.settings.gstRatePercent}%`,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3500);
    } catch (err: any) {
      toast.dismiss();
      const msg = err.message || 'An error occurred while saving settings';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings({ ...initialSettings });
      toast.info('Settings form reset to saved values.');
    }
  };

  if (!settings) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
          Loading Store Configuration...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header with Save Button */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            System Operations & Configuration
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Store & Business Settings
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            Raja Park Café • Operational hours, delivery radiuses, kitchen switches & pricing parameters
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {savedMsg && (
            <div className="bg-[#F5EFE1] border border-[#15370D] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#15370D] flex items-center space-x-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="bg-[#FFFFFF] border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[42px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-[#F5EFE1] border-2 border-[#15370D] p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs text-[#15370D] font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Kitchen Emergency Switch & Live Status */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#15370D]/10 pb-3">
            <Power className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Live Kitchen Master Switch
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/15">
            <div>
              <span className="text-xs font-black uppercase text-[#15370D] block">
                {settings.isKitchenAcceptingOrders !== false ? 'Kitchen is Open & Accepting Orders' : 'Kitchen is Temporarily Paused'}
              </span>
              <p className="text-[11px] text-[#15370D]/70 mt-0.5">
                Toggle this switch off during rush hours or maintenance to pause new checkout submissions with an elegant notice to customers.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isKitchenAcceptingOrders !== false}
                onChange={(e) =>
                  setSettings({ ...settings, isKitchenAcceptingOrders: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#15370D]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[#FFFFFF] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFFFF] after:border-[#15370D]/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15370D]" />
            </label>
          </div>
        </div>

        {/* Section 2: Brand & Contact Info */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#15370D]/10 pb-3">
            <Store className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Brand Identity & Contact Coordinates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Café Brand Name *
              </label>
              <input
                type="text"
                required
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={settings.brandTagline}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Secondary Brand Line
              </label>
              <input
                type="text"
                value={settings.secondaryBrandLine}
                onChange={(e) => setSettings({ ...settings, secondaryBrandLine: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Official Address (Physical Location) *
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-semibold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Contact Phone Number *
              </label>
              <input
                type="text"
                required
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                WhatsApp Hotline / Concierge *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Operating Schedule (Displayed to guests)
              </label>
              <input
                type="text"
                value={settings.operatingHours}
                onChange={(e) => setSettings({ ...settings, operatingHours: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={settings.instagramUrl || ''}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/saporicafejaipur"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Google Maps Location Link
              </label>
              <input
                type="url"
                value={settings.googleMapsUrl || ''}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>
        </div>

        {/* Section: Brand Visuals & Dynamic Media Assets */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-[#15370D]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                Dynamic Brand Visuals &amp; Media Assets
              </h2>
            </div>
            <span className="text-[10px] text-[#15370D]/60 uppercase font-semibold">
              Live Cloudinary / CDN sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            {/* Homepage Hero Banner */}
            <div>
              <ImageUpload
                label="Homepage Hero Image"
                value={settings.heroImageUrl || ''}
                onChange={(url) => setSettings({ ...settings, heroImageUrl: url })}
                onRemove={() => setSettings({ ...settings, heroImageUrl: '' })}
              />
              <p className="text-[11px] text-[#15370D]/60 mt-1.5">
                Cinematic banner displayed prominently at the top of the user-facing homepage.
              </p>
            </div>

            {/* Footer Decorative Art / Banner */}
            <div>
              <ImageUpload
                label="Footer Culinary Artwork / Banner"
                value={settings.footerImageUrl || ''}
                onChange={(url) => setSettings({ ...settings, footerImageUrl: url })}
                onRemove={() => setSettings({ ...settings, footerImageUrl: '' })}
              />
              <p className="text-[11px] text-[#15370D]/60 mt-1.5">
                Unclipped culinary visual rendered softly over the footer. Leave empty to display minimalist footer without any cut-off image.
              </p>
            </div>

            {/* Brand Logo */}
            <div className="md:col-span-2">
              <ImageUpload
                label="Custom Brand Logo (Optional)"
                value={settings.logoUrl || ''}
                onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                onRemove={() => setSettings({ ...settings, logoUrl: '' })}
              />
              <p className="text-[11px] text-[#15370D]/60 mt-1.5">
                If provided, replaces the default SVG insignia in header and navigation.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Dining Channels & Operations */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#15370D]/10 pb-3">
            <Clock className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Active Dining Channels & Order Fulfillment
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="p-3.5 rounded-xl border border-[#15370D]/20 bg-[#F5EFE1]/40 flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.deliveryActive}
                onChange={(e) => setSettings({ ...settings, deliveryActive: e.target.checked })}
                className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
              />
              <div>
                <span className="block text-xs font-bold text-[#15370D]">Home Delivery</span>
                <span className="text-[10px] text-[#15370D]/60">Dispatch to Jaipur doors</span>
              </div>
            </label>

            <label className="p-3.5 rounded-xl border border-[#15370D]/20 bg-[#F5EFE1]/40 flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pickupActive}
                onChange={(e) => setSettings({ ...settings, pickupActive: e.target.checked })}
                className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
              />
              <div>
                <span className="block text-xs font-bold text-[#15370D]">Counter Pickup</span>
                <span className="text-[10px] text-[#15370D]/60">Takeaway from café bar</span>
              </div>
            </label>

            <label className="p-3.5 rounded-xl border border-[#15370D]/20 bg-[#F5EFE1]/40 flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dineInActive}
                onChange={(e) => setSettings({ ...settings, dineInActive: e.target.checked })}
                className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
              />
              <div>
                <span className="block text-xs font-bold text-[#15370D]">QR Table Dine-In</span>
                <span className="text-[10px] text-[#15370D]/60">Ordering from seated tables</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Estimated Delivery Time
              </label>
              <input
                type="text"
                value={settings.estimatedDeliveryTime || '30 - 45 mins'}
                onChange={(e) => setSettings({ ...settings, estimatedDeliveryTime: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Estimated Pickup Time
              </label>
              <input
                type="text"
                value={settings.estimatedPickupTime || '15 - 20 mins'}
                onChange={(e) => setSettings({ ...settings, estimatedPickupTime: e.target.value })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                min={1}
                value={settings.deliveryRadiusKm || 8}
                onChange={(e) => setSettings({ ...settings, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Fees, Minimums & Thresholds */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#15370D]/10 pb-3">
            <Truck className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Pricing Rules, Delivery Fees & Packaging
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Base Delivery Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.deliveryFee}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: Number(e.target.value) })
                }
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Min. Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.minOrderValue || 0}
                onChange={(e) =>
                  setSettings({ ...settings, minOrderValue: Number(e.target.value) })
                }
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Packaging Fee (₹)
              </label>
              <input
                type="number"
                min={0}
                value={settings.packagingFee}
                onChange={(e) =>
                  setSettings({ ...settings, packagingFee: Number(e.target.value) })
                }
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>
        </div>

        {/* Section 5: GST Taxation & Public Announcement */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-[#15370D]/10 pb-3">
            <Shield className="w-4 h-4 text-[#15370D]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              GST Rate & Guest Bulletin
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Restaurant GST Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={settings.gstRatePercent}
                onChange={(e) =>
                  setSettings({ ...settings, gstRatePercent: Number(e.target.value) })
                }
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">Standard Indian restaurant GST is 5%</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Public Announcement Banner (Displayed at top of website)
              </label>
              <input
                type="text"
                value={settings.announcementText || ''}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                placeholder="e.g. Complimentary Fresh Handcrafted Cold Brew tasting on all dine-in reservations this week."
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Search Engine Optimization & Google Search Console */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-[#15370D]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                Search Engine Optimization (SEO) &amp; Google Search Console
              </h2>
            </div>
            <span className="text-[10px] bg-[#15370D]/10 text-[#15370D] font-bold px-2 py-0.5 rounded-full border border-[#15370D]/20">
              Schema.org &amp; Next.js Metadata
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Canonical Production Domain
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.canonicalDomain || ''}
                  onChange={(e) => setSettings({ ...settings, canonicalDomain: e.target.value })}
                  placeholder="https://saporicafe.in or your production domain"
                  className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 pl-8 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
                <Globe className="w-3.5 h-3.5 text-[#15370D]/50 absolute left-2.5 top-3" />
              </div>
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Used in canonical tags, sitemap.xml, robots.txt, and OpenGraph URLs.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase text-[#15370D]/70">
                  Google Search Console Verification Token
                </label>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-[#15370D] hover:underline flex items-center space-x-1 font-semibold"
                >
                  <span>Open GSC</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={settings.googleVerificationCode || ''}
                onChange={(e) => setSettings({ ...settings, googleVerificationCode: e.target.value })}
                placeholder="e.g. abcd1234efgh5678 or meta tag content value"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Automatically rendered as &lt;meta name=&quot;google-site-verification&quot;&gt; across all public pages.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                placeholder="e.g. G-ABC123XYZ"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Optional GA4 stream ID for tracking search arrivals and conversions.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Meta Title Pattern Template
              </label>
              <input
                type="text"
                value={settings.metaTitleTemplate || ''}
                onChange={(e) => setSettings({ ...settings, metaTitleTemplate: e.target.value })}
                placeholder="%s | SAPORI CAFE | Raja Park, Jaipur"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Use %s as page title variable (e.g. Italian Menu | SAPORI CAFE).
              </span>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold uppercase text-[#15370D]/70">
                  Global Meta Description
                </label>
                <span className={`text-[10px] font-bold ${(settings.defaultMetaDescription?.length || 0) > 160 ? 'text-amber-700' : 'text-[#15370D]/60'}`}>
                  {settings.defaultMetaDescription?.length || 0}/160 characters (recommended 120-160)
                </span>
              </div>
              <textarea
                rows={2}
                value={settings.defaultMetaDescription || ''}
                onChange={(e) => setSettings({ ...settings, defaultMetaDescription: e.target.value })}
                placeholder="Experience artisanal wood-fired Neapolitan pizza, handcrafted pasta, and specialty coffee in Raja Park, Jaipur. Dine-in, takeaway, and fast local delivery."
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Default Local SEO Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={settings.defaultKeywords || ''}
                onChange={(e) => setSettings({ ...settings, defaultKeywords: e.target.value })}
                placeholder="cafes in raja park, best italian restaurant jaipur, wood fired pizza jaipur, specialty coffee jaipur"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>

          {/* Quick Technical SEO Testing & Inspection Links */}
          <div className="p-3.5 rounded-xl bg-[#F5EFE1]/50 border border-[#15370D]/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-[#15370D]">
              <FileCheck className="w-4 h-4 text-[#15370D]" />
              <span className="font-bold">Live Technical SEO Endpoints:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] font-bold text-[11px] transition-colors"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FFFFFF] border border-[#15370D]/20 hover:bg-[#F5EFE1] text-[#15370D] font-bold text-[11px] transition-colors"
              >
                <span>/robots.txt</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 font-bold text-[11px] transition-colors"
              >
                <span>Test Rich Results</span>
                <ExternalLink className="w-2.5 h-2.5 text-[#DEB853]" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 7: Firebase Cloud Messaging & Realtime Order Notifications */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#15370D]/10 pb-3">
            <div className="flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-[#DEB853]" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                  Realtime Order Notifications &amp; Firebase Cloud Messaging (FCM)
                </h2>
                <p className="text-[11px] text-[#15370D]/70">
                  Instant sound chime, browser push alerts &amp; background mobile notifications for every new order.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => playOrderChime()}
                className="px-3 py-1.5 rounded-xl border border-[#15370D]/20 bg-[#F5EFE1] hover:bg-[#15370D]/10 text-[#15370D] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Play Single Audio Bell Chime"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Single Chime</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  startOrderAlarm(15);
                  toast.success('Loud Order Alarm Triggered! (Auto-mutes in 15s or click Silence)', {
                    action: {
                      label: 'Silence Alarm',
                      onClick: () => stopOrderAlarm(),
                    },
                  });
                }}
                className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Test Repeating Order Alarm Ring"
              >
                <Volume2 className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>Test Alarm (Loop)</span>
              </button>

              <button
                type="button"
                disabled={testingNotification}
                onClick={handleTestNotification}
                className="px-3.5 py-1.5 rounded-xl bg-[#DEB853] hover:bg-[#c9a444] text-[#071c05] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title="Dispatch Simulated Live Order Notification"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{testingNotification ? 'Testing...' : 'Test Live Notification'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <Radio className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Realtime Dispatch Engine is Active:</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Even without external Firebase keys, in-app instant Server-Sent Events (SSE) and audio chimes work out-of-the-box in all active Admin and Kitchen screens. To enable background push notifications on staff phones even when the browser is closed or device locked, enter your Firebase Service Account credentials below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Firebase Project ID
              </label>
              <input
                type="text"
                value={settings.firebaseProjectId || ''}
                onChange={(e) => setSettings({ ...settings, firebaseProjectId: e.target.value })}
                placeholder="e.g. sapori-cafe-jaipur"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Found in Firebase Console → Project Settings → General
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Firebase Client Email
              </label>
              <input
                type="text"
                value={settings.firebaseClientEmail || ''}
                onChange={(e) => setSettings({ ...settings, firebaseClientEmail: e.target.value })}
                placeholder="e.g. firebase-adminsdk-xxxxx@sapori-cafe.iam.gserviceaccount.com"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                From Service Account private key JSON
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Firebase Private Key (Server Admin SDK)
              </label>
              <textarea
                rows={3}
                value={settings.firebasePrivateKey || ''}
                onChange={(e) => setSettings({ ...settings, firebasePrivateKey: e.target.value })}
                placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
              <span className="text-[10px] text-[#15370D]/60 mt-0.5 block">
                Private key from downloaded Google Service Account JSON
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Firebase Realtime Database URL (Optional)
              </label>
              <input
                type="text"
                value={settings.firebaseDatabaseUrl || ''}
                onChange={(e) => setSettings({ ...settings, firebaseDatabaseUrl: e.target.value })}
                placeholder="https://sapori-cafe-default-rtdb.firebaseio.com"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#15370D]/70 mb-1">
                Web Push VAPID Key / Messaging Sender ID
              </label>
              <input
                type="text"
                value={settings.firebaseVapidKey || ''}
                onChange={(e) => setSettings({ ...settings, firebaseVapidKey: e.target.value })}
                placeholder="e.g. BF8h0v_xyz123... (Cloud Messaging Web Push Certificate)"
                className="w-full bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl p-2.5 text-xs font-mono text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>
          </div>
        </div>

        {/* Section: Admin Security Credentials */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#15370D]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                Administrator Account &amp; Access Credentials
              </h2>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Security Profile
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/15">
            <div>
              <span className="text-xs font-black uppercase text-[#15370D] block">
                Change Admin Login ID / Email &amp; Password
              </span>
              <p className="text-[11px] text-[#15370D]/70 mt-0.5">
                Update the administrator credentials used to log into the Sapori Café Operations Portal.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCredModal(true)}
              className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs shrink-0 cursor-pointer flex items-center space-x-1.5 min-h-[38px]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#DEB853]" />
              <span>Change ID &amp; Password</span>
            </button>
          </div>
        </div>
      </form>

      {/* Security Credentials Modal */}
      <ChangeCredentialsModal
        isOpen={showCredModal}
        onClose={() => setShowCredModal(false)}
      />
    </div>
  );
}
