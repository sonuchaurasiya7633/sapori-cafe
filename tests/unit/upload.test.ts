import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, DELETE } from '../../src/app/api/upload/route';
import { POST as createMenuItem, GET as getMenuItems } from '../../src/app/api/menu/route';
import { PUT as updateMenuItem } from '../../src/app/api/menu/[id]/route';
import { dbStore } from '../../src/lib/db/store';

describe('Food Item Image Upload & Management', () => {
  it('rejects POST /api/upload when no file is attached', async () => {
    const formData = new FormData();
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('No image file provided');
  });

  it('rejects unsupported file formats like text/plain', async () => {
    const formData = new FormData();
    const mockFile = new File(['dummy text content'], 'sample.txt', { type: 'text/plain' });
    formData.append('file', mockFile);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Unsupported file format');
  });

  it('rejects files larger than 5MB', async () => {
    const formData = new FormData();
    // Simulate a 6MB buffer
    const largeBuffer = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'large-dish.jpg', { type: 'image/jpeg' });
    formData.append('file', largeFile);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('File size exceeds 5MB limit');
  });

  it('rejects DELETE /api/upload when publicId parameter is omitted', async () => {
    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'DELETE',
    });

    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('publicId parameter is required');
  });

  it('creates and associates food image URL and publicId with menu item', async () => {
    const testPayload = {
      name: 'Test Artisan Pizza with Cloudinary Photo',
      price: 520,
      category: 'pizzas',
      description: 'Handcrafted sourdough with burrata and fresh basil.',
      image: 'https://res.cloudinary.com/drrfrsrl/image/upload/v12345/sapori-cafe/food-items/pizza.webp',
      cloudinaryPublicId: 'sapori-cafe/food-items/pizza',
      isSignature: true,
      isSpicy: false,
      isAvailable: true,
    };

    const req = new NextRequest('http://localhost:3000/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    const res = await createMenuItem(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.item.image).toBe(testPayload.image);
    expect(data.item.cloudinaryPublicId).toBe(testPayload.cloudinaryPublicId);

    // Verify retrieval by id
    const stored = dbStore.getMenuItemById(data.item.id);
    expect(stored?.image).toBe(testPayload.image);
    expect(stored?.cloudinaryPublicId).toBe(testPayload.cloudinaryPublicId);
  });

  it('updates food image URL and replaces publicId via PUT /api/menu/[id]', async () => {
    // 1. Create initial item
    const initialItem = dbStore.createMenuItem({
      name: 'Item to Update Image',
      price: 350,
      category: 'beverages',
      slug: 'item-to-update-image',
      dietary: 'veg',
      isAvailable: true,
      rating: 5.0,
      prepTimeMinutes: 10,
      addOns: [],
      image: 'https://res.cloudinary.com/drrfrsrl/image/upload/old.jpg',
      cloudinaryPublicId: 'sapori-cafe/food-items/old_image_id',
    });

    // 2. Update with new image
    const updatePayload = {
      image: 'https://res.cloudinary.com/drrfrsrl/image/upload/new.webp',
      cloudinaryPublicId: 'sapori-cafe/food-items/new_image_id',
    };

    const req = new NextRequest(`http://localhost:3000/api/menu/${initialItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    const params = Promise.resolve({ id: initialItem.id });
    const res = await updateMenuItem(req, { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.item.image).toBe(updatePayload.image);
    expect(data.item.cloudinaryPublicId).toBe(updatePayload.cloudinaryPublicId);
  });
});
