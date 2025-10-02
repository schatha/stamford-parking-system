'use client';

import { useState } from 'react';
import { Clock, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingZone } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/formatting';

interface DurationPickerProps {
  zone: ParkingZone;
  selectedDuration: number;
  onDurationSelect: (hours: number) => void;
  onBack: () => void;
}

export function DurationPicker({
  zone,
  selectedDuration,
  onDurationSelect,
  onBack
}: DurationPickerProps) {
  const [customDuration, setCustomDuration] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const rate = getRateForLocationType(zone.locationType);

  // Generate duration options based on zone max duration
  const getDurationOptions = () => {
    const options = [];
    const maxHours = zone.maxDurationHours;

    // Always include 30 minutes if max duration allows
    if (maxHours >= 0.5) {
      options.push(0.5);
    }

    // Add hourly increments up to max duration
    for (let i = 1; i <= Math.min(maxHours, 8); i++) {
      options.push(i);
    }

    // Add some additional options for longer durations if zone allows
    if (maxHours > 8) {
      if (maxHours >= 10) options.push(10);
      if (maxHours >= 12) options.push(12);
      if (maxHours >= 24) options.push(24);
    }

    return options;
  };

  const durationOptions = getDurationOptions();

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    } else if (hours === 1) {
      return '1 hour';
    } else {
      return `${hours} hours`;
    }
  };

  const handleCustomDuration = () => {
    const hours = parseFloat(customDuration);
    if (isNaN(hours) || hours <= 0) {
      alert('Please enter a valid duration');
      return;
    }
    if (hours > zone.maxDurationHours) {
      alert(`Maximum duration for this zone is ${zone.maxDurationHours} hours`);
      return;
    }
    onDurationSelect(hours);
    setShowCustomInput(false);
    setCustomDuration('');
  };

  const getEndTime = (hours: number) => {
    const endTime = new Date();
    endTime.setTime(endTime.getTime() + hours * 60 * 60 * 1000);
    return endTime.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold">Select Parking Duration</h2>
                <p className="text-sm text-gray-800">
                  How long do you need to park? (Max {zone.maxDurationHours}h for this zone)
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
          {/* Zone Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">
                  Zone {zone.zoneNumber} - {zone.zoneName}
                </h3>
                <p className="text-sm text-blue-700">{zone.address}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-900">{formatCurrency(rate)}/hour</p>
                <p className="text-xs text-blue-700">Max {zone.maxDurationHours}h</p>
              </div>
            </div>
          </div>

          {/* Duration Options */}
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            {durationOptions.map((hours) => {
              const cost = calculateParkingCost(rate, hours);
              const isSelected = selectedDuration === hours;

              return (
                <Card
                  key={hours}
                  className={`cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => onDurationSelect(hours)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Clock className={`h-6 w-6 ${
                        isSelected ? 'text-blue-600' : 'text-gray-800'
                      }`} />
                    </div>
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {formatDuration(hours)}
                    </h3>
                    <p className={`text-sm font-medium ${
                      isSelected ? 'text-blue-700' : 'text-gray-800'
                    }`}>
                      {formatCurrency(cost.totalCost)}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Until {getEndTime(hours)}
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

            {/* Custom Duration Option */}
            <Card
              className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              onClick={() => setShowCustomInput(true)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-gray-800">+</span>
                </div>
                <h3 className="font-semibold text-gray-700">Custom</h3>
                <p className="text-sm text-gray-700">Enter hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Custom Duration Input */}
          {showCustomInput && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-3">Enter Custom Duration</h4>
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={zone.maxDurationHours}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="Enter hours"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <Button onClick={handleCustomDuration} size="sm">
                  Select
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setCustomDuration('');
                  }}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-700 mt-2">
                Maximum {zone.maxDurationHours} hours for this zone
              </p>
            </div>
          )}

          {/* Selected Duration Summary */}
          {selectedDuration > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900">
                    Selected: {formatDuration(selectedDuration)}
                  </h4>
                  <p className="text-sm text-green-700 mt-1">
                    Parking until {getEndTime(selectedDuration)}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-green-800">
                      <strong>Total Cost: {formatCurrency(calculateParkingCost(rate, selectedDuration).totalCost)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Zone Restrictions Warning */}
          {zone.restrictionsJson && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Zone Restrictions</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    This zone may have time restrictions or other limitations. Please check posted signs for current regulations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}