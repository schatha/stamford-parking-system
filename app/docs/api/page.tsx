'use client';

import { useState } from 'react';
import { Copy, Code, Terminal, Key, Shield, Zap, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function APIDocumentationPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = async (text: string, endpointId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpointId);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const endpoints = [
    {
      id: 'active-sessions',
      method: 'GET',
      path: '/api/enforcement/active-sessions',
      title: 'Get Active Parking Sessions',
      description: 'Retrieve all currently active parking sessions for enforcement monitoring',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'zone_id', type: 'string', required: false, description: 'Filter by specific zone ID' },
        { name: 'license_plate', type: 'string', required: false, description: 'Search by license plate' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results (max 100)' },
        { name: 'offset', type: 'number', required: false, description: 'Pagination offset' }
      ],
      example: `{
  "success": true,
  "data": [
    {
      "session_id": "sess_123",
      "license_plate": "ABC123",
      "state": "CT",
      "zone": {
        "zone_number": "ST-101",
        "zone_name": "Downtown Main St",
        "address": "100 Main St, Stamford, CT"
      },
      "start_time": "2024-01-15T10:30:00Z",
      "scheduled_end_time": "2024-01-15T12:30:00Z",
      "status": "ACTIVE",
      "time_remaining_minutes": 45,
      "cost_paid": 7.50,
      "user": {
        "name": "John Doe",
        "phone": "+1234567890"
      }
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0
  }
}`
    },
    {
      id: 'expired-sessions',
      method: 'GET',
      path: '/api/enforcement/expired-sessions',
      title: 'Get Expired Sessions',
      description: 'Retrieve parking sessions that have exceeded their paid time',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'zone_id', type: 'string', required: false, description: 'Filter by specific zone ID' },
        { name: 'expired_since', type: 'number', required: false, description: 'Minutes since expiration (default: 0)' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results (max 100)' }
      ],
      example: `{
  "success": true,
  "data": [
    {
      "session_id": "sess_456",
      "license_plate": "XYZ789",
      "state": "NY",
      "zone": {
        "zone_number": "ST-205",
        "zone_name": "Financial District",
        "address": "200 Atlantic St, Stamford, CT"
      },
      "scheduled_end_time": "2024-01-15T11:00:00Z",
      "expired_at": "2024-01-15T11:00:00Z",
      "minutes_expired": 23,
      "violation_eligible": true,
      "user": {
        "name": "Jane Smith",
        "phone": "+1987654321"
      }
    }
  ]
}`
    },
    {
      id: 'validate-session',
      method: 'POST',
      path: '/api/enforcement/validate-session',
      title: 'Validate Parking Session',
      description: 'Check if a vehicle has a valid parking session for enforcement verification',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'license_plate', type: 'string', required: true, description: 'Vehicle license plate' },
        { name: 'state', type: 'string', required: true, description: 'Vehicle registration state' },
        { name: 'zone_number', type: 'string', required: true, description: 'Parking zone number' }
      ],
      requestBody: `{
  "license_plate": "ABC123",
  "state": "CT",
  "zone_number": "ST-101"
}`,
      example: `{
  "success": true,
  "valid_session": true,
  "session": {
    "session_id": "sess_123",
    "status": "ACTIVE",
    "start_time": "2024-01-15T10:30:00Z",
    "scheduled_end_time": "2024-01-15T12:30:00Z",
    "time_remaining_minutes": 45,
    "paid_amount": 7.50
  },
  "user": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john.doe@example.com"
  }
}`
    },
    {
      id: 'issue-violation',
      method: 'POST',
      path: '/api/enforcement/violations',
      title: 'Issue Parking Violation',
      description: 'Record a parking violation for enforcement tracking',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'license_plate', type: 'string', required: true, description: 'Vehicle license plate' },
        { name: 'state', type: 'string', required: true, description: 'Vehicle registration state' },
        { name: 'zone_number', type: 'string', required: true, description: 'Parking zone number' },
        { name: 'violation_type', type: 'string', required: true, description: 'Type of violation' },
        { name: 'officer_id', type: 'string', required: true, description: 'Enforcement officer ID' },
        { name: 'notes', type: 'string', required: false, description: 'Additional violation notes' }
      ],
      requestBody: `{
  "license_plate": "XYZ789",
  "state": "NY",
  "zone_number": "ST-205",
  "violation_type": "EXPIRED_SESSION",
  "officer_id": "OFF001",
  "notes": "Vehicle parked 23 minutes past expiration"
}`,
      example: `{
  "success": true,
  "violation": {
    "violation_id": "VIO_789",
    "license_plate": "XYZ789",
    "state": "NY",
    "zone": "ST-205",
    "violation_type": "EXPIRED_SESSION",
    "issued_at": "2024-01-15T11:23:00Z",
    "officer_id": "OFF001",
    "fine_amount": 25.00,
    "status": "ISSUED"
  }
}`
    },
    {
      id: 'zone-stats',
      method: 'GET',
      path: '/api/enforcement/zone-stats',
      title: 'Get Zone Statistics',
      description: 'Retrieve real-time statistics for parking zones',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'zone_ids', type: 'string[]', required: false, description: 'Specific zones to query' },
        { name: 'include_historical', type: 'boolean', required: false, description: 'Include historical data' }
      ],
      example: `{
  "success": true,
  "data": [
    {
      "zone_id": "zone_123",
      "zone_number": "ST-101",
      "zone_name": "Downtown Main St",
      "current_occupancy": 12,
      "estimated_capacity": 20,
      "occupancy_rate": 0.6,
      "active_sessions": 12,
      "expired_sessions": 2,
      "violations_today": 1,
      "revenue_today": 185.50,
      "peak_hours": ["12:00-14:00", "17:00-19:00"]
    }
  ]
}`
    },
    {
      id: 'notifications',
      method: 'GET',
      path: '/api/enforcement/notifications',
      title: 'Get Real-time Notifications',
      description: 'Retrieve real-time notifications for enforcement officers',
      auth: 'ENFORCEMENT',
      parameters: [
        { name: 'types', type: 'string[]', required: false, description: 'Notification types to filter' },
        { name: 'zones', type: 'string[]', required: false, description: 'Specific zones to monitor' },
        { name: 'priority', type: 'string', required: false, description: 'Minimum priority level' }
      ],
      example: `{
  "success": true,
  "notifications": [
    {
      "id": "notif_001",
      "type": "SESSION_EXPIRED",
      "priority": "HIGH",
      "zone": "ST-101",
      "license_plate": "ABC123",
      "message": "Vehicle ABC123 expired 15 minutes ago",
      "created_at": "2024-01-15T11:15:00Z",
      "acknowledged": false
    },
    {
      "id": "notif_002",
      "type": "ZONE_CAPACITY",
      "priority": "MEDIUM",
      "zone": "ST-205",
      "message": "Zone ST-205 at 90% capacity",
      "created_at": "2024-01-15T11:10:00Z",
      "acknowledged": false
    }
  ]
}`
    }
  ];

  const authTypes = {
    'ENFORCEMENT': {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: '🛡️',
      description: 'Requires enforcement officer authentication'
    },
    'ADMIN': {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: '👑',
      description: 'Requires admin authentication'
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enforcement API Documentation
              </h1>
              <p className="text-gray-800">
                Real-time parking enforcement integration endpoints
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview */}
        <div className="mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-blue-900 mb-2">
                    Real-time Enforcement Integration
                  </h2>
                  <p className="text-blue-800 mb-4">
                    Connect your enforcement systems to our real-time parking data for efficient violation management and revenue optimization.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Real-time session monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Automated violation detection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Zone occupancy analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authentication */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-gray-800" />
                <h2 className="text-xl font-semibold">Authentication</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium mb-2">API Key Authentication</p>
                  <p className="text-sm text-gray-800 mb-3">
                    Include your API key in the Authorization header:
                  </p>
                  <div className="bg-gray-900 rounded-md p-3">
                    <code className="text-green-400 text-sm">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-1">Contact for API Access</p>
                  <p className="text-sm text-yellow-700">
                    Enforcement API keys are issued to authorized city officials and enforcement agencies only.
                    Contact <strong>enforcement-api@stamfordparking.gov</strong> to request access.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Limits */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-800" />
                <h2 className="text-xl font-semibold">Rate Limits & Guidelines</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Rate Limits</h3>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• <strong>GET requests:</strong> 1000 per hour</li>
                    <li>• <strong>POST requests:</strong> 200 per hour</li>
                    <li>• <strong>Real-time endpoints:</strong> 5000 per hour</li>
                    <li>• <strong>Burst limit:</strong> 100 requests per minute</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-3">Best Practices</h3>
                  <ul className="space-y-2 text-sm text-gray-800">
                    <li>• Use webhooks for real-time updates</li>
                    <li>• Cache zone data locally</li>
                    <li>• Batch validation requests when possible</li>
                    <li>• Handle rate limit responses gracefully</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">API Endpoints</h2>

          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="overflow-hidden">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {endpoint.path}
                    </code>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium rounded border ${authTypes[endpoint.auth].color}`}>
                    {authTypes[endpoint.auth].icon} {endpoint.auth}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {endpoint.title}
                  </h3>
                  <p className="text-gray-800">
                    {endpoint.description}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Parameters */}
                {endpoint.parameters.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Required
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {endpoint.parameters.map((param, index) => (
                            <tr key={index}>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {param.name}
                                </code>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                                {param.type}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  param.required
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {param.required ? 'Required' : 'Optional'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-800">
                                {param.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {endpoint.requestBody && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Request Body</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(endpoint.requestBody!, `${endpoint.id}-request`)}
                      >
                        {copiedEndpoint === `${endpoint.id}-request` ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        <code>{endpoint.requestBody}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response Example */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Response Example</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(endpoint.example, `${endpoint.id}-response`)}
                    >
                      {copiedEndpoint === `${endpoint.id}-response` ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>{endpoint.example}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12">
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Terminal className="h-6 w-6 text-gray-800" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Need Help?
                </h3>
              </div>
              <p className="text-gray-800 mb-4">
                For technical support, implementation assistance, or to request additional endpoints:
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Technical Support:</strong> tech-support@stamfordparking.gov
                </p>
                <p>
                  <strong>API Access:</strong> enforcement-api@stamfordparking.gov
                </p>
                <p>
                  <strong>Emergency:</strong> (203) 977-4140
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}