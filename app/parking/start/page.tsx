'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, MapPin, Clock, DollarSign, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Vehicle, ParkingZone } from '@/types';
import { formatCurrency, formatLicensePlate, formatZoneDisplay } from '@/lib/utils/formatting';
import { calculateParkingCost } from '@/lib/utils/calculations';

export default function StartParkingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const zoneId = searchParams.get('zoneId');
  const vehicleId = searchParams.get('vehicleId');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleId || '');
  const [selectedZoneId, setSelectedZoneId] = useState(zoneId || '');
  const [duration, setDuration] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const costs = selectedZone && duration ?
    calculateParkingCost(selectedZone.ratePerHour, parseFloat(duration)) :
    null;

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadData();
  }, [session, status, router]);

  const loadData = async () => {
    try {
      const [vehiclesRes, zonesRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/zones'),
      ]);

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData.data || []);
      }

      if (zonesRes.ok) {
        const zonesData = await zonesRes.json();
        setZones(zonesData.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDurationOptions = () => {
    if (!selectedZone) return [];

    const options = [];
    for (let i = 0.5; i <= selectedZone.maxDurationHours; i += 0.5) {
      options.push({
        value: i.toString(),
        label: i < 1 ? `${i * 60} minutes` : `${i} hour${i > 1 ? 's' : ''}`,
      });
    }
    return options;
  };

  const handleCreateSession = async () => {
    if (!selectedVehicleId || !selectedZoneId || !duration) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          zoneId: selectedZoneId,
          durationHours: parseFloat(duration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create parking session');
        return;
      }

      router.push(`/parking/payment/${data.data.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Start Parking</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center p-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Vehicles Found</h3>
              <p className="text-gray-600 mb-4">
                You need to add a vehicle before you can start parking.
              </p>
              <Link href="/dashboard/vehicles/add">
                <Button>Add Vehicle</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href={zoneId ? "/parking/zones" : "/dashboard"} className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Start Parking</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Select Vehicle
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.map((vehicle) => (
                  <label
                    key={vehicle.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVehicleId === vehicle.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      value={vehicle.id}
                      checked={selectedVehicleId === vehicle.id}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {formatLicensePlate(vehicle.licensePlate, vehicle.state)}
                        </p>
                        {vehicle.nickname && (
                          <p className="text-sm text-gray-600">{vehicle.nickname}</p>
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedVehicleId === vehicle.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedVehicleId === vehicle.id && (
                          <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Select Parking Zone
              </h2>
            </CardHeader>
            <CardContent>
              {!selectedZoneId ? (
                <Link href="/parking/zones">
                  <Button variant="outline" className="w-full">
                    Choose Parking Zone
                  </Button>
                </Link>
              ) : selectedZone ? (
                <div className="p-4 border border-green-300 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {formatZoneDisplay(selectedZone.zoneNumber, selectedZone.zoneName)}
                      </p>
                      <p className="text-sm text-gray-600">{selectedZone.address}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(selectedZone.ratePerHour)}/hour • Max {selectedZone.maxDurationHours}h
                      </p>
                    </div>
                    <Link href="/parking/zones">
                      <Button variant="outline" size="sm">
                        Change
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-600">
                  Invalid zone selected. Please choose a different zone.
                </div>
              )}
            </CardContent>
          </Card>

          {selectedZone && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Select Duration
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getDurationOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {costs && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Calculator className="h-4 w-4 mr-1" />
                        Cost Breakdown
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Base cost ({duration}h):</span>
                          <span>{formatCurrency(costs.baseCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(costs.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing fee:</span>
                          <span>{formatCurrency(costs.processingFee)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-2 border-t">
                          <span>Total:</span>
                          <span>{formatCurrency(costs.totalCost)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedVehicleId && selectedZoneId && duration && costs && (
            <Button
              onClick={handleCreateSession}
              isLoading={isCreating}
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? 'Creating session...' : `Proceed to Payment (${formatCurrency(costs.totalCost)})`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}