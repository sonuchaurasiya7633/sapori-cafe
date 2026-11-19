import { OrderMode, OrderStatus } from '@/types';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PLACED', 'CANCELLED', 'REJECTED'],
  PLACED: ['ACCEPTED', 'CANCELLED', 'REJECTED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'READY_TO_SERVE', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  READY_TO_SERVE: ['COMPLETED', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: ['REFUND_PENDING'],
  REJECTED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED'],
  REFUNDED: [],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  orderMode: OrderMode
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: true };
  }

  const allowedNext = VALID_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition order from ${currentStatus} to ${targetStatus}`,
    };
  }

  // Mode-specific validation
  if (currentStatus === 'PREPARING') {
    if (targetStatus === 'READY_FOR_PICKUP' && orderMode !== 'pickup') {
      return { allowed: false, reason: `READY_FOR_PICKUP is only valid for pickup orders` };
    }
    if (targetStatus === 'READY_TO_SERVE' && orderMode !== 'dine_in') {
      return { allowed: false, reason: `READY_TO_SERVE is only valid for dine-in orders` };
    }
    if (targetStatus === 'OUT_FOR_DELIVERY' && orderMode !== 'delivery') {
      return { allowed: false, reason: `OUT_FOR_DELIVERY is only valid for delivery orders` };
    }
  }

  return { allowed: true };
}

export function getStatusBadgeInfo(status: OrderStatus): { label: string; description: string } {
  const map: Record<OrderStatus, { label: string; description: string }> = {
    PENDING_PAYMENT: { label: 'Awaiting Payment', description: 'Order waiting for payment confirmation' },
    PLACED: { label: 'Order Placed', description: 'Order received and sent to kitchen team' },
    ACCEPTED: { label: 'Order Accepted', description: 'Kitchen has accepted your artisanal order' },
    PREPARING: { label: 'In the Kitchen', description: 'Our baristas and chefs are handcrafting your items' },
    READY_FOR_PICKUP: { label: 'Ready for Pickup', description: 'Your order is hot and packed at the counter' },
    READY_TO_SERVE: { label: 'Ready to Serve', description: 'Bringing fresh dishes to your table' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', description: 'Rider is on the way to your doorstep' },
    COMPLETED: { label: 'Completed', description: 'Fulfilled & enjoyed. Buon Appetito!' },
    CANCELLED: { label: 'Cancelled', description: 'This order was cancelled' },
    REJECTED: { label: 'Declined', description: 'Order could not be accepted' },
    REFUND_PENDING: { label: 'Refund Processing', description: 'Refund initiated with payment partner' },
    REFUNDED: { label: 'Refunded', description: 'Payment has been refunded to original source' },
  };

  return map[status] || { label: status, description: '' };
}
