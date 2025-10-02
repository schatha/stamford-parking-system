'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Car, MapPin, CreditCard, Filter, Calendar, Search } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatDate, formatLicensePlate } from '@/lib/utils/formatting';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<ParkingSessionWithDetails[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ParkingSessionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    loadSessions();
  }, [session, status, router]);

  useEffect(() => {
    // Apply filters
    let filtered = sessions;

    if (filters.search) {
      filtered = filtered.filter(s =>
        s.vehicle.licensePlate.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.zone.zoneName.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.zone.zoneNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    if (filters.dateRange) {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(s => new Date(s.createdAt) >= cutoffDate);
    }

    setFilteredSessions(filtered);
  }, [sessions, filters]);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions?limit=100');
      if (response.ok) {
        const data = await response.json();
        const allSessions = data.data || [];
        setSessions(allSessions);
        setFilteredSessions(allSessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'EXTENDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'COMPLETED': return 'Completed';
      case 'EXPIRED': return 'Expired';
      case 'EXTENDED': return 'Extended';
      case 'PENDING': return 'Pending Payment';
      default: return status;
    }
  };

  const getTotalSpent = () => {
    return filteredSessions
      .filter(s => s.status === 'COMPLETED' || s.status === 'EXTENDED')
      .reduce((total, s) => total + s.totalCost, 0);
  };

  const getSessionsByMonth = () => {
    const monthlyData: { [key: string]: number } = {};
    filteredSessions.forEach(session => {
      const month = new Date(session.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    return monthlyData;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading parking history...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Parking History</h1>
                <p className="text-sm text-gray-800">
                  {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                  {filters.search || filters.status || filters.dateRange ? ' (filtered)' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Car className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{filteredSessions.length}</p>
              <p className="text-sm text-gray-800">Total Sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalSpent())}</p>
              <p className="text-sm text-gray-800">Total Spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSessions.filter(s => s.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-800">Active Now</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredSessions.map(s => s.zone.zoneNumber)).size}
              </p>
              <p className="text-sm text-gray-800">Zones Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-800 mr-2" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="search"
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="License plate, zone name..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="EXTENDED">Extended</option>
                  <option value="PENDING">Pending Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                </select>
              </div>
            </div>

            {(filters.search || filters.status || filters.dateRange) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ search: '', status: '', dateRange: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="text-center p-12">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {sessions.length === 0 ? 'No parking sessions yet' : 'No sessions match your filters'}
              </h3>
              <p className="text-gray-800 mb-6">
                {sessions.length === 0
                  ? 'Start your first parking session from the dashboard.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {sessions.length === 0 && (
                <Link href="/park">
                  <Button>Start Parking</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Car className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {formatLicensePlate(session.vehicle.licensePlate, session.vehicle.state)}
                        </h3>
                        {session.vehicle.nickname && (
                          <p className="text-sm text-gray-800">{session.vehicle.nickname}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-700 mt-1">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{session.zone.zoneNumber} - {session.zone.zoneName}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(session.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{session.durationHours}h</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(session.totalCost)}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(session.status)}`}>
                          {getStatusLabel(session.status)}
                        </span>
                      </div>
                      {(session.status === 'ACTIVE' || session.status === 'EXTENDED') && (
                        <Link href={`/dashboard/active-session/${session.id}`}>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}