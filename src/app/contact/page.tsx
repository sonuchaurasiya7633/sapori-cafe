'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Clock, Send, CheckCircle2, Globe } from 'lucide-react';
import { SiteSettings } from '@/types';
import { DEFAULT_SITE_SETTINGS } from '@/data/seedMenu';
import { toast } from '@/lib/toast';

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.brandName) {
          setSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Please enter your name');
      return;
    }
    const cleanNum = phone.replace(/\D/g, '');
    if (cleanNum.length < 10) {
      toast.warning('Please enter a valid 10-digit phone number');
      return;
    }
    if (!message.trim()) {
      toast.warning('Please enter your message');
      return;
    }
    setSent(true);
    toast.success('Message sent successfully!', {
      description: 'Our cafe team will reach out to you shortly.',
    });
  };

  const cleanPhone = settings.contactPhone.replace(/\D/g, '').slice(-10);
  const cleanWa = settings.whatsappNumber.replace(/\D/g, '').slice(-10);

  return (
    <div className="bg-[#F5EFE1] min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2 sm:space-y-3">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#15370D]/70">
            Reach Out
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#15370D]">
            Visit & Contact Us
          </h1>
          <p className="text-xs sm:text-sm text-[#15370D]/80 leading-relaxed">
            We are nestled in Raja Park, Jaipur. Feel free to give us a call, send a WhatsApp inquiry, or stop by.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Contact Information */}
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-[#15370D] border-b border-[#15370D]/10 pb-3">
              Café Details
            </h2>

            <div className="space-y-4 sm:space-y-5 text-xs sm:text-sm text-[#15370D]">
              <div className="flex items-start space-x-3.5">
                <MapPin className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                <div>
                  <h3 className="font-bold">Our Physical Location</h3>
                  <p className="text-xs text-[#15370D]/75 mt-0.5 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                <div>
                  <h3 className="font-bold">Telephone Inquiries</h3>
                  <p className="text-xs text-[#15370D]/75 mt-0.5">
                    <a href={`tel:+91${cleanPhone}`} className="underline font-bold text-xs sm:text-sm">
                      {settings.contactPhone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <MessageSquare className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                <div>
                  <h3 className="font-bold">WhatsApp Support</h3>
                  <p className="text-xs text-[#15370D]/75 mt-0.5">
                    <a
                      href={`https://wa.me/91${cleanWa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold"
                    >
                      Chat with us on WhatsApp ({settings.whatsappNumber})
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Clock className="w-5 h-5 flex-shrink-0 text-[#15370D] mt-0.5" />
                <div>
                  <h3 className="font-bold">Working Hours</h3>
                  <p className="text-xs text-[#15370D]/75 mt-0.5">
                    {settings.operatingHours}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#15370D]/10 flex flex-wrap gap-2.5 sm:gap-3">
              <a
                href={`tel:+91${cleanPhone}`}
                className="bg-[#15370D] text-[#FFFFFF] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 min-h-[44px] shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/91${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] hover:bg-[#FFFFFF] px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 min-h-[44px] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-base sm:text-lg font-bold text-[#15370D] border-b border-[#15370D]/10 pb-3">
              Send a Direct Message
            </h2>

            {sent ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-[#F5EFE1] rounded-full mx-auto flex items-center justify-center text-[#15370D]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-[#15370D]">Message Delivered!</h3>
                <p className="text-xs text-[#15370D]/70 max-w-xs mx-auto">
                  Thank you for writing to Sapori Café. Our team will review your message and reply via WhatsApp or phone shortly.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setPhone('');
                    setMessage('');
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-[#15370D] underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanmay Agarwal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98290 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#15370D] mb-1.5">
                    Your Inquiry or Feedback *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our culinary team help you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-3 text-xs sm:text-sm text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
