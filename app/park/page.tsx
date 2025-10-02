'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin, Car, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Vehicle, ParkingZone } from '@/types';
import { calculateParkingCost, getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency, formatLicensePlate } from '@/lib/utils/formatting';
import { ZoneSelector } from '@/components/parking/ZoneSelector';
import { VehicleSelector } from '@/components/parking/VehicleSelector';
import { DurationPicker } from '@/components/parking/DurationPicker';
import { CostCalculator } from '@/components/parking/CostCalculator';
import { PaymentForm } from '@/components/parking/PaymentForm';

interface ParkingFormData {
  zoneId: string;
  vehicleId: string;
  durationHours: number;
  zone?: ParkingZone;
  vehicle?: Vehicle;
}

function ParkPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ParkingFormData>({
    zoneId: '',
    vehicleId: searchParams.get('vehicleId') || '',
    durationHours: 1,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    loadVehicles();
  }, [session, status, router]);

  const loadVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleZoneSelect = (zone: ParkingZone) => {
    setFormData(prev => ({
      ...prev,
      zoneId: zone.id,
      zone,
      // Reset duration if it exceeds the new zone's max duration
      durationHours: Math.min(prev.durationHours, zone.maxDurationHours)
    }));
    setCurrentStep(2);
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicleId: vehicle.id,
      vehicle
    }));
    setCurrentStep(3);
  };

  const handleDurationSelect = (hours: number) => {
    setFormData(prev => ({
      ...prev,
      durationHours: hours
    }));
    setCurrentStep(4);
  };

  const handlePaymentSuccess = async (sessionId: string) => {
    router.push(`/park/confirmation/${sessionId}`);
  };

  const getCostBreakdown = () => {
    if (!formData.zone) return null;

    const rate = getRateForLocationType(formData.zone.locationType);
    return calculateParkingCost(rate, formData.durationHours);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Select Parking Zone';
      case 2: return 'Choose Vehicle';
      case 3: return 'Select Duration';
      case 4: return 'Review & Pay';
      default: return 'Park Your Vehicle';
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading parking interface...</p>
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
                  Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Park Your Vehicle</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center p-8">
                <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Vehicles Registered
                </h3>
                <p className="text-gray-800 mb-6">
                  You need to add a vehicle before you can start parking.
                </p>
                <Link href="/dashboard/vehicles/add">
                  <Button size="lg">Add Your First Vehicle</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
                <p className="text-sm text-gray-800 font-medium">Step {currentStep} of 4</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-800 font-medium">Welcome, {session?.user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}>
                  {step}
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center mt-2 pb-4">
            {[
              { step: 1, label: 'Zone', icon: MapPin },
              { step: 2, label: 'Vehicle', icon: Car },
              { step: 3, label: 'Duration', icon: Clock },
              { step: 4, label: 'Payment', icon: CreditCard },
            ].map((item, index) => (
              <div key={item.step} className="flex-1 flex items-center">
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {index < 3 && <div className="flex-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <ZoneSelector onZoneSelect={handleZoneSelect} />
              )}

              {currentStep === 2 && (
                <VehicleSelector
                  vehicles={vehicles}
                  selectedVehicleId={formData.vehicleId}
                  onVehicleSelect={handleVehicleSelect}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {currentStep === 3 && formData.zone && (
                <DurationPicker
                  zone={formData.zone}
                  selectedDuration={formData.durationHours}
                  onDurationSelect={handleDurationSelect}
                  onBack={() => setCurrentStep(2)}
                />
              )}

              {currentStep === 4 && formData.zone && formData.vehicle && (
                <PaymentForm
                  zone={formData.zone}
                  vehicle={formData.vehicle}
                  durationHours={formData.durationHours}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setCurrentStep(3)}
                />
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Parking Summary</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Zone Info */}
                  {formData.zone && (
                    <div>
                      <h4 className="font-medium text-gray-900">Zone</h4>
                      <p className="text-sm text-gray-800 font-medium">
                        {formData.zone.zoneName}
                      </p>
                      <p className="text-xs text-gray-700">
                        {formData.zone.address}
                      </p>
                    </div>
                  )}

                  {/* Vehicle Info */}
                  {formData.vehicle && (
                    <div>
                      <h4 className="font-medium text-gray-900">Vehicle</h4>
                      <p className="text-sm text-gray-800 font-medium">
                        {formatLicensePlate(formData.vehicle.licensePlate, formData.vehicle.state)}
                      </p>
                      {formData.vehicle.nickname && (
                        <p className="text-xs text-gray-700">
                          {formData.vehicle.nickname}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Duration */}
                  {formData.durationHours > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900">Duration</h4>
                      <p className="text-sm text-gray-800 font-medium">
                        {formData.durationHours === 0.5 ? '30 minutes' :
                         formData.durationHours === 1 ? '1 hour' :
                         `${formData.durationHours} hours`}
                      </p>
                    </div>
                  )}

                  {/* Cost Breakdown */}
                  {formData.zone && formData.durationHours > 0 && (
                    <CostCalculator
                      zone={formData.zone}
                      durationHours={formData.durationHours}
                      showDetails={currentStep >= 3}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading parking interface...</p>
        </div>
      </div>
    }>
      <ParkPageContent />
    </Suspense>
  );
}
