'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  CreditCard,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency, formatDate, formatLicensePlate } from '@/lib/utils/formatting';

interface TransactionData {
  id: string;
  sessionId: string;
  licensePlate: string;
  vehicleState: string;
  userEmail: string;
  zoneName: string;
  zoneNumber: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  grossAmount: number;
  processingFee: number;
  netRevenue: number;
  ratePerHour: number;
  paymentMethod: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY';
  transactionDate: string;
  status: 'COMPLETED' | 'REFUNDED' | 'FAILED';
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  zone: string;
  paymentMethod: string;
  status: string;
  search: string;
}

interface RevenueStats {
  totalGross: number;
  totalFees: number;
  totalNet: number;
  transactionCount: number;
  avgTransaction: number;
  cityRevenue: number;
  processingFees: number;
}

export default function AdminTransactionsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    zone: 'all',
    paymentMethod: 'all',
    status: 'all',
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

    loadTransactions();
  }, [session, authStatus, router]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    try {
      // Mock data - in production this would be a real API call
      const mockTransactions: TransactionData[] = [
        {
          id: 'txn_001',
          sessionId: 'sess_001',
          licensePlate: 'ABC123',
          vehicleState: 'CA',
          userEmail: 'user1@example.com',
          zoneName: 'Downtown Main St',
          zoneNumber: 'ST-101',
          startTime: '2024-01-27T09:30:00Z',
          endTime: '2024-01-27T11:45:00Z',
          duration: 135, // 2h 15m
          grossAmount: 7.31,
          processingFee: 0.31,
          netRevenue: 7.00,
          ratePerHour: 3.25,
          paymentMethod: 'CARD',
          transactionDate: '2024-01-27T09:30:00Z',
          status: 'COMPLETED'
        },
        {
          id: 'txn_002',
          sessionId: 'sess_002',
          licensePlate: 'XYZ789',
          vehicleState: 'CA',
          userEmail: 'user2@example.com',
          zoneName: 'City Hall Garage',
          zoneNumber: 'PG-05',
          startTime: '2024-01-27T14:15:00Z',
          endTime: '2024-01-27T15:30:00Z',
          duration: 75, // 1h 15m
          grossAmount: 6.54,
          processingFee: 0.29,
          netRevenue: 6.25,
          ratePerHour: 5.00,
          paymentMethod: 'APPLE_PAY',
          transactionDate: '2024-01-27T14:15:00Z',
          status: 'COMPLETED'
        },
        {
          id: 'txn_003',
          sessionId: 'sess_003',
          licensePlate: 'DEF456',
          vehicleState: 'NY',
          userEmail: 'user3@example.com',
          zoneName: 'Shopping District',
          zoneNumber: 'ST-205',
          startTime: '2024-01-26T16:20:00Z',
          endTime: '2024-01-26T19:50:00Z',
          duration: 210, // 3h 30m
          grossAmount: 16.05,
          processingFee: 0.55,
          netRevenue: 15.50,
          ratePerHour: 4.50,
          paymentMethod: 'GOOGLE_PAY',
          transactionDate: '2024-01-26T16:20:00Z',
          status: 'COMPLETED'
        },
        {
          id: 'txn_004',
          sessionId: 'sess_004',
          licensePlate: 'GHI789',
          vehicleState: 'TX',
          userEmail: 'user4@example.com',
          zoneName: 'Financial District',
          zoneNumber: 'ST-150',
          startTime: '2024-01-26T10:00:00Z',
          endTime: '2024-01-26T13:00:00Z',
          duration: 180, // 3h
          grossAmount: 12.45,
          processingFee: 0.45,
          netRevenue: 12.00,
          ratePerHour: 4.00,
          paymentMethod: 'CARD',
          transactionDate: '2024-01-26T10:00:00Z',
          status: 'COMPLETED'
        },
        {
          id: 'txn_005',
          sessionId: 'sess_005',
          licensePlate: 'JKL012',
          vehicleState: 'FL',
          userEmail: 'user5@example.com',
          zoneName: 'Waterfront Park',
          zoneNumber: 'ST-301',
          startTime: '2024-01-25T12:30:00Z',
          endTime: '2024-01-25T14:30:00Z',
          duration: 120, // 2h
          grossAmount: 8.29,
          processingFee: 0.29,
          netRevenue: 8.00,
          ratePerHour: 4.00,
          paymentMethod: 'CARD',
          transactionDate: '2024-01-25T12:30:00Z',
          status: 'COMPLETED'
        },
        {
          id: 'txn_006',
          sessionId: 'sess_006',
          licensePlate: 'MNO345',
          vehicleState: 'WA',
          userEmail: 'user6@example.com',
          zoneName: 'Arts District',
          zoneNumber: 'ST-202',
          startTime: '2024-01-25T08:45:00Z',
          endTime: '2024-01-25T08:50:00Z',
          duration: 5, // 5m - failed transaction
          grossAmount: 0.00,
          processingFee: 0.00,
          netRevenue: 0.00,
          ratePerHour: 3.75,
          paymentMethod: 'CARD',
          transactionDate: '2024-01-25T08:45:00Z',
          status: 'FAILED'
        }
      ];

      setTransactions(mockTransactions);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.transactionDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.transactionDate) <= endDate);
    }

    // Zone filter
    if (filters.zone !== 'all') {
      filtered = filtered.filter(t => t.zoneNumber === filters.zone);
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(t => t.paymentMethod === filters.paymentMethod);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.licensePlate.toLowerCase().includes(searchLower) ||
        t.userEmail.toLowerCase().includes(searchLower) ||
        t.zoneName.toLowerCase().includes(searchLower) ||
        t.zoneNumber.toLowerCase().includes(searchLower) ||
        t.id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);

    // Calculate revenue stats
    const stats: RevenueStats = {
      totalGross: filtered.reduce((sum, t) => sum + t.grossAmount, 0),
      totalFees: filtered.reduce((sum, t) => sum + t.processingFee, 0),
      totalNet: filtered.reduce((sum, t) => sum + t.netRevenue, 0),
      transactionCount: filtered.length,
      avgTransaction: filtered.length > 0 ? filtered.reduce((sum, t) => sum + t.grossAmount, 0) / filtered.length : 0,
      cityRevenue: filtered.reduce((sum, t) => sum + t.netRevenue, 0),
      processingFees: filtered.reduce((sum, t) => sum + t.processingFee, 0)
    };

    setRevenueStats(stats);
  };

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'License Plate',
      'User Email',
      'Zone',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Gross Amount',
      'Processing Fee',
      'Net Revenue',
      'Rate/Hour',
      'Payment Method',
      'Status'
    ];

    const csvData = filteredTransactions.map(transaction => [
      transaction.id,
      formatLicensePlate(transaction.licensePlate, transaction.vehicleState),
      transaction.userEmail,
      `${transaction.zoneNumber} - ${transaction.zoneName}`,
      formatDate(transaction.startTime),
      formatDate(transaction.endTime),
      transaction.duration,
      transaction.grossAmount,
      transaction.processingFee,
      transaction.netRevenue,
      transaction.ratePerHour,
      transaction.paymentMethod,
      transaction.status
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
    a.download = `parking-transactions-${filters.dateFrom}-${filters.dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REFUNDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CARD':
        return <CreditCard className="h-4 w-4" />;
      case 'APPLE_PAY':
        return <div className="h-4 w-4 bg-black rounded text-white flex items-center justify-center text-xs font-bold">A</div>;
      case 'GOOGLE_PAY':
        return <div className="h-4 w-4 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">G</div>;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const uniqueZones = [...new Set(transactions.map(t => t.zoneNumber))];

  if (authStatus === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">
              Last updated: {lastUpdated.toLocaleString()} • {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Revenue Stats */}
        {revenueStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(revenueStats.totalGross)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">City Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(revenueStats.cityRevenue)}</p>
                    <p className="text-xs text-gray-500">After processing fees</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processing Fees</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(revenueStats.processingFees)}</p>
                    <p className="text-xs text-gray-500">Payment processing</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-purple-600">{revenueStats.transactionCount}</p>
                    <p className="text-xs text-gray-500">Avg: {formatCurrency(revenueStats.avgTransaction)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

              {/* Payment Method Filter */}
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="CARD">Card</option>
                <option value="APPLE_PAY">Apple Pay</option>
                <option value="GOOGLE_PAY">Google Pay</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle & User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zone & Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Breakdown
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.transactionDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatLicensePlate(transaction.licensePlate, transaction.vehicleState)}
                          </div>
                          <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.zoneNumber} - {transaction.zoneName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.floor(transaction.duration / 60)}h {transaction.duration % 60}m
                            @ {formatCurrency(transaction.ratePerHour)}/hr
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Gross: {formatCurrency(transaction.grossAmount)}
                          </div>
                          <div className="text-sm text-red-600">
                            Fee: -{formatCurrency(transaction.processingFee)}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            Net: {formatCurrency(transaction.netRevenue)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="ml-2 text-sm text-gray-900">
                            {transaction.paymentMethod.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}