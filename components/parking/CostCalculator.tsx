'use client';

import { DollarSign, Receipt, Info } from 'lucide-react';
import { ParkingZone } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/formatting';

interface CostCalculatorProps {
  zone: ParkingZone;
  durationHours: number;
  showDetails?: boolean;
  className?: string;
}

export function CostCalculator({
  zone,
  durationHours,
  showDetails = true,
  className = ''
}: CostCalculatorProps) {
  const rate = getRateForLocationType(zone.locationType);
  const costs = calculateParkingCost(rate, durationHours);

  if (!showDetails) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">Total Cost</span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(costs.totalCost)}
          </span>
        </div>
        <p className="text-xs text-gray-900">
          {durationHours === 0.5 ? '30 minutes' :
           durationHours === 1 ? '1 hour' :
           `${durationHours} hours`} at {formatCurrency(rate)}/hr
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center">
        <Receipt className="h-5 w-5 text-gray-800 mr-2" />
        <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
      </div>

      <div className="space-y-3">
        {/* Base Cost */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-900 font-medium">Parking</span>
            <div className="group relative ml-1">
              <Info className="h-3 w-3 text-gray-900 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {durationHours === 0.5 ? '30 minutes' :
                 durationHours === 1 ? '1 hour' :
                 `${durationHours} hours`} × {formatCurrency(rate)}/hr
              </div>
            </div>
          </div>
          <span className="font-semibold text-gray-900">{formatCurrency(costs.baseCost)}</span>
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-900 font-medium">CT Sales Tax (6.35%)</span>
            <div className="group relative ml-1">
              <Info className="h-3 w-3 text-gray-900 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Connecticut state sales tax applied to parking fees
              </div>
            </div>
          </div>
          <span className="font-semibold text-gray-900">{formatCurrency(costs.taxAmount)}</span>
        </div>

        {/* Processing Fee */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <span className="text-gray-900 font-medium">Processing Fee</span>
            <div className="group relative ml-1">
              <Info className="h-3 w-3 text-gray-900 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                Credit card processing fee (2.9% + $0.30)
              </div>
            </div>
          </div>
          <span className="font-semibold text-gray-900">{formatCurrency(costs.processingFee)}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(costs.totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Rate Information */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-start space-x-2">
          <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-gray-900">
            <p className="font-medium">
              {zone.locationType === 'STREET' || zone.locationType === 'METER'
                ? 'On-street parking'
                : 'Garage/Lot parking'}: {formatCurrency(rate)}/hour
            </p>
            <p className="mt-1">
              Stamford municipal rates • Tax and processing fees applied
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Split Information */}
      {showDetails && (
        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-900">
            <p className="font-medium mb-1">Revenue Distribution:</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>City of Stamford:</span>
                <span>{formatCurrency(costs.baseCost + costs.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing fees:</span>
                <span>{formatCurrency(costs.processingFee)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}