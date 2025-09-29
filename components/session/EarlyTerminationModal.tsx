'use client';

import { useState } from 'react';
import { X, StopCircle, RefreshCw, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingSessionWithDetails } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/formatting';

interface EarlyTerminationModalProps {
  session: ParkingSessionWithDetails;
  onTerminate: () => Promise<void>;
  onClose: () => void;
}

export function EarlyTerminationModal({
  session,
  onTerminate,
  onClose
}: EarlyTerminationModalProps) {
  const [isTerminating, setIsTerminating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const calculateRefund = () => {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.scheduledEndTime);

    // Calculate actual time used (in hours)
    const timeUsedMs = now.getTime() - startTime.getTime();
    const timeUsedHours = Math.max(0, timeUsedMs / (1000 * 60 * 60));

    // Minimum charge is 30 minutes
    const chargeableHours = Math.max(0.5, timeUsedHours);

    // Calculate what should be charged vs what was paid
    const rate = getRateForLocationType(session.zone.locationType);
    const shouldPayCost = calculateParkingCost(rate, chargeableHours);
    const actualPaidCost = {
      baseCost: session.baseCost,
      taxAmount: session.taxAmount,
      processingFee: session.processingFee,
      totalCost: session.totalCost
    };

    // Calculate refund (base cost + tax only, processing fee is non-refundable)
    const refundableAmount = (actualPaidCost.baseCost + actualPaidCost.taxAmount) - (shouldPayCost.baseCost + shouldPayCost.taxAmount);
    const refundAmount = Math.max(0, refundableAmount);

    // Processing fees are typically non-refundable
    const processingFeeRefund = 0;

    return {
      timeUsedHours: Math.round(timeUsedHours * 100) / 100,
      chargeableHours,
      shouldPayCost,
      actualPaidCost,
      refundAmount: Math.round(refundAmount * 100) / 100,
      processingFeeRefund,
      totalRefund: Math.round(refundAmount * 100) / 100,
      remainingTimeHours: Math.max(0, (endTime.getTime() - now.getTime()) / (1000 * 60 * 60))
    };
  };

  const refundDetails = calculateRefund();

  const handleTerminate = async () => {
    setIsTerminating(true);
    try {
      await onTerminate();
    } finally {
      setIsTerminating(false);
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutes`;
    }
    if (hours === 1) return '1 hour';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) return `${wholeHours} hours`;
    return `${wholeHours}h ${minutes}m`;
  };

  if (!showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <StopCircle className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-semibold">End Session Early</h2>
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
                    <strong>Time Used:</strong> {formatDuration(refundDetails.timeUsedHours)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">
                    <strong>Time Remaining:</strong> {formatDuration(refundDetails.remainingTimeHours)}
                  </p>
                  <p className="text-blue-700">
                    <strong>Paid:</strong> {formatCurrency(session.totalCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Refund Calculation */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-3 flex items-center">
                <RefreshCw className="h-5 w-5 mr-2" />
                Refund Calculation
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">What you paid:</h4>
                  <div className="space-y-1 pl-4">
                    <div className="flex justify-between">
                      <span className="text-green-700">Base cost ({formatDuration(session.durationHours)}):</span>
                      <span>{formatCurrency(refundDetails.actualPaidCost.baseCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Tax:</span>
                      <span>{formatCurrency(refundDetails.actualPaidCost.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Processing fee:</span>
                      <span>{formatCurrency(refundDetails.actualPaidCost.processingFee)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-green-800 mb-2">What you should pay (minimum 30 min):</h4>
                  <div className="space-y-1 pl-4">
                    <div className="flex justify-between">
                      <span className="text-green-700">Base cost ({formatDuration(refundDetails.chargeableHours)}):</span>
                      <span>{formatCurrency(refundDetails.shouldPayCost.baseCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Tax:</span>
                      <span>{formatCurrency(refundDetails.shouldPayCost.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Processing fee:</span>
                      <span>{formatCurrency(refundDetails.shouldPayCost.processingFee)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 border-green-300">
                  <div className="flex justify-between font-semibold text-green-900">
                    <span>Your Refund:</span>
                    <span className="text-lg">
                      {refundDetails.totalRefund > 0
                        ? formatCurrency(refundDetails.totalRefund)
                        : 'No refund'
                      }
                    </span>
                  </div>
                  {refundDetails.totalRefund === 0 && (
                    <p className="text-xs text-green-700 mt-1">
                      Minimum charge of 30 minutes already met
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <h4 className="font-medium mb-1">Important Notes</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Minimum charge is 30 minutes</li>
                    <li>Processing fees are non-refundable</li>
                    <li>Refunds typically take 3-5 business days</li>
                    <li>You cannot restart this session once terminated</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Time Savings */}
            {refundDetails.remainingTimeHours > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-blue-900">Time Saved</h4>
                    <p className="text-sm text-blue-700">
                      You're ending {formatDuration(refundDetails.remainingTimeHours)} early
                    </p>
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
              >
                Keep Session Active
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => setShowConfirmation(true)}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-red-900">Confirm Early Termination</h2>
            <Button variant="outline" size="sm" onClick={() => setShowConfirmation(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <StopCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to end this session?
            </h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. Your parking session will be terminated immediately.
            </p>

            {refundDetails.totalRefund > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                <div className="flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                  <span className="font-semibold text-green-900">
                    {formatCurrency(refundDetails.totalRefund)} refund
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Will be processed to your original payment method
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmation(false)}
              disabled={isTerminating}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleTerminate}
              isLoading={isTerminating}
              disabled={isTerminating}
            >
              {isTerminating ? 'Ending Session...' : 'Yes, End Session'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}