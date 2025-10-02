'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Clock, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ParkingZone } from '@/types';
import { getRateForLocationType } from '@/lib/utils/calculations';
import { formatCurrency } from '@/lib/utils/formatting';

interface ZoneSelectorProps {
  onZoneSelect: (zone: ParkingZone) => void;
}

export function ZoneSelector({ onZoneSelect }: ZoneSelectorProps) {
  const [zoneNumber, setZoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState<ParkingZone[]>([]);
  const [popularZones, setPopularZones] = useState<ParkingZone[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPopularZones();
  }, []);

  useEffect(() => {
    if (zoneNumber.trim()) {
      searchZones();
    } else {
      setSearchResults([]);
    }
  }, [zoneNumber]);

  const loadPopularZones = async () => {
    try {
      const response = await fetch('/api/zones?popular=true&limit=6');
      if (response.ok) {
        const data = await response.json();
        setPopularZones(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load popular zones:', error);
    }
  };

  const searchZones = async () => {
    if (!zoneNumber.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/zones?q=${encodeURIComponent(zoneNumber.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);

        if (data.data.length === 0) {
          setError(`No zones found for "${zoneNumber}". Please check the zone number and try again.`);
        }
      } else {
        setError('Failed to search zones. Please try again.');
      }
    } catch (error) {
      console.error('Failed to search zones:', error);
      setError('Failed to search zones. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'STREET':
        return '🛣️';
      case 'GARAGE':
        return '🏢';
      case 'LOT':
        return '🅿️';
      case 'METER':
        return '🪙';
      default:
        return '📍';
    }
  };

  const getLocationLabel = (locationType: string) => {
    switch (locationType) {
      case 'STREET':
        return 'Street Parking';
      case 'GARAGE':
        return 'Parking Garage';
      case 'LOT':
        return 'Parking Lot';
      case 'METER':
        return 'Parking Meter';
      default:
        return 'Parking';
    }
  };

  const ZoneCard = ({ zone }: { zone: ParkingZone }) => {
    const rate = getRateForLocationType(zone.locationType);

    return (
      <Card
        key={zone.id}
        className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200"
        onClick={() => onZoneSelect(zone)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="text-2xl mr-3">
                {getLocationIcon(zone.locationType)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Zone {zone.zoneNumber}
                </h3>
                <p className="text-sm text-gray-800">
                  {getLocationLabel(zone.locationType)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{formatCurrency(rate)}/hr</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-800">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{zone.address}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-800">
                <Clock className="h-4 w-4 mr-1" />
                <span>Max {zone.maxDurationHours}h</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                zone.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {zone.isActive ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Search className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h2 className="text-lg font-semibold">Find Your Parking Zone</h2>
              <p className="text-sm text-gray-800">
                Enter the zone number from the sign or select from popular zones below
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              id="zoneNumber"
              type="text"
              label="Zone Number"
              value={zoneNumber}
              onChange={(e) => setZoneNumber(e.target.value)}
              placeholder="Enter zone number (e.g., ST-101, PG-05)"
              helperText="Look for the zone number on parking signs or meters"
            />

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Navigation className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Zone Not Found</h3>
                    <p className="text-sm text-yellow-700 mt-1">{error}</p>
                    <div className="mt-2">
                      <p className="text-sm text-yellow-700">
                        <strong>Tips:</strong>
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc list-inside mt-1">
                        <li>Check the zone number on nearby parking signs</li>
                        <li>Zone numbers usually start with ST- (street) or PG- (garage)</li>
                        <li>Try selecting from popular zones below</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results {isSearching && '(Searching...)'}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Zones */}
      {popularZones.length > 0 && !searchResults.length && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Parking Zones
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {popularZones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <MapPin className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold">Interactive Zone Map</h3>
              <p className="text-sm text-gray-800">
                Click on zones to select them for parking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-800 font-medium">Interactive Map Coming Soon</p>
              <p className="text-sm text-gray-700 mt-1">
                View all parking zones on an interactive map of downtown Stamford
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">?</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Need Help Finding Your Zone?</h4>
              <p className="text-sm text-blue-800 mt-1">
                Look for parking signs with zone numbers. They're usually posted on poles or meters
                and start with letters like "ST-" for street parking or "PG-" for parking garages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}