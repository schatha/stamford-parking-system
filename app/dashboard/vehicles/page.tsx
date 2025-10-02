'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Car, Plus, Edit, Trash2, ArrowLeft, Settings } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Vehicle } from '@/types';
import { formatLicensePlate } from '@/lib/utils/formatting';

export default function VehiclesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setDeletingId(vehicleId);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      alert('An error occurred while deleting the vehicle');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading vehicles...</p>
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
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">
                  My Vehicles
                </h1>
              </div>
            </div>
            <Link href="/dashboard/vehicles/add">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Add Vehicle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {vehicles.length === 0 ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="text-center p-8">
                <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No vehicles registered
                </h3>
                <p className="text-gray-800 mb-6">
                  Add your first vehicle to start parking with ease. You can add multiple vehicles and manage them all in one place.
                </p>
                <Link href="/dashboard/vehicles/add">
                  <Button size="lg" className="flex items-center mx-auto">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Vehicle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <p className="text-gray-800">
                You have {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered.
                Manage your vehicles here and quickly start parking sessions.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Car className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatLicensePlate(vehicle.licensePlate, vehicle.state)}
                          </h3>
                          {vehicle.nickname && (
                            <p className="text-sm text-gray-800 font-medium">
                              {vehicle.nickname}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Registered {new Date(vehicle.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/dashboard/vehicles/edit/${vehicle.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          isLoading={deletingId === vehicle.id}
                          disabled={deletingId === vehicle.id}
                          className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Link
                          href={`/park?vehicleId=${vehicle.id}`}
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full">
                            Start Parking
                          </Button>
                        </Link>
                        <Link href={`/dashboard/vehicles/history/${vehicle.id}`}>
                          <Button variant="outline" size="sm">
                            History
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add another vehicle card */}
            <div className="mt-6">
              <Link href="/dashboard/vehicles/add">
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                  <CardContent className="text-center p-8">
                    <Plus className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Add Another Vehicle
                    </h3>
                    <p className="text-gray-500">
                      Register multiple vehicles for convenience
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}