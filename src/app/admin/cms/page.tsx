'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Sparkles,
  Layers,
  Search,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FileText,
  HelpCircle,
  Camera,
  MapPin,
  Shield,
  FileCheck,
  RotateCcw,
  Copy,
  UploadCloud,
} from 'lucide-react';
import { CMSPage, CMSPageSection } from '@/types';
import { toast } from '@/lib/toast';
import ImageUpload from '@/components/ui/ImageUpload';

// Preset cafe images available in the system
const CAFE_MEDIA_PRESETS = [
  { label: 'Hero Cafe Night Storefront', path: '/images/hero-cafe.webp' },
  { label: 'Hero Ultra-HD Wide', path: '/images/hero-cafe-hd.webp' },
  { label: 'Warm Cafe Sketch', path: '/images/footer-cafe-sketch.png' },
  { label: 'Footer Banner Dark Green', path: '/images/footer-banner.jpg' },
];

export default function AdminCMSPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media'>('content');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaList, setMediaList] = useState(CAFE_MEDIA_PRESETS);

  const handleMediaUploaded = (url: string) => {
    const newMedia = {
      label: `Uploaded Visual (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      path: url,
    };
    setMediaList((prev) => [newMedia, ...prev]);
    toast.success('Asset added to Media Library!');
  };

  const handleSetAsHero = (url: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== 'home') return page;
        const updatedSections = page.sections.map((sec) => {
          if (sec.id !== 'hero') return sec;
          return {
            ...sec,
            fields: {
              ...sec.fields,
              heroImage: url,
            },
          };
        });
        return { ...page, sections: updatedSections };
      })
    );

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heroImageUrl: url }),
    }).catch(console.warn);

    toast.success('Applied as Homepage Hero Banner! Remember to click Save Page.');
  };

  // Fetch all CMS pages
  const loadCMSPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cms/pages');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.pages)) {
        setPages(data.pages);
      } else {
        throw new Error(data.error || 'Failed to load CMS pages');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading CMS pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCMSPages();
  }, []);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];

  // Toggle section accordion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Update a single field in a section
  const handleFieldChange = (sectionId: string, fieldKey: string, value: any) => {
    if (!selectedPage) return;
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPage.id) return page;
        const updatedSections = page.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return {
            ...sec,
            fields: {
              ...sec.fields,
              [fieldKey]: value,
            },
          };
        });
        return {
          ...page,
          sections: updatedSections,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Toggle section visibility
  const handleSectionVisibilityToggle = (sectionId: string, isVisible: boolean) => {
    if (!selectedPage) return;
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPage.id) return page;
        const updatedSections = page.sections.map((sec) => {
          if (sec.id !== sectionId) return sec;
          return { ...sec, isVisible };
        });
        return {
          ...page,
          sections: updatedSections,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Update page SEO fields
  const handlePageMetadataChange = (key: keyof CMSPage, value: any) => {
    if (!selectedPage) return;
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id !== selectedPage.id) return page;
        return {
          ...page,
          [key]: value,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Save current page changes to backend API
  const handleSavePage = async (publishNow = false) => {
    if (!selectedPage) return;
    setSaving(true);
    setErrorMsg(null);
    toast.loading('Saving CMS page changes...');

    try {
      const payload: Partial<CMSPage> = {
        title: selectedPage.title,
        seoTitle: selectedPage.seoTitle,
        seoDescription: selectedPage.seoDescription,
        seoKeywords: selectedPage.seoKeywords,
        isPublished: publishNow ? true : selectedPage.isPublished,
        sections: selectedPage.sections,
      };

      const res = await fetch(`/api/cms/pages/${selectedPage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save CMS page changes');
      }

      toast.dismiss();
      toast.success('Changes saved successfully!', {
        description: `Page: ${selectedPage.title} (${selectedPage.slug}) updated in database.`,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3500);
      await loadCMSPages();
    } catch (err: any) {
      console.error(err);
      toast.dismiss();
      const msg = err.message || 'Error saving CMS page';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Publish immediate
  const handlePublishToggle = async () => {
    if (!selectedPage) return;
    try {
      setSaving(true);
      toast.loading('Updating publication status...');
      const res = await fetch(`/api/cms/pages/${selectedPage.id}/publish`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle publish status');
      }
      toast.dismiss();
      const newStatus = data.page.isPublished ? 'Published (Live)' : 'Draft Mode';
      toast.success(`Page is now in ${newStatus}!`);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3500);
      await loadCMSPages();
    } catch (err: any) {
      toast.dismiss();
      const msg = err.message || 'Failed to publish';
      toast.error(msg);
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  // Add item to array field (e.g. FAQ or Gallery or Pillars)
  const handleAddArrayItem = (sectionId: string, fieldKey: string, defaultItem: any) => {
    if (!selectedPage) return;
    const currentSection = selectedPage.sections.find((s) => s.id === sectionId);
    const existingList = Array.isArray(currentSection?.fields[fieldKey])
      ? [...currentSection!.fields[fieldKey]]
      : [];
    existingList.push(defaultItem);
    handleFieldChange(sectionId, fieldKey, existingList);
  };

  // Remove item from array field
  const handleRemoveArrayItem = (sectionId: string, fieldKey: string, index: number) => {
    if (!selectedPage) return;
    const currentSection = selectedPage.sections.find((s) => s.id === sectionId);
    const existingList = Array.isArray(currentSection?.fields[fieldKey])
      ? [...currentSection!.fields[fieldKey]]
      : [];
    existingList.splice(index, 1);
    handleFieldChange(sectionId, fieldKey, existingList);
  };

  // Update item inside array field
  const handleUpdateArrayItem = (
    sectionId: string,
    fieldKey: string,
    index: number,
    itemKey: string,
    val: any
  ) => {
    if (!selectedPage) return;
    const currentSection = selectedPage.sections.find((s) => s.id === sectionId);
    const existingList = Array.isArray(currentSection?.fields[fieldKey])
      ? [...currentSection!.fields[fieldKey]]
      : [];
    existingList[index] = {
      ...existingList[index],
      [itemKey]: val,
    };
    handleFieldChange(sectionId, fieldKey, existingList);
  };

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#15370D]/15 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#15370D]/10 text-[#15370D] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5 text-[#DEB853]" />
            <span>Enterprise Dynamic CMS Studio</span>
          </div>
          <h1 className="text-2xl font-black text-[#15370D] tracking-tight">
            Website Content Management
          </h1>
          <p className="text-sm text-[#15370D]/70 mt-1 max-w-2xl">
            Edit live headlines, text, imagery, and SEO metadata across all public website pages in real-time. Changes persist directly into the database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedPage && (
            <Link
              href={selectedPage.slug}
              target="_blank"
              className="inline-flex items-center space-x-1.5 bg-[#F5EFE1] border border-[#15370D]/20 text-[#15370D] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D] hover:text-[#F5EFE1] transition-all shadow-sm"
            >
              <span>View Live Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={() => handleSavePage(false)}
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 bg-[#15370D] hover:bg-[#15370D]/90 text-[#F5EFE1] px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#DEB853]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#DEB853]" />
                <span>Save Changes</span>
              </>
            )}
          </button>

          <button
            onClick={handlePublishToggle}
            disabled={saving || loading || !selectedPage}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
              selectedPage?.isPublished
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{selectedPage?.isPublished ? 'Published (Live)' : 'Draft (Publish)'}</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {savedMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-5 py-3 rounded-xl flex items-center space-x-3 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>CMS changes saved successfully to database! Public site updated.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 px-5 py-3 rounded-xl flex items-center space-x-3 text-sm font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main CMS Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Pages Index */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#15370D]/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#15370D] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#DEB853]" />
                <span>Website Pages ({pages.length})</span>
              </h2>
              <button
                onClick={loadCMSPages}
                title="Refresh pages"
                className="text-[#15370D]/60 hover:text-[#15370D] p-1 rounded-lg hover:bg-[#F5EFE1] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#15370D]/50" />
              <input
                type="text"
                placeholder="Search pages by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] placeholder-[#15370D]/50 focus:outline-none focus:ring-1 focus:ring-[#15370D]"
              />
            </div>

            {/* Pages Navigation List */}
            <div className="space-y-2">
              {filteredPages.map((page) => {
                const isSelected = page.id === selectedPageId;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      setSelectedPageId(page.id);
                      setExpandedSections({});
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#15370D] text-[#F5EFE1] border-[#15370D] shadow-sm'
                        : 'bg-[#F5EFE1]/40 border-[#15370D]/15 text-[#15370D] hover:bg-[#F5EFE1] hover:border-[#15370D]/30'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold truncate">{page.title}</span>
                        {isSelected && <Sparkles className="w-3 h-3 text-[#DEB853] flex-shrink-0" />}
                      </div>
                      <span
                        className={`text-[11px] font-mono block truncate ${
                          isSelected ? 'text-[#F5EFE1]/75' : 'text-[#15370D]/60'
                        }`}
                      >
                        {page.slug}
                      </span>
                    </div>

                    <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          page.isPublished
                            ? isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-emerald-100 text-emerald-800'
                            : isSelected
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {page.isPublished ? 'Live' : 'Draft'}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-[#F5EFE1]/60' : 'text-[#15370D]/50'
                        }`}
                      >
                        {page.sections.length} sections
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Media Presets Card */}
          <div className="bg-white border border-[#15370D]/15 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#15370D] flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-[#DEB853]" />
              <span>Available Cafe Image Assets</span>
            </h3>
            <p className="text-[11px] text-[#15370D]/70">
              High-resolution optimized assets available for use in hero banners, sections, and galleries:
            </p>
            <div className="space-y-2">
              {CAFE_MEDIA_PRESETS.map((asset, i) => (
                <div
                  key={i}
                  className="bg-[#F5EFE1]/50 border border-[#15370D]/10 rounded-lg p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-[#15370D] block truncate">{asset.label}</span>
                    <span className="font-mono text-[10px] text-[#15370D]/60 truncate block">
                      {asset.path}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(asset.path);
                      toast.info(`Copied "${asset.path}" to clipboard!`);
                    }}
                    className="text-[10px] bg-[#15370D] text-[#F5EFE1] px-2 py-1 rounded hover:bg-[#15370D]/80 flex-shrink-0"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Editor Area */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPage ? (
            <div className="bg-white border border-[#15370D]/15 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Page Breadcrumb / Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#15370D]/10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/60">
                    Editing Page
                  </span>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-[#15370D]">{selectedPage.title}</h2>
                    <span className="font-mono text-xs bg-[#F5EFE1] text-[#15370D] px-2.5 py-0.5 rounded-full border border-[#15370D]/20">
                      {selectedPage.slug}
                    </span>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-[#F5EFE1] p-1 rounded-xl border border-[#15370D]/15">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'content'
                        ? 'bg-[#15370D] text-[#F5EFE1] shadow-sm'
                        : 'text-[#15370D] hover:bg-[#15370D]/10'
                    }`}
                  >
                    Sections &amp; Content ({selectedPage.sections.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'seo'
                        ? 'bg-[#15370D] text-[#F5EFE1] shadow-sm'
                        : 'text-[#15370D] hover:bg-[#15370D]/10'
                    }`}
                  >
                    SEO &amp; Metadata
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'media'
                        ? 'bg-[#15370D] text-[#F5EFE1] shadow-sm'
                        : 'text-[#15370D] hover:bg-[#15370D]/10'
                    }`}
                  >
                    Media Library
                  </button>
                </div>
              </div>

              {/* TAB 1: SECTION-WISE CONTENT EDITOR */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#15370D]/70">
                    <span>Click section to expand and edit live fields:</span>
                    <span>{selectedPage.sections.filter((s) => s.isVisible).length} active sections</span>
                  </div>

                  {selectedPage.sections.map((section) => {
                    const isExpanded = !!expandedSections[section.id];
                    return (
                      <div
                        key={section.id}
                        className={`border rounded-xl transition-all ${
                          section.isVisible
                            ? isExpanded
                              ? 'border-[#15370D] bg-white shadow-sm'
                              : 'border-[#15370D]/20 bg-[#F5EFE1]/20 hover:border-[#15370D]/40'
                            : 'border-dashed border-gray-300 bg-gray-50 opacity-60'
                        }`}
                      >
                        {/* Section Header Accordion Bar */}
                        <div className="p-4 flex items-center justify-between select-none">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex items-center space-x-3 text-left flex-1"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#DEB853]" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-sm font-bold text-[#15370D]">{section.name}</h3>
                                <span className="font-mono text-[10px] text-[#15370D]/60 bg-[#F5EFE1] px-1.5 py-0.5 rounded border border-[#15370D]/10">
                                  {section.id}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#15370D]/60">
                                {Object.keys(section.fields).length} editable fields
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center space-x-3">
                            {/* Visibility Toggle */}
                            <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-semibold text-[#15370D]">
                              <input
                                type="checkbox"
                                checked={section.isVisible}
                                onChange={(e) =>
                                  handleSectionVisibilityToggle(section.id, e.target.checked)
                                }
                                className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                              />
                              <span className="text-[11px]">
                                {section.isVisible ? 'Visible' : 'Hidden'}
                              </span>
                            </label>

                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-1 rounded text-[#15370D]/60 hover:text-[#15370D]"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Section Fields Expanded Area */}
                        {isExpanded && (
                          <div className="p-5 border-t border-[#15370D]/10 bg-white space-y-4">
                            {Object.entries(section.fields).map(([fieldKey, fieldValue]) => {
                              // CASE 1: Array of Objects (Pillars, FAQs, Gallery items)
                              if (Array.isArray(fieldValue)) {
                                return (
                                  <div
                                    key={fieldKey}
                                    className="space-y-3 pt-3 border-t border-[#15370D]/10"
                                  >
                                    <div className="flex items-center justify-between">
                                      <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                                        Repeatable Collection: {fieldKey} ({fieldValue.length} items)
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Dynamic defaults based on collection type
                                          let defaultItem: any = { label: 'New Item', desc: '' };
                                          if (fieldKey === 'items' && section.id === 'faq_list') {
                                            defaultItem = {
                                              q: 'New Question?',
                                              a: 'Answer description...',
                                            };
                                          } else if (
                                            fieldKey === 'items' &&
                                            section.id === 'gallery_grid'
                                          ) {
                                            defaultItem = {
                                              title: 'New Gallery Item',
                                              category: 'Café',
                                              subtitle: 'Moment details',
                                            };
                                          }
                                          handleAddArrayItem(section.id, fieldKey, defaultItem);
                                        }}
                                        className="inline-flex items-center space-x-1 text-xs bg-[#15370D] text-[#F5EFE1] px-2.5 py-1 rounded-lg hover:bg-[#15370D]/80"
                                      >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Item</span>
                                      </button>
                                    </div>

                                    <div className="space-y-3">
                                      {fieldValue.map((item: any, index: number) => (
                                        <div
                                          key={index}
                                          className="bg-[#F5EFE1]/40 border border-[#15370D]/15 rounded-xl p-3.5 space-y-2 relative"
                                        >
                                          <div className="flex items-center justify-between pb-1 border-b border-[#15370D]/10">
                                            <span className="text-[11px] font-bold text-[#15370D]">
                                              Item #{index + 1}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveArrayItem(section.id, fieldKey, index)
                                              }
                                              className="text-rose-600 hover:text-rose-800 p-1"
                                              title="Remove item"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(item).map(([subKey, subVal]) => (
                                              <div key={subKey} className="space-y-1">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/70">
                                                  {subKey}
                                                </label>
                                                {typeof subVal === 'string' && subVal.length > 60 ? (
                                                  <textarea
                                                    rows={2}
                                                    value={subVal}
                                                    onChange={(e) =>
                                                      handleUpdateArrayItem(
                                                        section.id,
                                                        fieldKey,
                                                        index,
                                                        subKey,
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full px-3 py-1.5 bg-white border border-[#15370D]/20 rounded-lg text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                                                  />
                                                ) : (
                                                  <input
                                                    type="text"
                                                    value={String(subVal ?? '')}
                                                    onChange={(e) =>
                                                      handleUpdateArrayItem(
                                                        section.id,
                                                        fieldKey,
                                                        index,
                                                        subKey,
                                                        e.target.value
                                                      )
                                                    }
                                                    className="w-full px-3 py-1.5 bg-white border border-[#15370D]/20 rounded-lg text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                                                  />
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              // CASE 2: Image Field (e.g. heroImage, image, bannerImage)
                              const isImageField =
                                fieldKey.toLowerCase().includes('image') ||
                                fieldKey.toLowerCase().includes('photo') ||
                                fieldKey.toLowerCase().includes('icon');

                              if (isImageField) {
                                return (
                                  <div key={fieldKey} className="space-y-2 pt-3 border-t border-[#15370D]/10">
                                    <ImageUpload
                                      label={`Dynamic Visual: ${fieldKey}`}
                                      value={String(fieldValue ?? '')}
                                      onChange={(url) => handleFieldChange(section.id, fieldKey, url)}
                                      onRemove={() => handleFieldChange(section.id, fieldKey, '')}
                                    />

                                    {/* Direct URL input fallback */}
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        placeholder="Or paste external/CDN image URL directly..."
                                        value={String(fieldValue ?? '')}
                                        onChange={(e) =>
                                          handleFieldChange(section.id, fieldKey, e.target.value)
                                        }
                                        className="flex-1 px-3 py-1.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-lg text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                                      />
                                    </div>
                                  </div>
                                );
                              }

                              // CASE 3: Long Text (description, story paragraphs, policy body)
                              const isLongText =
                                typeof fieldValue === 'string' &&
                                (fieldKey.toLowerCase().includes('desc') ||
                                  fieldKey.toLowerCase().includes('body') ||
                                  fieldKey.toLowerCase().includes('story') ||
                                  fieldKey.toLowerCase().includes('prompt') ||
                                  fieldValue.length > 80);

                              if (isLongText) {
                                return (
                                  <div key={fieldKey} className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                                      {fieldKey}
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={String(fieldValue ?? '')}
                                      onChange={(e) =>
                                        handleFieldChange(section.id, fieldKey, e.target.value)
                                      }
                                      className="w-full px-3 py-2 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                                    />
                                  </div>
                                );
                              }

                              // CASE 4: Standard Text Input (badge, title, subtitle, cta links, etc.)
                              return (
                                <div key={fieldKey} className="space-y-1">
                                  <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                                    {fieldKey}
                                  </label>
                                  <input
                                    type="text"
                                    value={String(fieldValue ?? '')}
                                    onChange={(e) =>
                                      handleFieldChange(section.id, fieldKey, e.target.value)
                                    }
                                    className="w-full px-3 py-2 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: PAGE SEO & METADATA EDITOR */}
              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div className="bg-[#15370D] text-[#F5EFE1] p-5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DEB853]">
                      Google Search &amp; Social Graph Preview
                    </span>
                    <h4 className="text-base font-bold text-white line-clamp-1">
                      {selectedPage.seoTitle || selectedPage.title}
                    </h4>
                    <p className="text-xs text-[#F5EFE1]/80 line-clamp-2">
                      {selectedPage.seoDescription ||
                        'Discover authentic Italian slow-fermentation and artisanal coffee extraction at Sapori Cafe.'}
                    </p>
                    <span className="text-[11px] font-mono text-[#DEB853]/90 block">
                      https://saporicafe.in{selectedPage.slug}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                        Page Internal Title
                      </label>
                      <input
                        type="text"
                        value={selectedPage.title}
                        onChange={(e) => handlePageMetadataChange('title', e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                          SEO Meta Title
                        </label>
                        <span className="text-[10px] text-[#15370D]/60 font-mono">
                          {selectedPage.seoTitle?.length || 0} / 60 characters
                        </span>
                      </div>
                      <input
                        type="text"
                        value={selectedPage.seoTitle || ''}
                        onChange={(e) => handlePageMetadataChange('seoTitle', e.target.value)}
                        placeholder="SAPORI CAFÉ & EATERY | Title..."
                        className="w-full px-4 py-2.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                          SEO Meta Description
                        </label>
                        <span className="text-[10px] text-[#15370D]/60 font-mono">
                          {selectedPage.seoDescription?.length || 0} / 160 characters
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={selectedPage.seoDescription || ''}
                        onChange={(e) => handlePageMetadataChange('seoDescription', e.target.value)}
                        placeholder="Meta description for search engines and social cards..."
                        className="w-full px-4 py-2.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                        Target Keywords (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={selectedPage.seoKeywords || ''}
                        onChange={(e) => handlePageMetadataChange('seoKeywords', e.target.value)}
                        placeholder="Sapori Cafe, Jaipur cafe, Neapolitan Pizza, Raja Park..."
                        className="w-full px-4 py-2.5 bg-[#F5EFE1]/40 border border-[#15370D]/20 rounded-xl text-xs text-[#15370D] focus:outline-none focus:ring-1 focus:ring-[#15370D]"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPage.isPublished}
                          onChange={(e) =>
                            handlePageMetadataChange('isPublished', e.target.checked)
                          }
                          className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                        />
                        <span className="text-xs font-bold text-[#15370D]">
                          Page is Published and visible on public website navigation
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MEDIA LIBRARY */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  {/* Upload Card */}
                  <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-[#15370D]">
                          Upload New Dynamic Visual Asset
                        </h4>
                        <p className="text-xs text-[#15370D]/60">
                          Uploads directly to Cloudinary / CDN with automated WebP &amp; AVIF optimization
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Cloudinary CDN
                      </span>
                    </div>

                    <ImageUpload
                      label="Drop or Select Any Cafe Visual"
                      onChange={(url) => {
                        handleMediaUploaded(url);
                      }}
                    />
                  </div>

                  {/* Media Gallery Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
                        Visual Assets &amp; Presets ({mediaList.length})
                      </h4>
                      <span className="text-[11px] text-[#15370D]/60">
                        Copy URL or apply directly to homepage hero
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {mediaList.map((media, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-[#15370D]/15 rounded-xl overflow-hidden shadow-xs hover:border-[#DEB853] transition-all flex flex-col justify-between"
                        >
                          <div className="relative w-full h-36 bg-stone-100 flex items-center justify-center">
                            <Image
                              src={media.path}
                              alt={media.label}
                              fill
                              sizes="240px"
                              className="object-cover"
                            />
                          </div>
                          <div className="p-3 space-y-2">
                            <p className="text-xs font-bold text-[#15370D] truncate" title={media.label}>
                              {media.label}
                            </p>
                            <p
                              className="text-[10px] text-stone-500 font-mono truncate"
                              title={media.path}
                            >
                              {media.path}
                            </p>
                            <div className="flex items-center gap-1.5 pt-1 border-t border-[#15370D]/10">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(media.path);
                                  toast.success('Image URL copied to clipboard!');
                                }}
                                className="flex-1 py-1.5 px-2 text-[11px] font-bold text-[#15370D] bg-[#F5EFE1]/80 hover:bg-[#15370D] hover:text-[#F5EFE1] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy URL</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetAsHero(media.path)}
                                className="py-1.5 px-2.5 text-[11px] font-bold text-[#15370D] border border-[#15370D]/20 hover:border-[#15370D] rounded-lg transition-colors cursor-pointer"
                                title="Apply as Homepage Hero Banner"
                              >
                                Set as Hero
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-4 border-t border-[#15370D]/10 flex items-center justify-between">
                <span className="text-[11px] text-[#15370D]/60">
                  Last updated: {new Date(selectedPage.updatedAt).toLocaleString()}
                </span>
                <button
                  onClick={() => handleSavePage(false)}
                  disabled={saving}
                  className="inline-flex items-center space-x-2 bg-[#15370D] text-[#F5EFE1] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#15370D]/90 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-[#DEB853]" />
                  <span>Save Page</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#15370D]/15 rounded-2xl p-12 text-center text-[#15370D]/60">
              Select a page from the left to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
