'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CheckCircle, XCircle, AlertCircle, Clock, Database, CreditCard, Server, Globe, Wifi } from 'lucide-react';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; responseTime?: number };
    stripe: { status: string };
    redis: { status: string };
    external: { status: string };
  };
  version: string;
  environment: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  deployment: {
    platform: string;
    region: string;
    url: string;
  };
}

export function StatusDashboard() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setError(null);
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'unhealthy':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Unable to Load System Status
            </h2>
            <p className="text-red-600 mb-4">
              {error}
            </p>
            <button
              onClick={fetchHealth}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Loading System Status...
            </h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-800">
            Real-time monitoring of Stamford Parking System
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(health.status)}`}>
            {getStatusIcon(health.status)}
            <span className="ml-2 capitalize">{health.status}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Database</h3>
                <p className="text-sm text-gray-800">PostgreSQL</p>
              </div>
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-500 mr-3" />
                {getStatusIcon(health.checks.database.status)}
              </div>
            </div>
            {health.checks.database.responseTime && (
              <p className="text-sm text-gray-700 mt-2">
                Response: {health.checks.database.responseTime}ms
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Payments</h3>
                <p className="text-sm text-gray-800">Stripe</p>
              </div>
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-green-500 mr-3" />
                {getStatusIcon(health.checks.stripe.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Application</h3>
                <p className="text-sm text-gray-800">Next.js</p>
              </div>
              <div className="flex items-center">
                <Server className="h-8 w-8 text-purple-500 mr-3" />
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Version: {health.version}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Platform</h3>
                <p className="text-sm text-gray-800 capitalize">{health.deployment.platform}</p>
              </div>
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-indigo-500 mr-3" />
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">
              Region: {health.deployment.region}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">System Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-800">Uptime</span>
                <span className="font-medium">{formatUptime(health.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">Memory Usage</span>
                <span className="font-medium">{formatBytes(health.memory.heapUsed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">Total Memory</span>
                <span className="font-medium">{formatBytes(health.memory.heapTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">Environment</span>
                <span className="font-medium capitalize">{health.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-800">Platform</span>
                <span className="font-medium capitalize">{health.deployment.platform}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                User Dashboard
              </a>
              <a
                href="/admin"
                className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                Admin Panel
              </a>
              <a
                href="/api/health"
                className="block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Raw Health Data
              </a>
              <button
                onClick={fetchHealth}
                className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Wifi className="inline h-4 w-4 mr-2" />
                Refresh Status
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Component Status Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Component Status Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(health.checks).map(([component, status]) => (
              <div key={component} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium capitalize">{component}</span>
                  {component === 'database' && status.responseTime && (
                    <p className="text-xs text-gray-700">{status.responseTime}ms</p>
                  )}
                </div>
                {getStatusIcon(status.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-700">
        <p>
          Stamford Parking System • Status page updates every 30 seconds
        </p>
        <p className="mt-1">
          Last system restart: {new Date(Date.now() - health.uptime * 1000).toLocaleString()}
        </p>
        <p className="mt-1">
          <span className="text-gray-600">Deployment URL:</span> {health.deployment.url}
        </p>
      </div>
    </div>
  );
}