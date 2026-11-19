import { NextRequest } from 'next/server';
import { orderNotificationBus, RealtimeOrderPayload } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connected event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Sapori Live Order Stream', time: Date.now() })}\n\n`)
      );

      const onNewOrder = (order: RealtimeOrderPayload) => {
        try {
          controller.enqueue(
            encoder.encode(`event: new_order\ndata: ${JSON.stringify(order)}\n\n`)
          );
        } catch (err) {
          // Stream already closed
        }
      };

      orderNotificationBus.on('new_order', onNewOrder);

      // Heartbeat ping every 15s to keep HTTP connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        orderNotificationBus.off('new_order', onNewOrder);
        try {
          controller.close();
        } catch (_) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
