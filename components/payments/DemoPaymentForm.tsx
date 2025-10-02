'use client';

import { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils/formatting';

interface DemoPaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
}

export default function DemoPaymentForm({ onSuccess, onError, amount }: DemoPaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [expiryDate, setExpiryDate] = useState('12/25');
  const [cvc, setCvc] = useState('123');
  const [name, setName] = useState('Test User');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validate test card number
      if (cardNumber.replace(/\s/g, '') !== '4242424242424242') {
        throw new Error('Please use test card number: 4242 4242 4242 4242');
      }

      // Simulate successful payment
      console.log('Demo mode: Payment processed successfully');
      onSuccess();
    } catch (error) {
      console.error('Demo payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Demo Mode Notice */}
      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Demo Mode Active</p>
          <p>This is a demonstration. No real payment will be processed.</p>
        </div>
      </div>

      {/* Card Number */}
      <div>
        <Input
          id="cardNumber"
          label="Card Number"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          placeholder="4242 4242 4242 4242"
          maxLength={19}
          required
        />
        <p className="text-sm text-black mt-1 font-bold">Use: 4242 4242 4242 4242 for testing</p>
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            id="expiryDate"
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </div>
        <div>
          <Input
            id="cvc"
            label="CVC"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substr(0, 3))}
            placeholder="123"
            maxLength={3}
            required
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <Input
          id="name"
          label="Cardholder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
        <Lock className="h-5 w-5 text-green-600 mt-0.5" />
        <div className="text-sm text-green-800">
          <p className="font-medium">Secure Demo Environment</p>
          <p>This demo simulates a secure payment process without processing real transactions.</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? (
          'Processing Demo Payment...'
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay {formatCurrency(amount)} (Demo)
          </>
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-black font-bold">
          Demo mode - No real charges will be made
        </p>
      </div>
    </form>
  );
}