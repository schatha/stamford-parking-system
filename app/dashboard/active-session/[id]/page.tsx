'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  CreditCard,
  Plus,
  StopCircle,
  Bell,
  AlertTriangle,
  CheckCircle,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatLicensePlate } from '@/lib/utils/formatting';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { SessionExtensionModal } from '@/components/session/SessionExtensionModal';
import { EarlyTerminationModal } from '@/components/session/EarlyTerminationModal';
import { NotificationSettings } from '@/components/session/NotificationSettings';

export default function ActiveSessionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [parkingSession, setParkingSession] = useState<ParkingSessionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    loadSession();

    // Set up periodic refresh
    const interval = setInterval(loadSession, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [session, status, router, sessionId]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setParkingSession(data.data);

        // Check if session is expiring (within 15 minutes)
        const endTime = new Date(data.data.scheduledEndTime);
        const now = new Date();
        const timeRemaining = endTime.getTime() - now.getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        setIsExpiring(timeRemaining <= fifteenMinutes && timeRemaining > 0);
      } else {
        setError('Session not found');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendSession = async (additionalHours: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalHours }),
        credentials: 'include',
      });

      if (response.ok) {
        await loadSession(); // Refresh session data
        setShowExtensionModal(false);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to extend session');
      }
    } catch (error) {
      console.error('Failed to extend session:', error);
      alert('Failed to extend session. Please try again.');
    }
  };

  const handleTerminateSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/terminate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/dashboard?terminated=true');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      alert('Failed to terminate session. Please try again.');
    }
  };

  const handleSessionExpired = () => {
    setIsExpiring(false);
    loadSession();
  };

  const getStatusInfo = () => {
    if (!parkingSession) return { color: 'gray', text: 'Unknown' };

    switch (parkingSession.status) {
      case 'ACTIVE':
        return isExpiring
          ? { color: 'orange', text: 'Expiring Soon', icon: AlertTriangle }
          : { color: 'green', text: 'Active', icon: CheckCircle };
      case 'EXPIRED':
        return { color: 'red', text: 'Expired', icon: AlertTriangle };
      case 'COMPLETED':
        return { color: 'blue', text: 'Completed', icon: CheckCircle };
      default:
        return { color: 'gray', text: parkingSession.status };
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !parkingSession) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Session Not Found</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
                <p className="text-sm text-gray-600">
                  Manage your active parking session
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                statusInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {StatusIcon && <StatusIcon className="h-4 w-4 mr-1" />}
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Warning Banner */}
      {isExpiring && parkingSession.status === 'ACTIVE' && (
        <div className="bg-orange-500 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="font-medium">Session Expiring Soon!</span>
              </div>
              <div className="flex items-center space-x-4">
                <CountdownTimer
                  endTime={new Date(parkingSession.scheduledEndTime)}
                  onExpired={handleSessionExpired}
                  className="text-white font-bold"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white text-orange-600 hover:bg-gray-100"
                  onClick={() => setShowExtensionModal(true)}
                >
                  Extend Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Session Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-xl font-semibold">Session Information</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Time Remaining */}
                {parkingSession.status === 'ACTIVE' && (
                  <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Time Remaining</h3>
                    <CountdownTimer
                      endTime={new Date(parkingSession.scheduledEndTime)}
                      onExpired={handleSessionExpired}
                      className="justify-center text-3xl font-bold"
                    />
                    <p className="text-sm text-blue-700 mt-3">
                      Session ends at {new Date(parkingSession.scheduledEndTime).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {/* Session Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatLicensePlate(parkingSession.vehicle.licensePlate, parkingSession.vehicle.state)}
                        </p>
                        {parkingSession.vehicle.nickname && (
                          <p className="text-sm text-gray-600">{parkingSession.vehicle.nickname}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Zone {parkingSession.zone.zoneNumber}
                        </p>
                        <p className="text-sm text-gray-600">{parkingSession.zone.zoneName}</p>
                        <p className="text-xs text-gray-500">{parkingSession.zone.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {parkingSession.durationHours === 0.5 ? '30 minutes' :
                           parkingSession.durationHours === 1 ? '1 hour' :
                           `${parkingSession.durationHours} hours`}
                        </p>
                        <p className="text-sm text-gray-600">
                          Started {new Date(parkingSession.startTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(parkingSession.totalCost)}
                        </p>
                        <p className="text-sm text-gray-600">Payment confirmed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session ID */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Session ID:</strong> <span className="font-mono">{parkingSession.id}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {parkingSession.status === 'ACTIVE' && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setShowExtensionModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Extend Time
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowTerminationModal(true)}
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      End Session Early
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Parking Session',
                        text: `Parked at Zone ${parkingSession.zone.zoneNumber}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Session
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          {showNotifications && (
            <NotificationSettings
              sessionId={sessionId}
              onClose={() => setShowNotifications(false)}
            />
          )}

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Payment Breakdown</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Cost:</span>
                    <span>{formatCurrency(parkingSession.baseCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CT Sales Tax (6.35%):</span>
                    <span>{formatCurrency(parkingSession.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processing Fee:</span>
                    <span>{formatCurrency(parkingSession.processingFee)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid:</span>
                      <span>{formatCurrency(parkingSession.totalCost)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Payment Method:</strong> Credit Card</p>
                  <p className="mb-2">
                    <strong>Transaction Date:</strong>{' '}
                    {new Date(parkingSession.createdAt).toLocaleString()}
                  </p>
                  {parkingSession.transactions && parkingSession.transactions[0] && (
                    <p>
                      <strong>Transaction ID:</strong>{' '}
                      <span className="font-mono text-xs">{parkingSession.transactions[0].id}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Session Timeline</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="font-medium">Session Started</p>
                    <p className="text-sm text-gray-600">
                      {new Date(parkingSession.startTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                {parkingSession.status === 'ACTIVE' && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="font-medium">Currently Active</p>
                      <p className="text-sm text-gray-600">
                        Session in progress
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start opacity-50">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
                  <div>
                    <p className="font-medium">Scheduled End</p>
                    <p className="text-sm text-gray-600">
                      {new Date(parkingSession.scheduledEndTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showExtensionModal && (
        <SessionExtensionModal
          session={parkingSession}
          onExtend={handleExtendSession}
          onClose={() => setShowExtensionModal(false)}
        />
      )}

      {showTerminationModal && (
        <EarlyTerminationModal
          session={parkingSession}
          onTerminate={handleTerminateSession}
          onClose={() => setShowTerminationModal(false)}
        />
      )}
    </div>
  );
}