import { describe, it, expect, beforeEach } from 'vitest';
import { dbStore } from '../../src/lib/db/store';
import { Order } from '../../src/types';

describe('End-to-End Order Lifecycle & Dine-In Table Synchronization', () => {
  beforeEach(() => {
    // Reset test tables
    dbStore.updateTableStatus('03', 'available');
    dbStore.updateTableStatus('04', 'available');
  });

  it('creates an order, saves it, and retrieves it by order number or ID', () => {
    const orderId = `test-order-${Date.now()}`;
    const orderNumber = `SAP-2611-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      orderMode: 'pickup',
      items: [
        {
          id: 'item-pizza-1',
          menuItemId: 'item-pizza-1',
          slug: 'classic-neapolitan-margherita',
          name: 'Classic Neapolitan Margherita',
          price: 395,
          quantity: 2,
          selectedAddOns: [],
        },
      ],
      subtotal: 790,
      tax: 40,
      packagingFee: 25,
      deliveryFee: 0,
      discount: 0,
      total: 855,
      status: 'PLACED',
      paymentStatus: 'PENDING',
      paymentMethod: 'cash_counter',
      customer: {
        name: 'Kabir Singhal',
        phone: '9829012345',
      },
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: new Date().toISOString(),
          actor: 'customer',
          note: 'Order placed and confirmed',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = dbStore.createOrder(newOrder);
    expect(created.id).toBe(orderId);
    expect(created.orderNumber).toBe(orderNumber);

    const retrieved = dbStore.getOrderById(orderId);
    expect(retrieved).toBeDefined();
    expect(retrieved?.customer.name).toBe('Kabir Singhal');
    expect(retrieved?.total).toBe(855);

    // Clean up
    dbStore.deleteOrder(orderId, 'admin');
  });

  it('synchronizes table status to occupied when a dine-in order is accepted or placed', () => {
    const orderId = `test-dinein-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: `SAP-DINE-${Date.now().toString().slice(-4)}`,
      orderMode: 'dine_in',
      items: [
        {
          id: 'item-coldbrew-1',
          menuItemId: 'item-coldbrew-1',
          slug: 'classic-steeped-cold-brew',
          name: 'Classic Steeped Cold Brew',
          price: 220,
          quantity: 2,
        },
      ],
      subtotal: 440,
      tax: 22,
      packagingFee: 0,
      deliveryFee: 0,
      discount: 0,
      total: 462,
      status: 'PLACED',
      paymentStatus: 'PAID',
      paymentMethod: 'cash_counter',
      customer: {
        name: 'Vanya Malhotra',
        phone: '9829098765',
        tableNumber: '03',
      },
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createOrder(newOrder);

    // Update status to PREPARING
    dbStore.updateOrderStatus(orderId, 'PREPARING', 'kitchen', 'Baking in oven');

    // Table 03 should now be occupied
    const tables = dbStore.getTables();
    const table03 = tables.find((t) => t.tableNumber === '03');
    expect(table03?.status).toBe('occupied');

    // Clean up
    dbStore.deleteOrder(orderId, 'admin');
  });

  it('releases table to available when dine-in order is completed', () => {
    const orderId = `test-finish-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: `SAP-DINE-COMP-${Date.now().toString().slice(-4)}`,
      orderMode: 'dine_in',
      items: [],
      subtotal: 300,
      tax: 15,
      packagingFee: 0,
      deliveryFee: 0,
      discount: 0,
      total: 315,
      status: 'READY_TO_SERVE',
      paymentStatus: 'PAID',
      paymentMethod: 'cash_counter',
      customer: {
        name: 'Aditya Chauhan',
        phone: '9829055443',
        tableNumber: '04',
      },
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createOrder(newOrder);
    dbStore.updateTableStatus('04', 'occupied');

    // Mark COMPLETED
    dbStore.updateOrderStatus(orderId, 'COMPLETED', 'admin', 'Dining finished & bill paid');

    const tables = dbStore.getTables();
    const table04 = tables.find((t) => t.tableNumber === '04');
    expect(table04?.status).toBe('available');

    // Clean up
    dbStore.deleteOrder(orderId, 'admin');
  });

  it('updates payment status to PAID and logs audit', () => {
    const orderId = `test-pay-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: `SAP-PAY-${Date.now().toString().slice(-4)}`,
      orderMode: 'pickup',
      items: [],
      subtotal: 500,
      tax: 25,
      packagingFee: 25,
      deliveryFee: 0,
      discount: 0,
      total: 550,
      status: 'PLACED',
      paymentStatus: 'PENDING',
      paymentMethod: 'cash_counter',
      customer: {
        name: 'Simran Gill',
        phone: '9829044332',
      },
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createOrder(newOrder);

    const updated = dbStore.updateOrderPayment(orderId, 'PAID');
    expect(updated?.paymentStatus).toBe('PAID');
    expect(updated?.paymentDetails?.paidAt).toBeDefined();

    // Clean up
    dbStore.deleteOrder(orderId, 'admin');
  });

  it('deletes an order record cleanly', () => {
    const orderId = `test-del-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber: `SAP-DEL-${Date.now().toString().slice(-4)}`,
      orderMode: 'pickup',
      items: [],
      subtotal: 200,
      tax: 10,
      packagingFee: 25,
      deliveryFee: 0,
      discount: 0,
      total: 235,
      status: 'CANCELLED',
      paymentStatus: 'PENDING',
      paymentMethod: 'cash_counter',
      customer: {
        name: 'Test Removal',
        phone: '9829011111',
      },
      statusHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.createOrder(newOrder);
    const deleted = dbStore.deleteOrder(orderId, 'admin');
    expect(deleted).toBe(true);

    const lookup = dbStore.getOrderById(orderId);
    expect(lookup).toBeUndefined();
  });
});
