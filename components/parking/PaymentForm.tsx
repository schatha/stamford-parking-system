'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, ArrowLeft, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingZone, Vehicle } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency, formatLicensePlate } from '@/lib/utils/formatting';
import { CostCalculator } from './CostCalculator';

// Check if we're in demo mode (no Stripe keys configured)
const isDemoMode = !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Demo mode compatible - only load Stripe if key is available
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

interface PaymentFormProps {
  zone: ParkingZone;
  vehicle: Vehicle;
  durationHours: number;
  onSuccess: (sessionId: string) => void;
  onBack: () => void;
}

interface PaymentFormInnerProps extends PaymentFormProps {}

function PaymentFormInner({
  zone,
  vehicle,
  durationHours,
  onSuccess,
  onBack
}: PaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const rate = getRateForLocationType(zone.locationType);
  const costs = calculateParkingCost(rate, durationHours);

  const getEndTime = () => {
    const endTime = new Date();
    endTime.setTime(endTime.getTime() + durationHours * 60 * 60 * 1000);
    return endTime;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setIsProcessing(true);
    setError('');

    try {
      // Create parking session first
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          zoneId: zone.id,
          durationHours,
        }),
      });

      if (!sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        throw new Error(sessionData.error || 'Failed to create parking session');
      }

      const { data: session } = await sessionResponse.json();

      // In demo mode, skip Stripe payment and directly confirm session
      if (isDemoMode) {
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Demo mode: Skipping Stripe payment, directly confirming session');

        // Directly confirm the session in demo mode
        const confirmResponse = await fetch(`/api/sessions/${session.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: 'demo_' + Date.now(),
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm parking session');
        }

        onSuccess(session.id);
        return;
      }

      // Normal Stripe flow when not in demo mode
      if (!stripe || !elements) {
        setError('Stripe has not loaded yet. Please try again.');
        setIsProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found.');
        setIsProcessing(false);
        return;
      }

      // Create payment intent for the session
      const paymentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      });

      if (!paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        throw new Error(paymentData.error || 'Failed to create payment intent');
      }

      const { data: paymentData } = await paymentResponse.json();
      const clientSecret = paymentData.clientSecret;

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: vehicle.nickname || `${vehicle.licensePlate} (${vehicle.state})`,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }

      if (paymentIntent.status === 'succeeded') {
        // Confirm the session
        const confirmResponse = await fetch(`/api/sessions/${session.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm parking session');
        }

        onSuccess(session.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#9e2146',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: false,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold">Payment Information</h2>
                <p className="text-sm text-gray-800">
                  Secure payment with Stripe
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Parking Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Parking Session Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">
                  <strong>Zone:</strong> {zone.zoneNumber} - {zone.zoneName}
                </p>
                <p className="text-blue-700">
                  <strong>Vehicle:</strong> {formatLicensePlate(vehicle.licensePlate, vehicle.state)}
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Duration:</strong> {durationHours === 0.5 ? '30 minutes' :
                                               durationHours === 1 ? '1 hour' :
                                               `${durationHours} hours`}
                </p>
                <p className="text-blue-700">
                  <strong>Until:</strong> {getEndTime().toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-6">
            <CostCalculator
              zone={zone}
              durationHours={durationHours}
              showDetails={true}
            />
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Card Information
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white">
                <CardElement
                  options={cardElementOptions}
                  onChange={(event) => {
                    setCardComplete(event.complete);
                    if (event.error) {
                      setError(event.error.message);
                    } else {
                      setError('');
                    }
                  }}
                />
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-900">
                <span>Secure payment with</span>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                    Apple Pay
                  </div>
                  <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    G Pay
                  </div>
                  <div className="text-xs text-gray-800">and all major cards</div>
                </div>
              </div>
            </div>

            {/* Test Mode Notice */}
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{isDemoMode ? 'Demo Mode' : 'Test Mode'}</p>
                <p>
                  {isDemoMode
                    ? 'Click "Pay & Start Parking" to create a demo session. No payment processing required.'
                    : 'Use card number 4242 4242 4242 4242 with any future expiry date and CVC for testing.'}
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Secure Payment</p>
                <p>Your payment information is encrypted and secure. We use Stripe for payment processing.</p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isProcessing}
              disabled={isDemoMode ? isProcessing : (!stripe || !cardComplete || isProcessing)}
            >
              {isProcessing ? (
                'Processing Payment...'
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay {formatCurrency(costs.totalCost)} & Start Parking{isDemoMode ? ' (Demo)' : ''}
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-900">
                By completing this purchase, you agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">Accepted:</span>
                <div className="flex space-x-1">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    VISA
                  </div>
                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                    MC
                  </div>
                  <div className="w-8 h-5 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                    AMEX
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-900">
              <Lock className="h-3 w-3 mr-1" />
              <span>256-bit SSL encrypted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}