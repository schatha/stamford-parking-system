import Stripe from 'stripe';

// Demo mode compatibility - allow operation without real Stripe keys
const isDemoMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('lder') || process.env.STRIPE_SECRET_KEY.length < 20;

export const stripe = isDemoMode ? null : new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createPaymentIntent(
  amount: number,
  metadata: {
    userId: string;
    sessionId: string;
    vehicleLicense: string;
    zoneNumber: string;
  }
): Promise<Stripe.PaymentIntent> {
  // Demo mode: return mock payment intent
  if (isDemoMode) {
    console.log('Demo mode: Creating mock payment intent for', { amount, metadata });
    const paymentIntentId = `pi${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: paymentIntentId,
      client_secret: `${paymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: Math.round(amount * 100),
      currency: 'usd',
      status: 'requires_payment_method',
      metadata: metadata as any,
    } as Stripe.PaymentIntent;
  }

  // Production mode: use real Stripe
  return stripe!.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });
}

export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  // Demo mode: return mock confirmed payment intent
  if (isDemoMode) {
    console.log('Demo mode: Confirming mock payment intent', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 250, // Mock amount
      currency: 'usd',
    } as Stripe.PaymentIntent;
  }

  // Production mode: use real Stripe
  return stripe!.paymentIntents.confirm(paymentIntentId);
}

export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  // Demo mode: return mock cancelled payment intent
  if (isDemoMode) {
    console.log('Demo mode: Cancelling mock payment intent', paymentIntentId);
    return {
      id: paymentIntentId,
      status: 'canceled',
      amount: 250, // Mock amount
      currency: 'usd',
    } as Stripe.PaymentIntent;
  }

  // Production mode: use real Stripe
  return stripe!.paymentIntents.cancel(paymentIntentId);
}

export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  // Demo mode: return mock refund
  if (isDemoMode) {
    console.log('Demo mode: Creating mock refund for', { paymentIntentId, amount, reason });
    return {
      id: `re_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount ? Math.round(amount * 100) : 250,
      currency: 'usd',
      status: 'succeeded',
      reason: reason || 'requested_by_customer',
      payment_intent: paymentIntentId,
    } as Stripe.Refund;
  }

  // Production mode: use real Stripe
  const refundData: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundData.amount = Math.round(amount * 100);
  }

  if (reason) {
    refundData.reason = reason;
  }

  return stripe!.refunds.create(refundData);
}

export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  // Demo mode: return mock payment intent
  if (isDemoMode) {
    console.log('Demo mode: Retrieving mock payment intent', paymentIntentId);
    return {
      id: paymentIntentId,
      client_secret: `${paymentIntentId}_secret`,
      amount: 250,
      currency: 'usd',
      status: 'succeeded',
    } as Stripe.PaymentIntent;
  }

  // Production mode: use real Stripe
  return stripe!.paymentIntents.retrieve(paymentIntentId);
}

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  // Demo mode: return mock webhook event
  if (isDemoMode) {
    console.log('Demo mode: Creating mock webhook event');
    return {
      id: `evt_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: `pi_demo_${Date.now()}`,
          status: 'succeeded',
          amount: 250,
          currency: 'usd',
        }
      },
    } as Stripe.Event;
  }

  // Production mode: use real Stripe
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe!.webhooks.constructEvent(body, signature, webhookSecret);
}