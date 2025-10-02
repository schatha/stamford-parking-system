'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Car,
  Radio,
  RefreshCw,
  Zap,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/formatting';
import Link from 'next/link';

interface MockSession {
  id: string;
  licensePlate: string;
  state: string;
  zoneNumber: string;
  zoneName: string;
  startTime: Date;
  endTime: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'EXPIRING';
  timeRemaining: number;
  paidAmount: number;
  violationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  userPhone?: string;
}

interface MockNotification {
  id: string;
  type: 'EXPIRED' | 'EXPIRING' | 'VIOLATION' | 'ZONE_FULL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  zone: string;
  licensePlate?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export default function EnforcementDemo() {
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    activeSessions: 0,
    expiredSessions: 0,
    violations: 0,
    revenue: 0
  });

  useEffect(() => {
    // Initialize demo data
    initializeDemoData();

    // Simulate real-time connection
    const connectionTimer = setTimeout(() => {
      setIsConnected(true);
    }, 1500);

    // Start real-time updates
    const updateTimer = setInterval(updateDemoData, 3000);

    return () => {
      clearTimeout(connectionTimer);
      clearInterval(updateTimer);
    };
  }, []);

  const initializeDemoData = () => {
    const mockSessions: MockSession[] = [
      {
        id: 'sess_001',
        licensePlate: 'ABC123',
        state: 'CT',
        zoneNumber: 'ST-101',
        zoneName: 'Downtown Main St',
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        endTime: new Date(Date.now() + 15 * 60 * 1000),
        status: 'EXPIRING',
        timeRemaining: 15,
        paidAmount: 7.50,
        violationRisk: 'MEDIUM',
        userPhone: '+1234567890'
      },
      {
        id: 'sess_002',
        licensePlate: 'XYZ789',
        state: 'NY',
        zoneNumber: 'ST-205',
        zoneName: 'Financial District',
        startTime: new Date(Date.now() - 125 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 60 * 1000),
        status: 'EXPIRED',
        timeRemaining: -5,
        paidAmount: 12.00,
        violationRisk: 'HIGH',
        userPhone: '+1987654321'
      },
      {
        id: 'sess_003',
        licensePlate: 'DEF456',
        state: 'CT',
        zoneNumber: 'PG-05',
        zoneName: 'City Hall Garage',
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        endTime: new Date(Date.now() + 90 * 60 * 1000),
        status: 'ACTIVE',
        timeRemaining: 90,
        paidAmount: 15.00,
        violationRisk: 'LOW'
      }
    ];

    const mockNotifications: MockNotification[] = [
      {
        id: 'notif_001',
        type: 'EXPIRED',
        priority: 'HIGH',
        message: 'Vehicle XYZ789 expired 5 minutes ago in Financial District',
        zone: 'ST-205',
        licensePlate: 'XYZ789',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        acknowledged: false
      },
      {
        id: 'notif_002',
        type: 'EXPIRING',
        priority: 'MEDIUM',
        message: 'Vehicle ABC123 expires in 15 minutes on Main St',
        zone: 'ST-101',
        licensePlate: 'ABC123',
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        acknowledged: false
      }
    ];

    setSessions(mockSessions);
    setNotifications(mockNotifications);
    updateStats(mockSessions);
  };

  const updateDemoData = () => {
    setSessions(prevSessions => {
      const updated = prevSessions.map(session => {
        const newTimeRemaining = Math.floor((session.endTime.getTime() - Date.now()) / (1000 * 60));

        let newStatus = session.status;
        let newRisk = session.violationRisk;

        if (newTimeRemaining <= 0) {
          newStatus = 'EXPIRED';
          newRisk = 'HIGH';
        } else if (newTimeRemaining <= 10) {
          newStatus = 'EXPIRING';
          newRisk = 'MEDIUM';
        }

        return {
          ...session,
          timeRemaining: newTimeRemaining,
          status: newStatus,
          violationRisk: newRisk
        };
      });

      updateStats(updated);
      setLastUpdate(new Date());

      // Generate new notifications for newly expired sessions
      const newlyExpired = updated.filter(s =>
        s.status === 'EXPIRED' &&
        !notifications.some(n => n.licensePlate === s.licensePlate && n.type === 'EXPIRED')
      );

      if (newlyExpired.length > 0) {
        const newNotifications = newlyExpired.map(session => ({
          id: `notif_${Date.now()}_${session.id}`,
          type: 'EXPIRED' as const,
          priority: 'HIGH' as const,
          message: `Vehicle ${session.licensePlate} just expired in ${session.zoneName}`,
          zone: session.zoneNumber,
          licensePlate: session.licensePlate,
          timestamp: new Date(),
          acknowledged: false
        }));

        setNotifications(prev => [...newNotifications, ...prev].slice(0, 10));
      }

      return updated;
    });
  };

  const updateStats = (sessionList: MockSession[]) => {
    setStats({
      activeSessions: sessionList.filter(s => s.status === 'ACTIVE' || s.status === 'EXPIRING').length,
      expiredSessions: sessionList.filter(s => s.status === 'EXPIRED').length,
      violations: sessionList.filter(s => s.violationRisk === 'HIGH').length,
      revenue: sessionList.reduce((sum, s) => sum + s.paidAmount, 0)
    });
  };

  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, acknowledged: true } : n
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'EXPIRING':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-800" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🚨 Live Enforcement Dashboard
                </h1>
                <p className="text-gray-800">
                  Real-time parking enforcement data demo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <Link href="/docs/api">
                <Button size="sm" variant="outline">
                  View API Docs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Demo Notice */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  🎭 Live Demo - Real-time Data Simulation
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  This demo shows how enforcement officers can access real-time parking data through our API.
                  Data updates every 3 seconds with simulated parking sessions and violations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeSessions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Expired Sessions</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.expiredSessions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">High Risk Violations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.violations}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Revenue Today</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.revenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-800" />
                    <h3 className="text-lg font-medium">Live Parking Sessions</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-700">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        session.status === 'EXPIRED' ? 'border-red-500 bg-red-50' :
                        session.status === 'EXPIRING' ? 'border-yellow-500 bg-yellow-50' :
                        'border-green-500 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(session.status)}
                            <div>
                              <span className="font-medium text-gray-900">
                                {session.licensePlate} ({session.state})
                              </span>
                              <div className="text-sm text-gray-800">
                                {session.zoneName} • Zone {session.zoneNumber}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-700">Time Remaining:</span>
                              <span className={`ml-2 font-medium ${
                                session.timeRemaining <= 0 ? 'text-red-600' :
                                session.timeRemaining <= 15 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {session.timeRemaining <= 0
                                  ? `${Math.abs(session.timeRemaining)} min overdue`
                                  : `${session.timeRemaining} min left`
                                }
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-700">Paid:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {formatCurrency(session.paidAmount)}
                              </span>
                            </div>
                          </div>

                          {session.userPhone && (
                            <div className="mt-2 text-sm text-gray-800">
                              Contact: {session.userPhone}
                            </div>
                          )}
                        </div>

                        <div className={`px-2 py-1 text-xs font-medium rounded border ${getRiskColor(session.violationRisk)}`}>
                          {session.violationRisk} RISK
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-gray-800" />
                    <h3 className="text-lg font-medium">Live Alerts</h3>
                  </div>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                    {notifications.filter(n => !n.acknowledged).length} New
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 6).map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </div>
                        <span className="text-xs text-gray-700">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <p className={`text-sm mb-2 ${
                        notification.acknowledged ? 'text-gray-800' : 'text-gray-900'
                      }`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">
                          Zone {notification.zone}
                        </span>
                        {!notification.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeNotification(notification.id)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                    <RefreshCw className="h-4 w-4" />
                    <span>Auto-refreshing every 3 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Integration Info */}
            <Card className="mt-6">
              <CardHeader>
                <h3 className="text-lg font-medium">🔌 Integration Ready</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time session monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automated violation detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Mobile enforcement apps</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>License plate validation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Historical reporting</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link href="/docs/api">
                    <Button size="sm" className="w-full">
                      View Integration Docs
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}