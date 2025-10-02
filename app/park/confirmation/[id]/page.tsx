'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Download, Car, MapPin, Clock, CreditCard, Share2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatLicensePlate } from '@/lib/utils/formatting';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

export default function ConfirmationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [parkingSession, setParkingSession] = useState<ParkingSessionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    loadSession();
  }, [session, status, router, sessionId]);

  // Handle browser back button to redirect to dashboard
  useEffect(() => {
    const handlePopState = () => {
      router.push('/dashboard');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setParkingSession(data.data);
      } else {
        setError('Parking session not found');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load parking session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      // TODO: Implement receipt API
      alert('Receipt download coming soon!');
      return;
      // const response = await fetch(`/api/sessions/${sessionId}/receipt`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `parking-receipt-${sessionId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const handleShareSession = () => {
    if (navigator.share && parkingSession) {
      navigator.share({
        title: 'Parking Session',
        text: `Parked at Zone ${parkingSession.zone.zoneNumber} until ${new Date(parkingSession.scheduledEndTime).toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCalendar = () => {
    if (!parkingSession) return;

    const startTime = new Date(parkingSession.startTime);
    const endTime = new Date(parkingSession.scheduledEndTime);

    // Format for Google Calendar
    const startTimeStr = startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTimeStr = endTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${startTimeStr}%2F${endTimeStr}&text=Parking%20Session&details=Vehicle%3A%20${formatLicensePlate(parkingSession.vehicle.licensePlate, parkingSession.vehicle.state)}%0AZone%3A%20${parkingSession.zone.zoneNumber}%20-%20${parkingSession.zone.zoneName}&location=${encodeURIComponent(parkingSession.zone.address)}`;

    window.open(calendarUrl, '_blank');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !parkingSession) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-800 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Parking Confirmed!
            </h1>
            <p className="text-gray-800">
              Your parking session is now active. Receipt has been sent to your email.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Active Session Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Active Parking Session</h2>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {parkingSession.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Time Remaining */}
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Time Remaining</h3>
                <CountdownTimer
                  endTime={new Date(parkingSession.scheduledEndTime)}
                  className="justify-center text-2xl"
                />
                <p className="text-sm text-green-700 mt-2">
                  Until {new Date(parkingSession.scheduledEndTime).toLocaleString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 !text-black mr-3" />
                    <div>
                      <p className="font-medium !text-black">
                        {formatLicensePlate(parkingSession.vehicle.licensePlate, parkingSession.vehicle.state)}
                      </p>
                      {parkingSession.vehicle.nickname && (
                        <p className="text-sm text-gray-800">{parkingSession.vehicle.nickname}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 !text-black mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Zone {parkingSession.zone.zoneNumber}
                      </p>
                      <p className="text-sm text-gray-800">{parkingSession.zone.zoneName}</p>
                      <p className="text-xs text-gray-800">{parkingSession.zone.address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 !text-black mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {parkingSession.durationHours === 0.5 ? '30 minutes' :
                         parkingSession.durationHours === 1 ? '1 hour' :
                         `${parkingSession.durationHours} hours`}
                      </p>
                      <p className="text-sm text-gray-800">
                        Started {new Date(parkingSession.startTime).toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 !text-black mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(parkingSession.totalCost)}
                      </p>
                      <p className="text-sm text-gray-800">Payment confirmed</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReceipt}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-xs">Download Receipt</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareSession}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Share2 className="h-6 w-6 mb-2" />
                  <span className="text-xs">Share Session</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-xs">Add to Calendar</span>
                </Button>

                <Link href={`/dashboard/active-session/${sessionId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center p-4 h-auto w-full"
                  >
                    <Clock className="h-6 w-6 mb-2" />
                    <span className="text-xs">Extend Time</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Receipt Details</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Session ID:</span>
                  <span className="font-mono">{parkingSession.id}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Base Cost:</span>
                  <span>{formatCurrency(parkingSession.baseCost)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">CT Sales Tax (6.35%):</span>
                  <span>{formatCurrency(parkingSession.taxAmount)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-800">Processing Fee:</span>
                  <span>{formatCurrency(parkingSession.processingFee)}</span>
                </div>

                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid:</span>
                    <span>{formatCurrency(parkingSession.totalCost)}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-gray-800">
                  <p>
                    <strong>Transaction Date:</strong>{' '}
                    {new Date(parkingSession.createdAt).toLocaleString()}
                  </p>
                  {parkingSession.transactions && parkingSession.transactions[0] && (
                    <p>
                      <strong>Transaction ID:</strong>{' '}
                      <span className="font-mono">{parkingSession.transactions[0].id}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/park" className="flex-1">
              <Button className="w-full">
                Park Another Vehicle
              </Button>
            </Link>
          </div>

          {/* Important Notes */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Keep this receipt as proof of payment if requested by parking enforcement</li>
                <li>• You can extend your parking session anytime before it expires</li>
                <li>• You'll receive notifications before your session expires</li>
                <li>• Make sure your vehicle is parked in the correct zone</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}