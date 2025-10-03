'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PaymentForm from '@/components/payments/PaymentForm';
import DemoPaymentForm from '@/components/payments/DemoPaymentForm';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatLicensePlate, formatZoneDisplay } from '@/lib/utils/formatting';

// Check if we're in demo mode (no Stripe keys configured)
// Force demo mode for now since Stripe keys are not configured
const isDemoMode = true;

const stripePromise = !isDemoMode
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : Promise.resolve(null);

interface PaymentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [parkingSession, setParkingSession] = useState<ParkingSessionWithDetails | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadSession();
  }, [session, status, router, resolvedParams.id]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load session');
        return;
      }

      const sessionData = data.data;
      setParkingSession(sessionData);

      if (sessionData.status === 'ACTIVE') {
        router.push(`/park/confirmation/${sessionData.id}`);
        return;
      }

      if (sessionData.status !== 'PENDING') {
        setError('This session is not available for payment');
        return;
      }

      await createPaymentIntent(sessionData.id);
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('An error occurred while loading the session');
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentIntent = async (sessionId: string) => {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to initialize payment');
        return;
      }

      setClientSecret(data.data.clientSecret);
      setTransactionId(data.data.transactionId);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      setError('Failed to initialize payment');
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/park/confirmation/${resolvedParams.id}?success=payment`);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Payment Error</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center p-8">
              <div className="text-red-500 mb-4">
                <Shield className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Error</h3>
              <p className="text-gray-800 mb-4">{error}</p>
              <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!parkingSession || (!clientSecret && !isDemoMode)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-900 font-medium mb-4">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-800">Payment not available</p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-900">Parking Session Summary</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold">Vehicle:</span>
                  <span className="font-bold text-gray-900">
                    {formatLicensePlate(parkingSession.vehicle.licensePlate, parkingSession.vehicle.state)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold">Zone:</span>
                  <span className="font-bold text-gray-900">
                    {formatZoneDisplay(parkingSession.zone.zoneNumber, parkingSession.zone.zoneName)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold">Location:</span>
                  <span className="font-bold text-gray-900">{parkingSession.zone.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-bold">Duration:</span>
                  <span className="font-bold text-gray-900">{parkingSession.durationHours} hours</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-bold">Base cost:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(parkingSession.baseCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-bold">Tax:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(parkingSession.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-900 font-bold">Processing fee:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(parkingSession.processingFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span className="text-gray-900 font-bold">Total:</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(parkingSession.totalCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-gray-900">Secure Payment</span>
              </h2>
            </CardHeader>
            <CardContent>
              {isDemoMode ? (
                <DemoPaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={parkingSession.totalCost}
                />
              ) : (
                clientSecret ? (
                  <Elements options={options} stripe={stripePromise}>
                    <PaymentForm
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      amount={parkingSession.totalCost}
                    />
                  </Elements>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-800">Initializing payment...</p>
                  </div>
                )
              )}
              <div className="mt-4 text-center text-sm text-gray-900 font-bold">
                <p className="text-gray-900">{isDemoMode ? 'Demo payment mode active' : 'Your payment is secured by Stripe'}</p>
                <p className="text-gray-900">{isDemoMode ? 'No real charges will be made' : 'We do not store your payment information'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}