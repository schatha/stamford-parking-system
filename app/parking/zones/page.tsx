'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, MapPin, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ParkingZone } from '@/types';
import { formatCurrency, formatZoneDisplay } from '@/lib/utils/formatting';
import { LOCATION_TYPES } from '@/lib/utils/constants';

export default function ParkingZonesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [filteredZones, setFilteredZones] = useState<ParkingZone[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    loadZones();
  }, [session, status, router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = zones.filter(zone =>
        zone.zoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredZones(filtered);
    } else {
      setFilteredZones(zones);
    }
  }, [searchTerm, zones]);

  const loadZones = async () => {
    try {
      const response = await fetch('/api/zones');
      if (response.ok) {
        const data = await response.json();
        setZones(data.data || []);
        setFilteredZones(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationTypeLabel = (type: string) => {
    const locationType = LOCATION_TYPES.find(lt => lt.value === type);
    return locationType?.label || type;
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading parking zones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Select Parking Zone</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search zones by number, name, or address..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {filteredZones.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-800">
                {searchTerm ? 'No zones found matching your search.' : 'No parking zones available.'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredZones.map((zone) => (
              <Card key={zone.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {formatZoneDisplay(zone.zoneNumber, zone.zoneName)}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {getLocationTypeLabel(zone.locationType)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-800 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{zone.address}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-800">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span>{formatCurrency(zone.ratePerHour)}/hour</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Max {zone.maxDurationHours}h</span>
                        </div>
                      </div>

                      {zone.restrictionsJson && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-700">
                            * Additional restrictions may apply
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      <Link href={`/parking/start?zoneId=${zone.id}`}>
                        <Button>
                          Select Zone
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}