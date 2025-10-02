'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Calendar,
  ArrowLeft,
  Download,
  RefreshCw,
  Target,
  Award,
  Info,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ParkingSessionWithDetails } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/formatting';
import { calculateParkingAnalytics, generateInsights, ParkingAnalytics } from '@/lib/utils/analytics';

export default function ParkingAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<ParkingSessionWithDetails[]>([]);
  const [analytics, setAnalytics] = useState<ParkingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year' | 'all'>('6months');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadAnalytics();
  }, [session, status, router, timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sessions?limit=1000`);
      if (response.ok) {
        const data = await response.json();
        const allSessions = data.data || [];

        // Filter sessions based on time range
        const cutoffDate = getCutoffDate(timeRange);
        const filteredSessions = allSessions.filter((s: ParkingSessionWithDetails) =>
          new Date(s.startTime) >= cutoffDate
        );

        setSessions(filteredSessions);
        const analyticsData = calculateParkingAnalytics(filteredSessions);
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCutoffDate = (range: typeof timeRange): Date => {
    const now = new Date();
    switch (range) {
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      case '1year':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      default:
        return new Date(2020, 0, 1); // Very old date for "all"
    }
  };

  const handleExportData = async () => {
    if (!analytics) return;

    const csvContent = [
      'Date,Zone,Duration (hours),Cost,Status',
      ...sessions.map(s =>
        `${formatDate(s.startTime)},${s.zone.zoneName},${s.durationHours},${s.totalCost},${s.status}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `parking-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics || sessions.length === 0) {
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
              <h1 className="text-2xl font-bold text-gray-900">
                Parking Analytics
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center p-8">
              <BarChart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Parking History
              </h3>
              <p className="text-gray-800 mb-6">
                Start parking to see detailed analytics and insights about your parking patterns.
              </p>
              <Link href="/park">
                <Button className="flex items-center mx-auto">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Parking
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const insights = generateInsights(analytics);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
                <h1 className="text-2xl font-bold text-gray-900">
                  Parking Analytics
                </h1>
                <p className="text-sm text-gray-800">
                  Your parking patterns and spending insights
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              >
                <option value="3months">Last 3 months</option>
                <option value="6months">Last 6 months</option>
                <option value="1year">Last year</option>
                <option value="all">All time</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={loadAnalytics}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.totalSpent)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalSessions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.totalHours.toFixed(1)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Avg per Session</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics.averageCostPerSession)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Your Parking Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <Card
                  key={index}
                  className={`${
                    insight.type === 'success' ? 'border-green-200 bg-green-50' :
                    insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    insight.type === 'tip' ? 'border-purple-200 bg-purple-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{insight.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {insight.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Spending Chart */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Monthly Spending Trend</h3>
              <p className="text-sm text-gray-800">
                Your parking costs over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'amount' ? formatCurrency(value as number) : value,
                      name === 'amount' ? 'Spent' : 'Sessions'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Used Zones */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Favorite Parking Zones</h3>
              <p className="text-sm text-gray-800">
                Where you park most often
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.mostUsedZones.slice(0, 5).map((zone, index) => (
                  <div key={zone.zoneId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">
                          {zone.zoneNumber}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 ml-5">
                        {zone.zoneName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {zone.sessionsCount} sessions
                      </p>
                      <p className="text-sm text-gray-800">
                        {formatCurrency(zone.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Pattern */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Weekly Parking Pattern</h3>
              <p className="text-sm text-gray-800">
                Which days you park most
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyPattern}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dayOfWeek" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'totalSpent' ? formatCurrency(value as number) : value,
                      name === 'totalSpent' ? 'Spent' :
                      name === 'avgDuration' ? 'Avg Duration (h)' : 'Sessions'
                    ]}
                  />
                  <Bar dataKey="sessions" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hourly Pattern */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Parking Times</h3>
              <p className="text-sm text-gray-800">
                When you typically start parking
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.hourlyPattern.filter(h => h.sessions > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(hour) => `${hour}:00`}
                    formatter={(value) => [value, 'Sessions']}
                  />
                  <Bar dataKey="sessions" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cost Savings */}
        {analytics.costSavings && analytics.costSavings.comparedToDaily > 0 && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-green-900 mb-1">
                    💰 Smart Parking Savings
                  </h3>
                  <p className="text-green-700">
                    {analytics.costSavings.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}