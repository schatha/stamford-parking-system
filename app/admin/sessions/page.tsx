'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Car,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency, formatLicensePlate, formatDate } from '@/lib/utils/formatting';

interface SessionData {
  id: string;
  licensePlate: string;
  vehicleState: string;
  vehicleNickname?: string;
  userEmail: string;
  zoneName: string;
  zoneNumber: string;
  startTime: string;
  scheduledEndTime: string;
  elapsedMinutes: number;
  remainingMinutes?: number;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'EXPIRED';
  totalCost: number;
  ratePerHour: number;
}

interface FilterState {
  status: string;
  zone: string;
  timeRange: string;
  search: string;
}

export default function AdminSessionsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    zone: 'all',
    timeRange: 'today',
    search: ''
  });

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadSessions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, [session, authStatus, router]);

  useEffect(() => {
    applyFilters();
  }, [sessions, filters]);

  const loadSessions = async () => {
    try {
      // Mock data - in production this would be a real API call
      const mockSessions: SessionData[] = [
        {
          id: '1',
          licensePlate: 'ABC123',
          vehicleState: 'CA',
          vehicleNickname: 'Honda Civic',
          userEmail: 'user1@example.com',
          zoneName: 'Downtown Main St',
          zoneNumber: 'ST-101',
          startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          scheduledEndTime: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
          elapsedMinutes: 45,
          remainingMinutes: 75,
          status: 'ACTIVE',
          totalCost: 6.50,
          ratePerHour: 3.25
        },
        {
          id: '2',
          licensePlate: 'XYZ789',
          vehicleState: 'CA',
          userEmail: 'user2@example.com',
          zoneName: 'City Hall Garage',
          zoneNumber: 'PG-05',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          scheduledEndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          elapsedMinutes: 30,
          remainingMinutes: 30,
          status: 'ACTIVE',
          totalCost: 2.50,
          ratePerHour: 5.00
        },
        {
          id: '3',
          licensePlate: 'DEF456',
          vehicleState: 'NY',
          vehicleNickname: 'Tesla Model 3',
          userEmail: 'user3@example.com',
          zoneName: 'Shopping District',
          zoneNumber: 'ST-205',
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          scheduledEndTime: new Date(Date.now() + 165 * 60 * 1000).toISOString(),
          elapsedMinutes: 15,
          remainingMinutes: 165,
          status: 'PENDING',
          totalCost: 15.00,
          ratePerHour: 4.50
        },
        {
          id: '4',
          licensePlate: 'GHI789',
          vehicleState: 'TX',
          userEmail: 'user4@example.com',
          zoneName: 'Financial District',
          zoneNumber: 'ST-150',
          startTime: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          scheduledEndTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          elapsedMinutes: 180,
          status: 'EXPIRED',
          totalCost: 12.00,
          ratePerHour: 4.00
        },
        {
          id: '5',
          licensePlate: 'JKL012',
          vehicleState: 'FL',
          userEmail: 'user5@example.com',
          zoneName: 'Waterfront Park',
          zoneNumber: 'ST-301',
          startTime: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
          scheduledEndTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          elapsedMinutes: 120,
          status: 'COMPLETED',
          totalCost: 8.00,
          ratePerHour: 4.00
        }
      ];

      setSessions(mockSessions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    // Zone filter
    if (filters.zone !== 'all') {
      filtered = filtered.filter(session => session.zoneNumber === filters.zone);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.licensePlate.toLowerCase().includes(searchLower) ||
        session.userEmail.toLowerCase().includes(searchLower) ||
        session.zoneName.toLowerCase().includes(searchLower) ||
        session.zoneNumber.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSessions(filtered);
  };

  const handleExportCSV = () => {
    const headers = [
      'License Plate',
      'User Email',
      'Zone',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Status',
      'Total Cost',
      'Rate/Hour'
    ];

    const csvData = filteredSessions.map(session => [
      formatLicensePlate(session.licensePlate, session.vehicleState),
      session.userEmail,
      `${session.zoneNumber} - ${session.zoneName}`,
      formatDate(session.startTime),
      session.scheduledEndTime ? formatDate(session.scheduledEndTime) : '',
      session.elapsedMinutes,
      session.status,
      session.totalCost,
      session.ratePerHour
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `parking-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-700" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueZones = [...new Set(sessions.map(s => s.zoneNumber))];

  if (authStatus === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">Loading sessions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
            <p className="text-gray-800 mt-2">
              Last updated: {lastUpdated.toLocaleString()} • {filteredSessions.length} of {sessions.length} sessions
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadSessions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Search license, email, or zone..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="EXPIRED">Expired</option>
              </select>

              {/* Zone Filter */}
              <select
                value={filters.zone}
                onChange={(e) => setFilters(prev => ({ ...prev, zone: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Zones</option>
                {uniqueZones.map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>

              {/* Time Range Filter */}
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Car className="h-5 w-5 text-gray-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatLicensePlate(session.licensePlate, session.vehicleState)}
                            </div>
                            {session.vehicleNickname && (
                              <div className="text-sm text-gray-700">{session.vehicleNickname}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-gray-600 mr-3" />
                          <div className="text-sm text-gray-900">{session.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{session.zoneNumber}</div>
                            <div className="text-sm text-gray-700">{session.zoneName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(session.startTime, 'time')}
                        </div>
                        <div className="text-sm text-gray-700">
                          {formatDate(session.startTime, 'date')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.elapsedMinutes}m elapsed
                        </div>
                        {session.remainingMinutes !== undefined && (
                          <div className={`text-sm ${session.remainingMinutes < 15 ? 'text-red-500 font-medium' : 'text-gray-700'}`}>
                            {session.remainingMinutes > 0 ? `${session.remainingMinutes}m left` : 'Expired'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(session.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-600 mr-1" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(session.totalCost)}
                            </div>
                            <div className="text-xs text-gray-700">
                              {formatCurrency(session.ratePerHour)}/hr
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-800">No sessions found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}