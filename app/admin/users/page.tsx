'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Car,
  Clock,
  DollarSign,
  RefreshCw,
  Plus,
  UserX
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatDate, formatCurrency } from '@/lib/utils/formatting';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  stats: {
    totalSessions: number;
    totalSpent: number;
    vehiclesRegistered: number;
    activeSessions: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  // Mock user data for demo
  const mockUsers: AdminUser[] = [
    {
      id: '1',
      name: 'Demo User',
      email: 'user@demo.com',
      phone: '(203) 555-0123',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      stats: {
        totalSessions: 25,
        totalSpent: 127.50,
        vehiclesRegistered: 2,
        activeSessions: 1
      }
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@demo.com',
      phone: '(203) 555-0001',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      lastLoginAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      stats: {
        totalSessions: 0,
        totalSpent: 0,
        vehiclesRegistered: 0,
        activeSessions: 0
      }
    },
    {
      id: '3',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(203) 555-0456',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      stats: {
        totalSessions: 12,
        totalSpent: 68.25,
        vehiclesRegistered: 1,
        activeSessions: 0
      }
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(203) 555-0789',
      role: 'USER',
      status: 'SUSPENDED',
      emailVerified: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      stats: {
        totalSessions: 3,
        totalSpent: 15.75,
        vehiclesRegistered: 1,
        activeSessions: 0
      }
    },
    {
      id: '5',
      name: 'Michael Brown',
      email: 'mbrown@email.com',
      role: 'USER',
      status: 'INACTIVE',
      emailVerified: true,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      lastLoginAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      stats: {
        totalSessions: 8,
        totalSpent: 42.00,
        vehiclesRegistered: 1,
        activeSessions: 0
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

    loadUsers();
  }, [session, status, router]);

  useEffect(() => {
    // Apply filters
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const loadUsers = async () => {
    try {
      // In a real app, this would fetch from /api/admin/users
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN') => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'SUSPENDED': 'bg-red-100 text-red-800',
      'INACTIVE': 'bg-gray-100 text-gray-800'
    };

    const icons = {
      'ACTIVE': <CheckCircle className="h-3 w-3 mr-1" />,
      'SUSPENDED': <Ban className="h-3 w-3 mr-1" />,
      'INACTIVE': <XCircle className="h-3 w-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${classes[status as keyof typeof classes]}`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const classes = {
      'ADMIN': 'bg-purple-100 text-purple-800',
      'USER': 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${classes[role as keyof typeof classes]}`}>
        {role === 'ADMIN' && <Shield className="h-3 w-3 mr-1" />}
        {role === 'USER' && <Users className="h-3 w-3 mr-1" />}
        {role}
      </span>
    );
  };

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter(user => user.status === 'ACTIVE').length;
  const adminUsers = filteredUsers.filter(user => user.role === 'ADMIN').length;
  const totalRevenue = filteredUsers.reduce((sum, user) => sum + user.stats.totalSpent, 0);

  if (status === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadUsers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{activeUsers}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{adminUsers}</p>
              <p className="text-sm text-gray-600">Administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="search"
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search by name or email..."
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Administrators</option>
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
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            {(filters.search || filters.role || filters.status) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ search: '', role: '', status: '' })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Users ({filteredUsers.length})</h3>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {users.length === 0 ? 'No users registered yet.' : 'No users match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {user.name}
                                {!user.emailVerified && (
                                  <Mail className="h-4 w-4 text-yellow-500 ml-2" title="Email not verified" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.phone && (
                                <div className="text-xs text-gray-400">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                            {user.lastLoginAt && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Last login {formatDate(user.lastLoginAt)}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{user.stats.totalSessions} sessions</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              <span>{formatCurrency(user.stats.totalSpent)}</span>
                            </div>
                            <div className="flex items-center">
                              <Car className="h-3 w-3 mr-1" />
                              <span>{user.stats.vehiclesRegistered} vehicles</span>
                            </div>
                            <div className="flex items-center">
                              <span className={user.stats.activeSessions > 0 ? 'text-green-600 font-medium' : ''}>
                                {user.stats.activeSessions} active
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {user.status === 'ACTIVE' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, 'SUSPENDED')}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}

                            {user.role === 'USER' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRoleChange(user.id, 'ADMIN')}
                                className="text-purple-600 border-purple-300 hover:bg-purple-50"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}