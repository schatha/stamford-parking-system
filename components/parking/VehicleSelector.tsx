'use client';

import { Car, Plus, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { formatLicensePlate } from '@/lib/utils/formatting';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onBack: () => void;
}

export function VehicleSelector({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
  onBack
}: VehicleSelectorProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <h2 className="text-lg font-semibold">Choose Your Vehicle</h2>
                <p className="text-sm text-gray-800">
                  Select which vehicle you want to park
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
          <div className="grid gap-4 md:grid-cols-2">
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all border-2 ${
                  selectedVehicleId === vehicle.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => onVehicleSelect(vehicle)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedVehicleId === vehicle.id
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}>
                      <Car className={`h-6 w-6 ${
                        selectedVehicleId === vehicle.id
                          ? 'text-blue-600'
                          : 'text-gray-800'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${
                        selectedVehicleId === vehicle.id
                          ? 'text-blue-900'
                          : 'text-gray-900'
                      }`}>
                        {formatLicensePlate(vehicle.licensePlate, vehicle.state)}
                      </h3>
                      {vehicle.nickname && (
                        <p className={`text-sm ${
                          selectedVehicleId === vehicle.id
                            ? 'text-blue-700'
                            : 'text-gray-800'
                        }`}>
                          {vehicle.nickname}
                        </p>
                      )}
                      <p className="text-xs text-gray-700">
                        Registered {new Date(vehicle.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedVehicleId === vehicle.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {vehicles.length > 0 && (
            <div className="mt-6">
              <Link href="/dashboard/vehicles/add">
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <CardContent className="text-center p-6">
                    <Plus className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-700 mb-1">
                      Add Another Vehicle
                    </h3>
                    <p className="text-sm text-gray-700">
                      Register a new vehicle for parking
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Management Tip */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Car className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-900">Pro Tip</h4>
              <p className="text-sm text-green-800 mt-1">
                You can manage all your vehicles in your dashboard. Add nicknames to make them easier to identify!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}