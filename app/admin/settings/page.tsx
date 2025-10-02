'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Save,
  RefreshCw,
  DollarSign,
  Clock,
  Shield,
  Mail,
  Bell,
  Server,
  Key,
  Database,
  Palette,
  Globe,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface SystemSettings {
  // Parking Configuration
  parking: {
    defaultSessionDuration: number;
    maxSessionDuration: number;
    extensionGracePeriod: number;
    warningThreshold: number;
  };

  // Pricing Configuration
  pricing: {
    streetParkingRate: number;
    garageParkingRate: number;
    lotParkingRate: number;
    meterParkingRate: number;
    taxRate: number;
    processingFeeRate: number;
    processingFeeFixed: number;
  };

  // System Configuration
  system: {
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxActiveSessionsPerUser: number;
  };

  // Notification Configuration
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminAlerts: boolean;
    systemHealthChecks: boolean;
  };

  // Integration Configuration
  integrations: {
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    emailProvider: 'sendgrid' | 'ses' | 'smtp';
    smsProvider: 'twilio' | 'aws' | 'disabled';
  };
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);

  // Mock settings data
  const defaultSettings: SystemSettings = {
    parking: {
      defaultSessionDuration: 2,
      maxSessionDuration: 12,
      extensionGracePeriod: 30,
      warningThreshold: 15
    },
    pricing: {
      streetParkingRate: 2.00,
      garageParkingRate: 3.00,
      lotParkingRate: 1.50,
      meterParkingRate: 2.50,
      taxRate: 6.35,
      processingFeeRate: 2.9,
      processingFeeFixed: 0.30
    },
    system: {
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true,
      sessionTimeout: 1440, // 24 hours in minutes
      maxActiveSessionsPerUser: 3
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      systemHealthChecks: true
    },
    integrations: {
      stripeEnabled: true,
      stripePublishableKey: 'pk_test_***',
      stripeSecretKey: 'sk_test_***',
      emailProvider: 'sendgrid',
      smsProvider: 'twilio'
    }
  };

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

    loadSettings();
  }, [session, status, router]);

  const loadSettings = async () => {
    try {
      // In a real app, this would fetch from /api/admin/settings
      setSettings(defaultSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setSaveStatus(null);

    try {
      // In a real app, this would POST to /api/admin/settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (path: string, value: any) => {
    if (!settings) return;

    const pathParts = path.split('.');
    const newSettings = { ...settings };

    let current = newSettings as any;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    setSettings(newSettings);
  };

  if (status === 'loading' || isLoading || !settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800">Loading settings...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-800 mt-2">
              Configure system parameters and integrations
            </p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={loadSettings} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`rounded-lg p-4 ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              )}
              <p className={`text-sm font-medium ${
                saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveStatus === 'success' ? 'Settings saved successfully!' : 'Failed to save settings. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Parking Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold">Parking Configuration</h3>
                  <p className="text-sm text-gray-800">Default session and timing settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="defaultSessionDuration"
                label="Default Session Duration (hours)"
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={settings.parking.defaultSessionDuration.toString()}
                onChange={(e) => updateSettings('parking.defaultSessionDuration', parseFloat(e.target.value))}
              />

              <Input
                id="maxSessionDuration"
                label="Maximum Session Duration (hours)"
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={settings.parking.maxSessionDuration.toString()}
                onChange={(e) => updateSettings('parking.maxSessionDuration', parseFloat(e.target.value))}
              />

              <Input
                id="extensionGracePeriod"
                label="Extension Grace Period (minutes)"
                type="number"
                min="0"
                max="120"
                value={settings.parking.extensionGracePeriod.toString()}
                onChange={(e) => updateSettings('parking.extensionGracePeriod', parseInt(e.target.value))}
                helperText="Time after expiry to allow extensions"
              />

              <Input
                id="warningThreshold"
                label="Warning Threshold (minutes)"
                type="number"
                min="5"
                max="60"
                value={settings.parking.warningThreshold.toString()}
                onChange={(e) => updateSettings('parking.warningThreshold', parseInt(e.target.value))}
                helperText="Send warnings when session expires in X minutes"
              />
            </CardContent>
          </Card>

          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold">Pricing Configuration</h3>
                  <p className="text-sm text-gray-800">Parking rates and fee structure</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="streetParkingRate"
                  label="Street Parking ($/hour)"
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.pricing.streetParkingRate.toString()}
                  onChange={(e) => updateSettings('pricing.streetParkingRate', parseFloat(e.target.value))}
                />

                <Input
                  id="garageParkingRate"
                  label="Garage Parking ($/hour)"
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.pricing.garageParkingRate.toString()}
                  onChange={(e) => updateSettings('pricing.garageParkingRate', parseFloat(e.target.value))}
                />

                <Input
                  id="lotParkingRate"
                  label="Lot Parking ($/hour)"
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.pricing.lotParkingRate.toString()}
                  onChange={(e) => updateSettings('pricing.lotParkingRate', parseFloat(e.target.value))}
                />

                <Input
                  id="meterParkingRate"
                  label="Meter Parking ($/hour)"
                  type="number"
                  step="0.25"
                  min="0"
                  value={settings.pricing.meterParkingRate.toString()}
                  onChange={(e) => updateSettings('pricing.meterParkingRate', parseFloat(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="taxRate"
                  label="Tax Rate (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={settings.pricing.taxRate.toString()}
                  onChange={(e) => updateSettings('pricing.taxRate', parseFloat(e.target.value))}
                />

                <Input
                  id="processingFeeRate"
                  label="Processing Fee (%)"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={settings.pricing.processingFeeRate.toString()}
                  onChange={(e) => updateSettings('pricing.processingFeeRate', parseFloat(e.target.value))}
                />

                <Input
                  id="processingFeeFixed"
                  label="Processing Fee ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={settings.pricing.processingFeeFixed.toString()}
                  onChange={(e) => updateSettings('pricing.processingFeeFixed', parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Server className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold">System Configuration</h3>
                  <p className="text-sm text-gray-800">Core system settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => updateSettings('system.maintenanceMode', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm font-medium">Maintenance Mode</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.allowRegistrations}
                    onChange={(e) => updateSettings('system.allowRegistrations', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm font-medium">Allow New Registrations</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.requireEmailVerification}
                    onChange={(e) => updateSettings('system.requireEmailVerification', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                  />
                  <span className="text-sm font-medium">Require Email Verification</span>
                </label>
              </div>

              <Input
                id="sessionTimeout"
                label="Session Timeout (minutes)"
                type="number"
                min="30"
                max="10080"
                value={settings.system.sessionTimeout.toString()}
                onChange={(e) => updateSettings('system.sessionTimeout', parseInt(e.target.value))}
                helperText="User session expiry time"
              />

              <Input
                id="maxActiveSessionsPerUser"
                label="Max Active Sessions Per User"
                type="number"
                min="1"
                max="10"
                value={settings.system.maxActiveSessionsPerUser.toString()}
                onChange={(e) => updateSettings('system.maxActiveSessionsPerUser', parseInt(e.target.value))}
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-lg font-semibold">Notifications</h3>
                  <p className="text-sm text-gray-800">Communication preferences</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSettings('notifications.emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium">Email Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateSettings('notifications.smsNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium">SMS Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => updateSettings('notifications.pushNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium">Push Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.adminAlerts}
                  onChange={(e) => updateSettings('notifications.adminAlerts', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium">Admin Alerts</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications.systemHealthChecks}
                  onChange={(e) => updateSettings('notifications.systemHealthChecks', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm font-medium">System Health Checks</span>
              </label>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-6 w-6 text-red-600 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold">Integrations</h3>
                    <p className="text-sm text-gray-800">Third-party service configuration</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Configuration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Stripe Payment Processing</h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.integrations.stripeEnabled}
                      onChange={(e) => updateSettings('integrations.stripeEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="stripePublishableKey"
                    label="Publishable Key"
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.integrations.stripePublishableKey}
                    onChange={(e) => updateSettings('integrations.stripePublishableKey', e.target.value)}
                  />

                  <Input
                    id="stripeSecretKey"
                    label="Secret Key"
                    type={showSecrets ? 'text' : 'password'}
                    value={settings.integrations.stripeSecretKey}
                    onChange={(e) => updateSettings('integrations.stripeSecretKey', e.target.value)}
                  />
                </div>
              </div>

              {/* Email Provider */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Email Provider</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(['sendgrid', 'ses', 'smtp'] as const).map(provider => (
                    <label key={provider} className="flex items-center">
                      <input
                        type="radio"
                        name="emailProvider"
                        value={provider}
                        checked={settings.integrations.emailProvider === provider}
                        onChange={(e) => updateSettings('integrations.emailProvider', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm capitalize">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SMS Provider */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">SMS Provider</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(['twilio', 'aws', 'disabled'] as const).map(provider => (
                    <label key={provider} className="flex items-center">
                      <input
                        type="radio"
                        name="smsProvider"
                        value={provider}
                        checked={settings.integrations.smsProvider === provider}
                        onChange={(e) => updateSettings('integrations.smsProvider', e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-sm capitalize">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button (Bottom) */}
        <div className="sticky bottom-4 flex justify-center">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            size="lg"
            className="shadow-lg"
          >
            <Save className="h-5 w-5 mr-2" />
            {isSaving ? 'Saving Settings...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}