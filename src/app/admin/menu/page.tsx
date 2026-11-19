'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Trash2,
  Sparkles,
  Flame,
  Check,
  X,
  RefreshCw,
  UtensilsCrossed,
  Tag,
  AlertCircle,
  Pencil,
  ImageIcon,
} from 'lucide-react';
import { MenuItem, Category } from '@/types';
import { toast } from '@/lib/toast';
import ImageUpload from '@/components/ui/ImageUpload';

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Item modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCloudinaryPublicId, setNewItemCloudinaryPublicId] = useState('');
  const [newItemSignature, setNewItemSignature] = useState(false);
  const [newItemSpicy, setNewItemSpicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Item modal state
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editCloudinaryPublicId, setEditCloudinaryPublicId] = useState('');
  const [editSignature, setEditSignature] = useState(false);
  const [editSpicy, setEditSpicy] = useState(false);
  const [editAvailable, setEditAvailable] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        fetch('/api/menu').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);
      if (menuRes.items) setItems(menuRes.items);
      if (catRes.categories) {
        setCategories(catRes.categories);
        if (catRes.categories.length > 0 && !newItemCategory) {
          setNewItemCategory(catRes.categories[0].slug);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setEditCategory(item.category);
    setEditDesc(item.description || '');
    setEditImage(item.image || '');
    setEditCloudinaryPublicId(item.cloudinaryPublicId || '');
    setEditSignature(Boolean(item.isSignature));
    setEditSpicy(Boolean(item.isSpicy));
    setEditAvailable(Boolean(item.isAvailable));
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditCategory('');
    setEditDesc('');
    setEditImage('');
    setEditCloudinaryPublicId('');
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const updated = !item.isAvailable;
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: updated }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: updated } : i))
        );
        toast.success(`"${item.name}" is now ${updated ? 'Available' : 'Unavailable'}`);
      } else {
        toast.error('Failed to update item availability');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating item');
    }
  };

  const handleUpdatePrice = async (item: MenuItem, newPriceStr: string) => {
    const price = Number(newPriceStr);
    if (isNaN(price) || price <= 0 || price === item.price) return;

    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, price } : i)));
        toast.success(`Updated price for "${item.name}" to ₹${price}`);
      } else {
        toast.error('Failed to update price');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error updating price');
    }
  };

  const handleDeleteItem = async (itemId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from the menu catalog?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.success(`Deleted "${name}" from menu catalog`);
      } else {
        toast.error('Failed to delete menu item');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error deleting item');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !newItemCategory) {
      toast.warning('Please enter dish name, price, and category');
      return;
    }

    setSubmitting(true);
    toast.loading('Creating menu item...');
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemName.trim(),
          price: Number(newItemPrice),
          category: newItemCategory,
          description: newItemDesc.trim(),
          image: newItemImage || undefined,
          cloudinaryPublicId: newItemCloudinaryPublicId || undefined,
          isSignature: newItemSignature,
          isSpicy: newItemSpicy,
          isAvailable: true,
          dietary: 'veg',
        }),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success(`Created "${newItemName}" successfully!`);
        setShowCreateModal(false);
        setNewItemName('');
        setNewItemPrice('');
        setNewItemDesc('');
        setNewItemImage('');
        setNewItemCloudinaryPublicId('');
        setNewItemSignature(false);
        setNewItemSpicy(false);
        loadData();
      } else {
        const data = await res.json();
        toast.dismiss();
        toast.error(data.error || 'Failed to create menu item');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Network error creating menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editName.trim() || !editPrice || !editCategory) {
      toast.warning('Please enter dish name, price, and category');
      return;
    }

    setUpdating(true);
    toast.loading('Updating menu item...');
    try {
      const res = await fetch(`/api/menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          category: editCategory,
          description: editDesc.trim(),
          image: editImage || '',
          cloudinaryPublicId: editCloudinaryPublicId || '',
          isSignature: editSignature,
          isSpicy: editSpicy,
          isAvailable: editAvailable,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.dismiss();
        toast.success(`Updated "${editName}" successfully!`);
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...data.item } : i))
        );
        handleCloseEdit();
      } else {
        const data = await res.json();
        toast.dismiss();
        toast.error(data.error || 'Failed to update menu item');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Network error updating menu item');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#15370D]/70 block">
            Catalog Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#15370D] mt-0.5">
            Culinary Menu & Pricing
          </h1>
          <p className="text-xs text-[#15370D]/70 mt-0.5">
            {items.length} items across {categories.length} culinary categories
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="bg-[#FFFFFF] border border-[#15370D]/20 text-[#15370D] hover:bg-[#F5EFE1] px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-colors shadow-2xs min-h-[38px] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-xs transition-colors min-h-[38px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Creation</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#15370D]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5EFE1]/50 border border-[#15370D]/20 rounded-xl pl-10 pr-4 py-2 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D] placeholder:text-[#15370D]/40"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase text-[#15370D]/70 whitespace-nowrap">
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#F5EFE1]/70 border border-[#15370D]/20 rounded-xl py-2 px-3 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#15370D]/60 pt-1 border-t border-[#15370D]/10">
          <span>
            Showing <strong className="text-[#15370D]">{filtered.length}</strong> items
          </span>
          {(selectedCategory !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearch('');
              }}
              className="text-[11px] font-bold text-[#15370D] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Menu List Container */}
      <div className="bg-[#FFFFFF] border border-[#15370D]/15 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#15370D]/70">
              Loading Catalog Items...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#15370D]">
            <UtensilsCrossed className="w-10 h-10 opacity-30 mx-auto" />
            <p className="font-bold text-sm">No dishes match the selected filter</p>
            <p className="text-xs text-[#15370D]/60">Try clearing search terms or selected category.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#15370D] min-w-[820px]">
                <thead className="bg-[#F5EFE1] uppercase font-bold text-[10px] tracking-wider border-b border-[#15370D]/10 text-[#15370D]/80">
                  <tr>
                    <th className="py-3.5 px-4 w-16">Photo</th>
                    <th className="py-3.5 px-4">Dish Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Active Price</th>
                    <th className="py-3.5 px-4">PDF Import</th>
                    <th className="py-3.5 px-4">Tags</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15370D]/10">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F5EFE1]/20 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border border-[#15370D]/15 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-xs sm:text-sm">{item.name}</div>
                        <div className="text-[11px] text-[#15370D]/70 line-clamp-1 max-w-sm">
                          {item.description || 'No description provided'}
                        </div>
                      </td>

                      <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#15370D]/80 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-[#F5EFE1] border border-[#15370D]/15">
                          {item.category.replace(/-/g, ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold">₹</span>
                          <input
                            type="number"
                            defaultValue={item.price}
                            onBlur={(e) => handleUpdatePrice(item, e.target.value)}
                            className="w-20 bg-[#F5EFE1] border border-[#15370D]/20 rounded-lg px-2 py-1 font-bold text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-[#15370D]/60 tabular-nums">
                        ₹{item.originalImportedPrice || item.price}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          {item.isSignature && (
                            <span className="bg-[#15370D] text-[#FFFFFF] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap">
                              Signature
                            </span>
                          )}
                          {item.isSpicy && (
                            <span className="bg-[#F5EFE1] border border-[#15370D]/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase whitespace-nowrap">
                              Spicy
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors min-h-[30px] whitespace-nowrap cursor-pointer ${
                            item.isAvailable
                              ? 'bg-[#15370D] text-[#FFFFFF]'
                              : 'bg-[#F5EFE1] text-[#15370D]/60 border border-[#15370D]/20 hover:bg-[#FFFFFF]'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-[#15370D]/70 hover:text-[#15370D] p-1.5 transition-colors rounded-lg hover:bg-[#F5EFE1] cursor-pointer"
                            title="Edit Food Item & Photo"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="text-rose-500/70 hover:text-rose-600 p-1.5 transition-colors rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Delete Menu Item"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="md:hidden divide-y divide-[#15370D]/10">
              {filtered.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#15370D]/15 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-bold text-sm text-[#15370D] leading-snug">{item.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#15370D]/60 block mt-0.5">
                            {item.category.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <span className="text-xs font-bold">₹</span>
                          <input
                            type="number"
                            defaultValue={item.price}
                            onBlur={(e) => handleUpdatePrice(item, e.target.value)}
                            className="w-18 bg-[#F5EFE1] border border-[#15370D]/20 rounded-lg px-2 py-1 font-bold text-xs tabular-nums"
                          />
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-xs text-[#15370D]/70 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#15370D]/10">
                    <div className="flex items-center space-x-1.5">
                      {item.isSignature && (
                        <span className="bg-[#15370D] text-[#FFFFFF] px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                          Signature
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="bg-[#F5EFE1] border border-[#15370D]/25 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">
                          Spicy
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          item.isAvailable
                            ? 'bg-[#15370D] text-[#FFFFFF]'
                            : 'bg-[#F5EFE1] text-[#15370D]/60 border border-[#15370D]/20'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-[#15370D]/70 hover:text-[#15370D] p-1.5 rounded-lg hover:bg-[#F5EFE1]"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="text-rose-500/70 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#15370D]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCreateModal(false)}
            aria-hidden="true"
          />

          <div className="relative bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#15370D]">New Culinary Creation</h3>
                <p className="text-[11px] text-[#15370D]/60">
                  Adds directly to Sapori menu catalog
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Food Image Upload */}
              <ImageUpload
                value={newItemImage}
                publicId={newItemCloudinaryPublicId}
                onChange={(url, pid) => {
                  setNewItemImage(url);
                  setNewItemCloudinaryPublicId(pid || '');
                }}
                onRemove={() => {
                  setNewItemImage('');
                  setNewItemCloudinaryPublicId('');
                }}
              />

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Dish / Drink Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 48-Hr Slow Fermented Truffle Margherita"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                    Base Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 495"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                    Category *
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Artisan ingredients, culinary notes, roast profile..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 text-xs font-bold text-[#15370D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemSignature}
                    onChange={(e) => setNewItemSignature(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                  />
                  <span>Chef's Signature</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-[#15370D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemSpicy}
                    onChange={(e) => setNewItemSpicy(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                  />
                  <span>Spicy</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#15370D]/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-[#15370D]/70 hover:bg-[#F5EFE1] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Adding...' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-[#15370D]/50 backdrop-blur-xs transition-opacity"
            onClick={handleCloseEdit}
            aria-hidden="true"
          />

          <div className="relative bg-[#FFFFFF] border border-[#15370D]/20 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#15370D]/10 pb-3">
              <div>
                <h3 className="text-base font-black text-[#15370D]">Edit Food Creation</h3>
                <p className="text-[11px] text-[#15370D]/60">
                  Update item details, photo, and pricing
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="w-8 h-8 flex items-center justify-center text-[#15370D] hover:bg-[#F5EFE1] rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Food Image Upload & Replacement */}
              <ImageUpload
                value={editImage}
                publicId={editCloudinaryPublicId}
                onChange={(url, pid) => {
                  setEditImage(url);
                  setEditCloudinaryPublicId(pid || '');
                }}
                onRemove={() => {
                  setEditImage('');
                  setEditCloudinaryPublicId('');
                }}
              />

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Dish / Drink Title *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                    Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs font-bold text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#15370D] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#15370D]/25 rounded-xl p-2.5 text-xs text-[#15370D] focus:outline-none focus:ring-2 focus:ring-[#15370D]"
                />
              </div>

              <div className="flex items-center space-x-6 pt-1 flex-wrap gap-y-2">
                <label className="flex items-center space-x-2 text-xs font-bold text-[#15370D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSignature}
                    onChange={(e) => setEditSignature(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                  />
                  <span>Chef's Signature</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-[#15370D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editSpicy}
                    onChange={(e) => setEditSpicy(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                  />
                  <span>Spicy</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-bold text-[#15370D] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAvailable}
                    onChange={(e) => setEditAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#15370D] focus:ring-[#15370D]"
                  />
                  <span>In Stock</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#15370D]/10 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase text-[#15370D]/70 hover:bg-[#F5EFE1] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-[#15370D] text-[#FFFFFF] hover:bg-[#15370D]/90 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
