'use client';

import { useState } from 'react';
import { X, Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingSessionWithDetails } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/formatting';

interface SessionExtensionModalProps {
  session: ParkingSessionWithDetails;
  onExtend: (additionalHours: number) => Promise<void>;
  onClose: () => void;
}

export function SessionExtensionModal({
  session,
  onExtend,
  onClose
}: SessionExtensionModalProps) {
  const [selectedHours, setSelectedHours] = useState<number>(0);
  const [isExtending, setIsExtending] = useState(false);

  const rate = getRateForLocationType(session.zone.locationType);

  // Calculate current session remaining time
  const now = new Date();
  const endTime = new Date(session.scheduledEndTime);
  const remainingHours = Math.max(0, (endTime.getTime() - now.getTime()) / (1000 * 60 * 60));

  // Calculate maximum additional hours allowed
  const maxAdditionalHours = Math.max(0, session.zone.maxDurationHours - session.durationHours);

  // Generate extension options
  const getExtensionOptions = () => {
    const options = [];

    if (maxAdditionalHours >= 0.5) options.push(0.5);
    if (maxAdditionalHours >= 1) options.push(1);
    if (maxAdditionalHours >= 2) options.push(2);
    if (maxAdditionalHours >= 4) options.push(4);

    return options.filter(hours => hours <= maxAdditionalHours);
  };

  const extensionOptions = getExtensionOptions();

  const getNewEndTime = (additionalHours: number) => {
    const newEndTime = new Date(endTime);
    newEndTime.setTime(newEndTime.getTime() + additionalHours * 60 * 60 * 1000);
    return newEndTime;
  };

  const handleExtend = async () => {
    if (selectedHours <= 0) return;

    setIsExtending(true);
    try {
      await onExtend(selectedHours);
    } finally {
      setIsExtending(false);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours === 0.5) return '30 minutes';
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
  };

  if (maxAdditionalHours <= 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cannot Extend Session</h2>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Maximum Duration Reached
              </h3>
              <p className="text-gray-800 mb-4">
                This parking zone has a maximum duration of {session.zone.maxDurationHours} hours.
                Your current session has already reached this limit.
              </p>
              <p className="text-sm text-gray-700">
                You'll need to move your vehicle and start a new session if you need more time.
              </p>
            </div>
            <Button className="w-full" onClick={onClose}>
              Understood
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Extend Parking Session</h2>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Session Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Current Session</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">
                  <strong>Zone:</strong> {session.zone.zoneNumber}
                </p>
                <p className="text-blue-700">
                  <strong>Current Duration:</strong> {formatDuration(session.durationHours)}
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <strong>Time Remaining:</strong> {formatDuration(remainingHours)}
                </p>
                <p className="text-blue-700">
                  <strong>Max Duration:</strong> {formatDuration(session.zone.maxDurationHours)}
                </p>
              </div>
            </div>
          </div>

          {/* Extension Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              How much time would you like to add?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {extensionOptions.map((hours) => {
                const cost = calculateParkingCost(rate, hours);
                const newEndTime = getNewEndTime(hours);
                const isSelected = selectedHours === hours;

                return (
                  <Card
                    key={hours}
                    className={`cursor-pointer transition-all border-2 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedHours(hours)}
                  >
                    <CardContent className="p-4 text-center">
                      <h4 className={`font-semibold ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {formatDuration(hours)}
                      </h4>
                      <p className={`text-sm font-medium ${
                        isSelected ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {formatCurrency(cost.totalCost)}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Until {newEndTime.toLocaleString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {isSelected && (
                        <div className="mt-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          {selectedHours > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3">Extension Cost</h3>
              <div className="space-y-2 text-sm">
                {(() => {
                  const cost = calculateParkingCost(rate, selectedHours);
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-green-700">Base Cost ({formatDuration(selectedHours)}):</span>
                        <span>{formatCurrency(cost.baseCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">CT Sales Tax (6.35%):</span>
                        <span>{formatCurrency(cost.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Processing Fee:</span>
                        <span>{formatCurrency(cost.processingFee)}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-green-900">
                          <span>Total:</span>
                          <span>{formatCurrency(cost.totalCost)}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-green-300">
                        <div className="flex justify-between font-semibold text-green-900">
                          <span>New End Time:</span>
                          <span>{getNewEndTime(selectedHours).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Warning */}
          {selectedHours > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Payment Required</p>
                  <p>This extension will be charged to your default payment method immediately.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isExtending}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleExtend}
              disabled={selectedHours <= 0 || isExtending}
              isLoading={isExtending}
            >
              {isExtending ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {selectedHours > 0 ? formatCurrency(calculateParkingCost(rate, selectedHours).totalCost) : '$0.00'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}