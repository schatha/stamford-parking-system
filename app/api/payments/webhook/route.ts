import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe/client';
import { updateTransactionStatus } from '@/lib/db/transactions';
import { updateSessionStatus } from '@/lib/db/sessions';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  try {
    const event = await constructWebhookEvent(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;

        try {
          await updateTransactionStatus(
            paymentIntent.id,
            'COMPLETED',
            paymentIntent.id
          );

          const sessionId = paymentIntent.metadata.sessionId;
          if (sessionId) {
            await updateSessionStatus(sessionId, 'ACTIVE');
          }

          // Payment succeeded - transaction updated
        } catch (error) {
          console.error('Error updating transaction/session:', error);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;

        try {
          await updateTransactionStatus(
            paymentIntent.id,
            'FAILED',
            paymentIntent.id,
            paymentIntent.last_payment_error?.message || 'Payment failed'
          );

          const sessionId = paymentIntent.metadata.sessionId;
          if (sessionId) {
            await updateSessionStatus(sessionId, 'CANCELLED');
          }

          // Payment failed - transaction updated
        } catch (error) {
          console.error('Error updating transaction/session:', error);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as any;

        try {
          await updateTransactionStatus(
            paymentIntent.id,
            'FAILED',
            paymentIntent.id,
            'Payment canceled'
          );

          const sessionId = paymentIntent.metadata.sessionId;
          if (sessionId) {
            await updateSessionStatus(sessionId, 'CANCELLED');
          }

          // Payment canceled - transaction updated
        } catch (error) {
          console.error('Error updating transaction/session:', error);
        }
        break;
      }

      default:
        // Unhandled webhook event type - no action taken
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}