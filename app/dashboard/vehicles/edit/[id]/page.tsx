'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Car, Save } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { US_STATES } from '@/lib/utils/constants';
import { validateLicensePlate } from '@/lib/utils/validation';
import { Vehicle } from '@/types';

export default function EditVehiclePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    licensePlate: '',
    state: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    loadVehicle();
  }, [session, status, router, vehicleId]);

  const loadVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        const vehicleData = data.data;
        setVehicle(vehicleData);
        setFormData({
          licensePlate: vehicleData.licensePlate,
          state: vehicleData.state,
          nickname: vehicleData.nickname || '',
        });
      } else {
        router.push('/dashboard/vehicles');
      }
    } catch (error) {
      console.error('Failed to load vehicle:', error);
      router.push('/dashboard/vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!validateLicensePlate(formData.licensePlate)) {
      newErrors.licensePlate = 'Please enter a valid license plate';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Failed to update vehicle' });
        return;
      }

      router.push('/dashboard/vehicles?success=vehicle-updated');
    } catch (error) {
      setErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Vehicle not found</p>
          <Link href="/dashboard/vehicles">
            <Button className="mt-4">Back to Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/dashboard/vehicles" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Vehicles
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Car className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Update Vehicle Information</h2>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.form && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errors.form}
                  </div>
                )}

                <Input
                  id="licensePlate"
                  name="licensePlate"
                  type="text"
                  label="License Plate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  error={errors.licensePlate}
                  placeholder="ABC123"
                  required
                />

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.state
                        ? 'border-red-300 text-red-900'
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name} ({state.code})
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  label="Nickname (optional)"
                  value={formData.nickname}
                  onChange={handleChange}
                  error={errors.nickname}
                  placeholder="My Car"
                  helperText="Give your vehicle a memorable name"
                />

                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    className="flex-1 flex items-center justify-center"
                    isLoading={isSaving}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Link href="/dashboard/vehicles" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Vehicle registered on {new Date(vehicle.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}