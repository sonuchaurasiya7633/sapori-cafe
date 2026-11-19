'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { toast } from '@/lib/toast';

interface ImageUploadProps {
  value?: string;
  publicId?: string;
  onChange: (url: string, publicId?: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  label?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({
  value,
  publicId,
  onChange,
  onRemove,
  disabled = false,
  label = 'Food Item Image',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    // 1. Client-side Type Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file format. Please upload JPG, PNG, WebP, or AVIF.');
      return;
    }

    // 2. Client-side Size Validation
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is 5MB.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setUploadProgress(100);
      onChange(data.url, data.publicId);
      toast.success('Food image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = async () => {
    if (disabled || isUploading) return;

    if (publicId) {
      try {
        await fetch(`/api/upload?publicId=${encodeURIComponent(publicId)}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('Could not immediately delete remote asset:', e);
      }
    }

    if (onRemove) {
      onRemove();
    } else {
      onChange('', undefined);
    }
    toast.info('Image removed');
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold tracking-wider text-[#15370D] uppercase">
          {label}
        </label>
        {value && !isUploading && (
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Active Image
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-[#15370D]/15 bg-stone-50 shadow-sm transition-all hover:border-[#DEB853]">
          <div className="relative w-full h-48 sm:h-52 bg-stone-100 flex items-center justify-center overflow-hidden">
            <Image
              src={value}
              alt="Food preview"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-medium tracking-wide">Replacing image...</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/95 border-t border-[#15370D]/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#15370D] truncate">
                {publicId ? `Cloudinary: ${publicId.split('/').pop()}` : 'Uploaded Image'}
              </p>
              <p className="text-[10px] text-stone-500">Auto-optimized WebP / AVIF CDN delivery</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-[#15370D] transition-colors cursor-pointer disabled:opacity-50"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center min-h-[160px] ${
            isDragging
              ? 'border-[#DEB853] bg-[#DEB853]/10 scale-[1.01]'
              : 'border-stone-300 hover:border-[#15370D] bg-stone-50/70 hover:bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-9 h-9 border-3 border-[#15370D] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-semibold text-[#15370D]">Uploading to Cloudinary...</p>
              {uploadProgress !== null && (
                <div className="w-36 h-1.5 bg-stone-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#15370D] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#15370D]/5 text-[#15370D] flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#15370D]">
                Drag &amp; drop food photo, or{' '}
                <span className="text-[#DEB853] font-semibold underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-xs text-stone-500 mt-1">
                JPG, PNG, WebP or AVIF &bull; Max 5MB &bull; Auto-optimized for CDN
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
