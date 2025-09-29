'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Clock, Car, X, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { formatLicensePlate } from '@/lib/utils/formatting';

interface ExpiryWarningDemoProps {
  onClose?: () => void;
}

export function ExpiryWarningDemo({ onClose }: ExpiryWarningDemoProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotification, setShowNotification] = useState(false);
  const [notificationDismissed, setNotificationDismissed] = useState(false);
  const [demoStep, setDemoStep] = useState(1);

  // Mock session data for demo
  const mockSession = {
    id: 'demo-session-123',
    zone: {
      zoneNumber: 'ST-101',
      zoneName: 'Downtown Main St',
      address: '123 Main Street, Stamford, CT'
    },
    vehicle: {
      licensePlate: 'ABC123',
      state: 'CT',
      nickname: 'My Honda'
    },
    scheduledEndTime: new Date(Date.now() + 14 * 60 * 1000), // 14 minutes from now
    totalCost: 3.50
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Show notification when within 15 minutes
    const endTime = mockSession.scheduledEndTime.getTime();
    const now = currentTime.getTime();
    const timeRemaining = endTime - now;
    const fifteenMinutes = 15 * 60 * 1000;

    if (timeRemaining <= fifteenMinutes && timeRemaining > 0 && !notificationDismissed) {
      setShowNotification(true);
    }
  }, [currentTime, notificationDismissed]);

  const handleDismissNotification = () => {
    setNotificationDismissed(true);
    setShowNotification(false);
  };

  const handleExtendDemo = () => {
    // Simulate extending the session by 30 minutes
    mockSession.scheduledEndTime = new Date(mockSession.scheduledEndTime.getTime() + 30 * 60 * 1000);
    setNotificationDismissed(false);
    setShowNotification(false);
    setDemoStep(2);
  };

  const resetDemo = () => {
    mockSession.scheduledEndTime = new Date(Date.now() + 14 * 60 * 1000);
    setNotificationDismissed(false);
    setShowNotification(false);
    setDemoStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h2 className="text-xl font-semibold text-blue-900">
                  15-Minute Expiry Warning Demo
                </h2>
                <p className="text-sm text-blue-700">
                  See how our notification system alerts users before session expiry
                </p>
              </div>
            </div>
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                <strong>Demo Step {demoStep}:</strong>{' '}
                {demoStep === 1 ? 'Session expiring soon - warning appears' : 'Session extended - warning cleared'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={resetDemo} variant="outline">
                Reset Demo
              </Button>
              {demoStep === 1 && (
                <Button size="sm" onClick={handleExtendDemo}>
                  Simulate Extension
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Notification (Simulated) */}
      {showNotification && (
        <Card className="border-l-4 border-l-orange-500 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Browser Notification</h3>
                  <div className="mt-2 p-3 bg-white border rounded-lg shadow-sm max-w-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <img
                          src="/favicon.ico"
                          alt="App icon"
                          className="w-6 h-6 mr-2 mt-0.5"
                        />
                        <div>
                          <h4 className="font-medium text-sm">Stamford Parking</h4>
                          <p className="text-sm text-gray-700 mt-1">
                            Your parking session expires in {Math.ceil((mockSession.scheduledEndTime.getTime() - currentTime.getTime()) / (1000 * 60))} minutes
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Just now</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDismissNotification}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Push Notification (Simulated) */}
      {showNotification && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Mobile Push Notification</h3>
                <div className="bg-gray-900 text-white p-3 rounded-lg max-w-xs">
                  <div className="flex items-center mb-1">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                    <span className="text-xs font-medium">Stamford Parking</span>
                    <span className="text-xs text-gray-400 ml-auto">now</span>
                  </div>
                  <p className="text-sm">
                    Session expiring in {Math.ceil((mockSession.scheduledEndTime.getTime() - currentTime.getTime()) / (1000 * 60))} min
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Zone {mockSession.zone.zoneNumber} • {formatLicensePlate(mockSession.vehicle.licensePlate, mockSession.vehicle.state)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Notification (Simulated) */}
      {showNotification && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Email Notification</h3>
                <div className="bg-white border rounded-lg p-4 max-w-md">
                  <div className="border-b pb-2 mb-3">
                    <h4 className="font-semibold">Parking Session Expiring Soon</h4>
                    <p className="text-sm text-gray-600">from: noreply@stamfordparking.com</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>Hi there,</p>
                    <p>
                      Your parking session in <strong>Zone {mockSession.zone.zoneNumber}</strong> is
                      expiring in approximately <strong>{Math.ceil((mockSession.scheduledEndTime.getTime() - currentTime.getTime()) / (1000 * 60))} minutes</strong>.
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Vehicle:</strong> {formatLicensePlate(mockSession.vehicle.licensePlate, mockSession.vehicle.state)}</p>
                      <p><strong>Location:</strong> {mockSession.zone.address}</p>
                      <p><strong>Expires:</strong> {mockSession.scheduledEndTime.toLocaleString()}</p>
                    </div>
                    <div className="pt-2">
                      <Button size="sm" className="mr-2">Extend Session</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Session Details */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Demo Session Details</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Car className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formatLicensePlate(mockSession.vehicle.licensePlate, mockSession.vehicle.state)}
                  </p>
                  <p className="text-sm text-gray-600">{mockSession.vehicle.nickname}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Time Remaining</p>
                  <CountdownTimer
                    endTime={mockSession.scheduledEndTime}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-900">Zone {mockSession.zone.zoneNumber}</p>
                <p className="text-sm text-gray-600">{mockSession.zone.zoneName}</p>
                <p className="text-xs text-gray-500">{mockSession.zone.address}</p>
              </div>

              <div>
                <p className="font-medium text-gray-900">Session Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  showNotification
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {showNotification ? (
                    <>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expiring Soon
                    </>
                  ) : (
                    'Active'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showNotification && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex space-x-3">
                <Button onClick={handleExtendDemo} className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Extend Session
                </Button>
                <Button variant="outline" onClick={handleDismissNotification}>
                  Dismiss Warning
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Demo Instructions</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>1. Automatic Warning:</strong> When a session has 15 minutes or less remaining,
              notifications automatically appear across all enabled channels.
            </p>
            <p>
              <strong>2. Real-time Updates:</strong> The countdown timer updates every second,
              and warnings adjust accordingly.
            </p>
            <p>
              <strong>3. Multiple Channels:</strong> Users receive notifications via browser push,
              mobile push, email, and SMS (when enabled).
            </p>
            <p>
              <strong>4. Quick Actions:</strong> Each notification includes quick action buttons
              to extend the session or view details.
            </p>
            <p>
              <strong>5. Smart Dismissal:</strong> Warnings are automatically cleared when sessions
              are extended or when manually dismissed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}