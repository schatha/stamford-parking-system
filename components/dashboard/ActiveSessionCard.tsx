'use client';

import { useState } from 'react';
import { Car, Clock, MapPin, CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatLicensePlate } from '@/lib/utils/formatting';

interface ActiveSessionCardProps {
  session: ParkingSessionWithDetails;
  onExtend?: (sessionId: string, hours: number) => void;
  onSessionExpired?: (sessionId: string) => void;
}

export function ActiveSessionCard({
  session,
  onExtend,
  onSessionExpired
}: ActiveSessionCardProps) {
  const [isExtending, setIsExtending] = useState(false);
  const [showExtendOptions, setShowExtendOptions] = useState(false);

  const handleExtend = async (additionalHours: number) => {
    setIsExtending(true);
    try {
      if (onExtend) {
        await onExtend(session.id, additionalHours);
      }
      setShowExtendOptions(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleExpired = () => {
    if (onSessionExpired) {
      onSessionExpired(session.id);
    }
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'ACTIVE':
        return 'border-l-green-500 bg-green-50';
      case 'PENDING':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'EXPIRED':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const extendOptions = [
    { hours: 0.5, label: '30 min', cost: session.zone.ratePerHour * 0.5 },
    { hours: 1, label: '1 hour', cost: session.zone.ratePerHour },
    { hours: 2, label: '2 hours', cost: session.zone.ratePerHour * 2 },
  ];

  return (
    <Card className={`border-l-4 ${getStatusColor()}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {formatLicensePlate(session.vehicle.licensePlate, session.vehicle.state)}
                </h3>
                {session.vehicle.nickname && (
                  <p className="text-sm text-gray-500">{session.vehicle.nickname}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                session.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                session.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.status}
              </span>
            </div>
          </div>

          {/* Location and Cost */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{session.zone.zoneName}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-900 font-medium">
              <CreditCard className="h-4 w-4" />
              <span>{formatCurrency(session.totalCost)}</span>
            </div>
          </div>

          {/* Time Remaining */}
          {session.status === 'ACTIVE' && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time remaining:</p>
                <CountdownTimer
                  endTime={session.scheduledEndTime}
                  onExpired={handleExpired}
                  className="mt-1"
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Until {new Date(session.scheduledEndTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-200">
            {session.status === 'ACTIVE' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExtendOptions(!showExtendOptions)}
                  className="flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Extend Time
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/dashboard/active-session/${session.id}`}
                  className="flex items-center justify-center"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </>
            )}

            {session.status === 'PENDING' && (
              <Button
                size="sm"
                onClick={() => window.location.href = `/parking/payment/${session.id}`}
                className="flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Complete Payment
              </Button>
            )}

            {session.status === 'EXPIRED' && (
              <div className="text-center">
                <p className="text-sm text-red-600 font-medium">Session Expired</p>
                <p className="text-xs text-gray-500">
                  Please start a new parking session
                </p>
              </div>
            )}
          </div>

          {/* Extend Options */}
          {showExtendOptions && session.status === 'ACTIVE' && (
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700">Extend by:</p>
              <div className="grid grid-cols-3 gap-2">
                {extendOptions.map((option) => (
                  <Button
                    key={option.hours}
                    size="sm"
                    variant="outline"
                    onClick={() => handleExtend(option.hours)}
                    isLoading={isExtending}
                    disabled={isExtending}
                    className="text-xs"
                  >
                    <div className="text-center">
                      <div>{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(option.cost)}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}