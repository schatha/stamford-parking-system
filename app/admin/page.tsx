'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Car,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/formatting';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { UsageChart } from '@/components/admin/UsageChart';

interface DashboardStats {
  totalRevenue: number;
  revenueToday: number;
  revenueGrowth: number;
  activeSessions: number;
  sessionsToday: number;
  sessionsGrowth: number;
  totalUsers: number;
  newUsersToday: number;
  userGrowth: number;
  averageSessionDuration: number;
  peakHours: string;
  topZones: Array<{
    id: string;
    zoneNumber: string;
    zoneName: string;
    sessionsToday: number;
    revenueToday: number;
  }>;
  alertsCount: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadDashboardStats();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, [session, status, router]);

  const loadDashboardStats = async () => {
    try {
      // Mock data for demo - in production this would be a real API call
      const mockStats: DashboardStats = {
        totalRevenue: 45280.50,
        revenueToday: 1250.75,
        revenueGrowth: 12.5,
        activeSessions: 87,
        sessionsToday: 234,
        sessionsGrowth: 8.2,
        totalUsers: 1543,
        newUsersToday: 12,
        userGrowth: 15.3,
        averageSessionDuration: 2.4,
        peakHours: '2-4 PM',
        topZones: [
          { id: '1', zoneNumber: 'ST-101', zoneName: 'Downtown Main St', sessionsToday: 45, revenueToday: 285.50 },
          { id: '2', zoneNumber: 'PG-05', zoneName: 'City Hall Garage', sessionsToday: 38, revenueToday: 190.00 },
          { id: '3', zoneNumber: 'ST-205', zoneName: 'Shopping District', sessionsToday: 32, revenueToday: 240.75 },
          { id: '4', zoneNumber: 'ST-150', zoneName: 'Financial District', sessionsToday: 28, revenueToday: 175.25 }
        ],
        alertsCount: 2,
        systemHealth: 'good'
      };

      setStats(mockStats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      // Mock CSV export
      const csvContent = `Date,Revenue,Sessions,Users\n${new Date().toISOString().split('T')[0]},${stats?.revenueToday},${stats?.sessionsToday},${stats?.newUsersToday}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `daily-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-800">Failed to load dashboard data</p>
          <Button onClick={loadDashboardStats} className="mt-4">
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    subtitle,
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200'
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-700 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          {trend && trendValue && (
            <div className="mt-4 flex items-center">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-700 ml-1">vs yesterday</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-800 mt-2">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadDashboardStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {stats.alertsCount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900">
                    {stats.alertsCount} System Alert{stats.alertsCount !== 1 ? 's' : ''}
                  </h4>
                  <p className="text-sm text-orange-800">
                    There are issues that require your attention.
                  </p>
                </div>
                <Link href="/admin/alerts">
                  <Button size="sm" variant="outline">
                    View Alerts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(stats.revenueGrowth).toFixed(1)}%`}
            subtitle={`${formatCurrency(stats.revenueToday)} today`}
            color="green"
          />

          <MetricCard
            title="Active Sessions"
            value={stats.activeSessions}
            icon={Activity}
            trend={stats.sessionsGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(stats.sessionsGrowth).toFixed(1)}%`}
            subtitle={`${stats.sessionsToday} sessions today`}
            color="blue"
          />

          <MetricCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            trend={stats.userGrowth >= 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(stats.userGrowth).toFixed(1)}%`}
            subtitle={`${stats.newUsersToday} new today`}
            color="purple"
          />

          <MetricCard
            title="Avg. Session"
            value={`${stats.averageSessionDuration}h`}
            icon={Clock}
            subtitle={`Peak: ${stats.peakHours}`}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Revenue Trends (Last 30 Days)</h3>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Usage Analytics (Last 7 Days)</h3>
            </CardHeader>
            <CardContent>
              <UsageChart />
            </CardContent>
          </Card>
        </div>

        {/* Top Zones & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Top Performing Zones</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Zone {zone.zoneNumber}
                        </p>
                        <p className="text-sm text-gray-800">{zone.zoneName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(zone.revenueToday)}
                      </p>
                      <p className="text-xs text-gray-700">
                        {zone.sessionsToday} sessions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/admin/zones">
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Zones
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/sessions" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-sm">Active Sessions</span>
                  </Button>
                </Link>

                <Link href="/admin/transactions" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <DollarSign className="h-6 w-6 mb-2" />
                    <span className="text-sm">Transactions</span>
                  </Button>
                </Link>

                <Link href="/admin/zones" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <MapPin className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Zones</span>
                  </Button>
                </Link>

                <Link href="/admin/users" className="block">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">User Management</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}