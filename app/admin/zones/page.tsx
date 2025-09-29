'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  Save,
  RefreshCw,
  Map
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { formatCurrency } from '@/lib/utils/formatting';

interface ParkingZone {
  id: string;
  zoneNumber: string;
  zoneName: string;
  description: string;
  ratePerHour: number;
  maxDuration: number; // in hours
  operatingHours: {
    start: string;
    end: string;
  };
  operatingDays: string[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  restrictions: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentOccupancy: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
}

interface ZoneFormData {
  zoneNumber: string;
  zoneName: string;
  description: string;
  ratePerHour: number;
  maxDuration: number;
  operatingHours: {
    start: string;
    end: string;
  };
  operatingDays: string[];
  restrictions: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
}

const initialFormData: ZoneFormData = {
  zoneNumber: '',
  zoneName: '',
  description: '',
  ratePerHour: 3.00,
  maxDuration: 4,
  operatingHours: { start: '08:00', end: '20:00' },
  operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  restrictions: [],
  coordinates: { lat: 37.7749, lng: -122.4194 },
  capacity: 20,
  status: 'ACTIVE'
};

export default function AdminZonesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayLabels = {
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
    SUN: 'Sunday'
  };

  const restrictionOptions = [
    'No overnight parking',
    'Commercial vehicles prohibited',
    'Permit required',
    '2-hour maximum',
    'Loading zone restrictions',
    'Electric vehicles only',
    'Motorcycle parking only'
  ];

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

    loadZones();
  }, [session, authStatus, router]);

  const loadZones = async () => {
    try {
      // Mock data - in production this would be a real API call
      const mockZones: ParkingZone[] = [
        {
          id: '1',
          zoneNumber: 'ST-101',
          zoneName: 'Downtown Main St',
          description: 'Main street commercial district parking',
          ratePerHour: 3.25,
          maxDuration: 4,
          operatingHours: { start: '08:00', end: '20:00' },
          operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          restrictions: ['No overnight parking', '2-hour maximum during peak hours'],
          coordinates: { lat: 37.7749, lng: -122.4194 },
          capacity: 45,
          currentOccupancy: 32,
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-25T14:30:00Z'
        },
        {
          id: '2',
          zoneNumber: 'PG-05',
          zoneName: 'City Hall Garage',
          description: 'Multi-level parking garage near city hall',
          ratePerHour: 5.00,
          maxDuration: 8,
          operatingHours: { start: '06:00', end: '22:00' },
          operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          restrictions: ['Permit required after 18:00'],
          coordinates: { lat: 37.7849, lng: -122.4094 },
          capacity: 120,
          currentOccupancy: 87,
          status: 'ACTIVE',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z'
        },
        {
          id: '3',
          zoneNumber: 'ST-205',
          zoneName: 'Shopping District',
          description: 'Retail and shopping area parking',
          ratePerHour: 4.50,
          maxDuration: 6,
          operatingHours: { start: '09:00', end: '21:00' },
          operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          restrictions: ['Commercial vehicles prohibited'],
          coordinates: { lat: 37.7649, lng: -122.4294 },
          capacity: 80,
          currentOccupancy: 56,
          status: 'ACTIVE',
          createdAt: '2024-01-12T11:00:00Z',
          updatedAt: '2024-01-22T10:15:00Z'
        },
        {
          id: '4',
          zoneNumber: 'ST-150',
          zoneName: 'Financial District',
          description: 'Business district parking for office workers',
          ratePerHour: 4.00,
          maxDuration: 10,
          operatingHours: { start: '06:00', end: '19:00' },
          operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
          restrictions: ['No overnight parking', 'Permit required'],
          coordinates: { lat: 37.7949, lng: -122.3994 },
          capacity: 60,
          currentOccupancy: 45,
          status: 'ACTIVE',
          createdAt: '2024-01-08T08:00:00Z',
          updatedAt: '2024-01-18T12:45:00Z'
        },
        {
          id: '5',
          zoneNumber: 'ST-301',
          zoneName: 'Waterfront Park',
          description: 'Recreational area parking near waterfront',
          ratePerHour: 4.00,
          maxDuration: 8,
          operatingHours: { start: '07:00', end: '19:00' },
          operatingDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
          restrictions: ['Loading zone restrictions'],
          coordinates: { lat: 37.7549, lng: -122.4394 },
          capacity: 35,
          currentOccupancy: 12,
          status: 'MAINTENANCE',
          createdAt: '2024-01-05T07:00:00Z',
          updatedAt: '2024-01-26T09:30:00Z'
        }
      ];

      setZones(mockZones);
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateZone = () => {
    setFormData(initialFormData);
    setEditingZone(null);
    setShowForm(true);
  };

  const handleEditZone = (zone: ParkingZone) => {
    setFormData({
      zoneNumber: zone.zoneNumber,
      zoneName: zone.zoneName,
      description: zone.description,
      ratePerHour: zone.ratePerHour,
      maxDuration: zone.maxDuration,
      operatingHours: zone.operatingHours,
      operatingDays: zone.operatingDays,
      restrictions: zone.restrictions,
      coordinates: zone.coordinates,
      capacity: zone.capacity,
      status: zone.status
    });
    setEditingZone(zone.id);
    setShowForm(true);
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
      return;
    }

    try {
      // In production, this would be an API call
      setZones(prev => prev.filter(zone => zone.id !== zoneId));
    } catch (error) {
      console.error('Failed to delete zone:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingZone) {
        // Update existing zone
        setZones(prev => prev.map(zone =>
          zone.id === editingZone
            ? {
                ...zone,
                ...formData,
                updatedAt: new Date().toISOString()
              }
            : zone
        ));
      } else {
        // Create new zone
        const newZone: ParkingZone = {
          id: Date.now().toString(),
          ...formData,
          currentOccupancy: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setZones(prev => [...prev, newZone]);
      }

      setShowForm(false);
      setEditingZone(null);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to save zone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const handleRestrictionToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      restrictions: prev.restrictions.includes(restriction)
        ? prev.restrictions.filter(r => r !== restriction)
        : [...prev.restrictions, restriction]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (authStatus === 'loading' || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading zones...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Zone Management</h1>
            <p className="text-gray-600 mt-2">
              Manage parking zones, rates, and restrictions • {zones.length} total zones
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={loadZones}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateZone}>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </div>

        {/* Zone Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowForm(false)}></div>
              </div>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingZone ? 'Edit Zone' : 'Create New Zone'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone Number</label>
                      <input
                        type="text"
                        value={formData.zoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, zoneNumber: e.target.value }))}
                        placeholder="e.g., ST-101"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
                      <input
                        type="text"
                        value={formData.zoneName}
                        onChange={(e) => setFormData(prev => ({ ...prev, zoneName: e.target.value }))}
                        placeholder="e.g., Downtown Main St"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the zone"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Hour ($)</label>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={formData.ratePerHour}
                        onChange={(e) => setFormData(prev => ({ ...prev, ratePerHour: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Duration (hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.maxDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours Start</label>
                      <input
                        type="time"
                        value={formData.operatingHours.start}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours End</label>
                      <input
                        type="time"
                        value={formData.operatingHours.end}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          operatingHours: { ...prev.operatingHours, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operating Days</label>
                    <div className="grid grid-cols-7 gap-2">
                      {Object.entries(dayLabels).map(([day, label]) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                            formData.operatingDays.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {label.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Restrictions</label>
                    <div className="space-y-2">
                      {restrictionOptions.map(restriction => (
                        <label key={restriction} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.restrictions.includes(restriction)}
                            onChange={() => handleRestrictionToggle(restriction)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{restriction}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingZone ? 'Update Zone' : 'Create Zone'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Zones Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {zones.map((zone) => (
            <Card key={zone.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      {zone.zoneNumber} - {zone.zoneName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{zone.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditZone(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteZone(zone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status and Occupancy */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </span>
                    <div className={`text-sm font-medium ${getOccupancyColor(zone.currentOccupancy, zone.capacity)}`}>
                      {zone.currentOccupancy}/{zone.capacity} occupied
                    </div>
                  </div>

                  {/* Rate and Duration */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(zone.ratePerHour)}/hour
                    </div>
                    <div className="flex items-center text-blue-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {zone.maxDuration}h max
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="text-sm text-gray-600">
                    <strong>Hours:</strong> {zone.operatingHours.start} - {zone.operatingHours.end}
                  </div>

                  {/* Operating Days */}
                  <div className="text-sm text-gray-600">
                    <strong>Days:</strong> {zone.operatingDays.join(', ')}
                  </div>

                  {/* Restrictions */}
                  {zone.restrictions.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        <strong>Restrictions:</strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {zone.restrictions.map((restriction, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Last updated: {new Date(zone.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {zones.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No parking zones configured</p>
              <Button onClick={handleCreateZone}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Zone
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Map Placeholder */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Map className="h-5 w-5 mr-2" />
              Zone Map View
            </h3>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Map className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Interactive map would be displayed here</p>
                <p className="text-sm">Integration with Google Maps or similar mapping service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}