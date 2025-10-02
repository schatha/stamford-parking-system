'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Info, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingZone, RestrictionCheckResult } from '@/types';
import { checkZoneRestrictions, getNextAvailableTime, formatRestrictionMessage } from '@/lib/utils/restrictions';
import { format, addMinutes } from 'date-fns';

interface ZoneRestrictionsProps {
  zone: ParkingZone;
  durationHours: number;
  onRestrictionChange?: (canPark: boolean, result: RestrictionCheckResult) => void;
}

export function ZoneRestrictions({
  zone,
  durationHours,
  onRestrictionChange
}: ZoneRestrictionsProps) {
  const [restrictionResult, setRestrictionResult] = useState<RestrictionCheckResult | null>(null);
  const [nextAvailableTime, setNextAvailableTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkRestrictions = () => {
      const now = new Date();
      const result = checkZoneRestrictions(zone, now, durationHours);
      setRestrictionResult(result);

      if (!result.canPark) {
        const nextTime = getNextAvailableTime(zone, now);
        setNextAvailableTime(nextTime);
      } else {
        setNextAvailableTime(null);
      }

      onRestrictionChange?.(result.canPark, result);
    };

    checkRestrictions();
    // Check restrictions every minute
    const interval = setInterval(checkRestrictions, 60000);

    return () => clearInterval(interval);
  }, [zone, durationHours, onRestrictionChange]);

  if (!restrictionResult) {
    return null;
  }

  const hasRestrictions = restrictionResult.restrictions.length > 0;
  const hasWarnings = restrictionResult.warnings && restrictionResult.warnings.length > 0;

  if (!hasRestrictions && !hasWarnings) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">No Restrictions</p>
              <p className="text-sm text-green-700">
                This zone is available for parking now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {hasRestrictions && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 mb-2">
                  🚫 Cannot Park Now
                </h3>
                <div className="space-y-2">
                  {restrictionResult.restrictions.map((restriction, index) => (
                    <div key={index} className="text-sm text-red-700">
                      {formatRestrictionMessage(restriction)}
                    </div>
                  ))}
                </div>

                {nextAvailableTime && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        Next available: {format(nextAvailableTime, 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasWarnings && restrictionResult.canPark && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-2">
                  ⚠️ Parking Warnings
                </h3>
                <div className="space-y-2">
                  {restrictionResult.warnings.map((warning, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      <strong>{warning.type.replace('_', ' ').toLowerCase()}:</strong> {warning.message}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-yellow-600">
                  💡 Consider ending your session before restrictions begin to avoid tickets
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface RestrictionScheduleProps {
  zone: ParkingZone;
}

export function RestrictionSchedule({ zone }: RestrictionScheduleProps) {
  const restrictions = zone.restrictionsJson?.timeRestrictions || [];

  if (restrictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Parking Schedule</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>Available 24/7 - No time restrictions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Parking Restrictions</h3>
        <p className="text-sm text-gray-800">
          Times when parking is not allowed in this zone
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {restrictions.map((restriction, index) => (
            <div key={index} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getRestrictionColor(restriction.restrictionType)}`} />
                    <span className="font-medium text-sm">
                      {restriction.restrictionType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {restriction.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-700">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{restriction.startTime} - {restriction.endTime}</span>
                    </div>
                    <div>
                      {restriction.daysOfWeek.map(day => daysOfWeek[day]).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Smart Parking Tips</p>
              <ul className="space-y-1 text-xs">
                <li>• Our system prevents booking during restricted hours</li>
                <li>• You'll get warnings when restrictions are approaching</li>
                <li>• Consider shorter sessions to avoid restriction conflicts</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getRestrictionColor(type: string): string {
  const colors = {
    RUSH_HOUR: 'bg-red-500',
    STREET_CLEANING: 'bg-blue-500',
    PERMIT_ONLY: 'bg-purple-500',
    NO_PARKING: 'bg-gray-500',
    LOADING_ZONE: 'bg-orange-500'
  };
  return colors[type] || 'bg-gray-500';
}