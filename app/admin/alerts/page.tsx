'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Filter,
  Search,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDate } from '@/lib/utils/formatting';

interface SystemAlert {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  source: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export default function SystemAlertsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    severity: '',
    status: '',
  });

  // Mock alert data for demo
  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'ERROR',
      title: 'Payment Processing Error',
      message: 'Multiple payment failures detected for Stripe integration',
      source: 'Payment System',
      severity: 'HIGH',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        failedPayments: 3,
        affectedUsers: ['user1@demo.com', 'user2@demo.com']
      }
    },
    {
      id: '2',
      type: 'WARNING',
      title: 'High Session Volume',
      message: 'Parking session creation rate is 150% above normal',
      source: 'Session Management',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      metadata: {
        currentRate: '15 sessions/min',
        normalRate: '10 sessions/min'
      }
    },
    {
      id: '3',
      type: 'INFO',
      title: 'Database Maintenance Scheduled',
      message: 'Routine database maintenance scheduled for tonight at 2 AM EST',
      source: 'System Admin',
      severity: 'LOW',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      metadata: {
        estimatedDuration: '30 minutes',
        affectedServices: ['API', 'Dashboard']
      }
    },
    {
      id: '4',
      type: 'ERROR',
      title: 'Zone A1 Meter Offline',
      message: 'Parking meter in Zone A1 (Downtown Main Street) is not responding',
      source: 'Hardware Monitor',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      metadata: {
        zoneId: 'A1',
        lastPing: '2025-09-29T18:20:00Z',
        affectedSpaces: 12
      }
    },
    {
      id: '5',
      type: 'SUCCESS',
      title: 'System Backup Completed',
      message: 'Daily system backup completed successfully',
      source: 'Backup Service',
      severity: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      metadata: {
        backupSize: '2.3 GB',
        duration: '15 minutes'
      }
    }
  ];

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

    loadAlerts();
  }, [session, status, router]);

  useEffect(() => {
    // Apply filters
    let filtered = alerts;

    if (filters.search) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.source.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(alert => alert.type === filters.type);
    }

    if (filters.severity) {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters.status) {
      filtered = filtered.filter(alert => alert.status === filters.status);
    }

    setFilteredAlerts(filtered);
  }, [alerts, filters]);

  const loadAlerts = async () => {
    try {
      // In a real app, this would fetch from /api/admin/alerts
      setAlerts(mockAlerts);
      setFilteredAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'ACKNOWLEDGED' as const, updatedAt: new Date().toISOString() }
        : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'RESOLVED' as const, updatedAt: new Date().toISOString() }
        : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'ERROR': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'INFO': return <Info className="h-5 w-5 text-blue-500" />;
      case 'SUCCESS': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string, status: string) => {
    if (status === 'RESOLVED') return 'border-l-gray-400 bg-gray-50';

    switch (severity) {
      case 'CRITICAL': return 'border-l-red-600 bg-red-50';
      case 'HIGH': return 'border-l-red-400 bg-red-50';
      case 'MEDIUM': return 'border-l-yellow-400 bg-yellow-50';
      case 'LOW': return 'border-l-blue-400 bg-blue-50';
      default: return 'border-l-gray-400 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      'ACTIVE': 'bg-red-100 text-red-800',
      'ACKNOWLEDGED': 'bg-yellow-100 text-yellow-800',
      'RESOLVED': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${classes[status as keyof typeof classes]}`}>
        {status}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const classes = {
      'CRITICAL': 'bg-red-200 text-red-900',
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-yellow-100 text-yellow-800',
      'LOW': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${classes[severity as keyof typeof classes]}`}>
        {severity}
      </span>
    );
  };

  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'ACTIVE').length;
  const criticalAlerts = filteredAlerts.filter(alert => alert.severity === 'CRITICAL').length;

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading system alerts...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage system alerts and notifications
            </p>
          </div>
          <Button onClick={loadAlerts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{filteredAlerts.length}</p>
              <p className="text-sm text-gray-600">Total Alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">{activeAlerts}</p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-800" />
              </div>
              <p className="text-2xl font-bold text-red-900">{criticalAlerts}</p>
              <p className="text-sm text-gray-600">Critical</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                {filteredAlerts.filter(a => a.status === 'RESOLVED').length}
              </p>
              <p className="text-sm text-gray-600">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                id="search"
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search alerts..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="ERROR">Error</option>
                  <option value="WARNING">Warning</option>
                  <option value="INFO">Info</option>
                  <option value="SUCCESS">Success</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            </div>

            {(filters.search || filters.type || filters.severity || filters.status) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ search: '', type: '', severity: '', status: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center p-12">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {alerts.length === 0 ? 'No system alerts' : 'No alerts match your filters'}
              </h3>
              <p className="text-gray-600">
                {alerts.length === 0
                  ? 'All systems are operating normally.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.severity, alert.status)}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          {getStatusBadge(alert.status)}
                        </div>

                        <p className="text-gray-700 mb-2">{alert.message}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{formatDate(alert.createdAt)}</span>
                          </div>
                          <span>•</span>
                          <span>{alert.source}</span>
                        </div>

                        {alert.metadata && (
                          <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                            <strong>Details:</strong> {JSON.stringify(alert.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {alert.status === 'ACTIVE' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </>
                      )}

                      {alert.status === 'ACKNOWLEDGED' && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}