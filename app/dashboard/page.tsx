'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Car, Plus, Clock, CreditCard, Settings, LogOut, User, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Vehicle, ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatDate, formatLicensePlate } from '@/lib/utils/formatting';
import { ActiveSessionCard } from '@/components/dashboard/ActiveSessionCard';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeSessions, setActiveSessions] = useState<ParkingSessionWithDetails[]>([]);
  const [recentSessions, setRecentSessions] = useState<ParkingSessionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [vehiclesRes, sessionsRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/sessions?limit=10'),
      ]);

      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData.data || []);
      }

      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        const sessions = sessionsData.data || [];
        setActiveSessions(sessions.filter((s: any) => s.status === 'ACTIVE' || s.status === 'PENDING'));
        setRecentSessions(sessions.filter((s: any) => s.status === 'COMPLETED' || s.status === 'EXPIRED').slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendSession = async (sessionId: string, additionalHours: number) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalHours }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend session');
      }

      // Reload data to show updated session
      await loadData();
    } catch (error) {
      console.error('Failed to extend session:', error);
      // You might want to show a toast notification here
    }
  };

  const handleSessionExpired = async (sessionId: string) => {
    // Reload data to update session status
    await loadData();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Parking Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeSessions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Active Parking Sessions</h2>
              {activeSessions.filter(s => s.status === 'ACTIVE').length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>{activeSessions.filter(s => s.status === 'ACTIVE').length} active</span>
                </div>
              )}
            </div>
            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <ActiveSessionCard
                  key={session.id}
                  session={session}
                  onExtend={handleExtendSession}
                  onSessionExpired={handleSessionExpired}
                />
              ))}
            </div>
          </div>
        )}

        {/* Demo Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    🚀 Try Our Expiry Warning Demo
                  </h3>
                  <p className="text-purple-700 text-sm">
                    Experience our intelligent notification system that prevents parking violations
                  </p>
                </div>
                <Link href="/demo/expiry-warning">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    View Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Vehicles</h2>
              <div className="flex space-x-2">
                <Link href="/dashboard/vehicles">
                  <Button size="sm" variant="outline" className="flex items-center">
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                  </Button>
                </Link>
                <Link href="/dashboard/vehicles/add">
                  <Button size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Vehicle
                  </Button>
                </Link>
              </div>
            </div>

            {vehicles.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No vehicles registered yet</p>
                  <Link href="/dashboard/vehicles/add">
                    <Button>Add Your First Vehicle</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {formatLicensePlate(vehicle.licensePlate, vehicle.state)}
                          </p>
                          {vehicle.nickname && (
                            <p className="text-sm text-gray-600">{vehicle.nickname}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/park?vehicleId=${vehicle.id}`}>
                            <Button size="sm">
                              Start Parking
                            </Button>
                          </Link>
                          <Link href={`/dashboard/vehicles/${vehicle.id}`}>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
              <Link href="/dashboard/history">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>

            {recentSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center p-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No parking sessions yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {formatLicensePlate(session.vehicle.licensePlate, session.vehicle.state)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.zone.zoneName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(session.totalCost)}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            session.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            session.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Card */}
        {recentSessions.length > 0 && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      📊 View Your Parking Analytics
                    </h3>
                    <p className="text-blue-700 text-sm">
                      See detailed insights about your parking patterns, spending, and savings
                    </p>
                  </div>
                  <Link href="/dashboard/analytics">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ready to park?
            </h3>
            <Link href="/park">
              <Button size="lg" className="flex items-center mx-auto">
                <Car className="h-5 w-5 mr-2" />
                Start Parking Session
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}