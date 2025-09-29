'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-js';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatting';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
}

export default function PaymentForm({ onSuccess, onError, amount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/parking/payment-success`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
        onError(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred');
        onError('An unexpected error occurred');
      }
    } else {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {message && (
        <div className="text-red-600 text-sm">{message}</div>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        isLoading={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
      </Button>
    </form>
  );
}