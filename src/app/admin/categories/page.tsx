'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, RefreshCw, Folder } from 'lucide-react';
import { Category } from '@/types';
import { toast } from '@/lib/toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = () => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.warning('Please enter a category title');
      return;
    }

    setSubmitting(true);
    toast.loading('Creating category...');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), description: newDesc.trim() }),
      });
      if (res.ok) {
        toast.dismiss();
        toast.success(`Category "${newName}" created successfully!`);
        setNewName('');
        setNewDesc('');
        loadCategories();
      } else {
        toast.dismiss();
        toast.error('Failed to create category');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Network error creating category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Dishes in this category may need reassigning.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Category "${name}" deleted`);
      } else {
        toast.error('Failed to delete category');
      }
    } catch (err) {
      toast.error('Network error deleting category');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Taxonomy & Structure
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Culinary Categories
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            {categories.length} active menu sections configured
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs h-fit">
          <div className="border-b border-[#15370D]/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Create Category
            </h2>
            <p className="text-[11px] text-[#15370D]/60 mt-0.5">
              Adds a new section to public menu & POS
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                Category Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Specialty Cold Brews"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                Description / Subtitle
              </label>
              <textarea
                rows={3}
                placeholder="Editorial notes, pairing advice, or tasting notes..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50 min-h-[42px]"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Save Category'}</span>
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#15370D]">
              Existing Categories ({categories.length})
            </h2>
            <span className="text-[10px] text-[#15370D]/60 font-mono">Synced from PDF</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-bold text-[#15370D]/70">
              Loading Categories...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="p-4 rounded-xl bg-[#F5EFE1]/40 border border-[#15370D]/10 hover:border-[#15370D]/20 transition-colors flex items-start justify-between gap-3 text-xs text-[#15370D]"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-[#15370D]/70 flex-shrink-0" />
                      <h3 className="font-bold text-sm truncate">{cat.name}</h3>
                    </div>
                    {cat.description && (
                      <p className="text-[11px] text-[#15370D]/70 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <span className="inline-block text-[10px] font-mono font-semibold text-[#15370D]/50 uppercase">
                      Slug: {cat.slug}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-[#15370D]/40 hover:text-[#15370D] p-1.5 rounded-lg hover:bg-[#F5EFE1] transition-colors"
                    title={`Delete category ${cat.name}`}
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
