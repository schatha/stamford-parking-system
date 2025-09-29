'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Mail, MessageSquare, Clock, Smartphone, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface NotificationSettingsProps {
  sessionId: string;
  onClose: () => void;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  warningTimes: number[]; // Minutes before expiry
}

export function NotificationSettings({ sessionId, onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    warningTimes: [15, 5]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [sessionId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notifications`);
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMethod = (method: keyof Omit<NotificationPreferences, 'warningTimes'>) => {
    setPreferences(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const toggleWarningTime = (minutes: number) => {
    setPreferences(prev => ({
      ...prev,
      warningTimes: prev.warningTimes.includes(minutes)
        ? prev.warningTimes.filter(t => t !== minutes)
        : [...prev.warningTimes, minutes].sort((a, b) => b - a)
    }));
  };

  const warningTimeOptions = [30, 15, 10, 5, 2];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600 mr-2" />
            <div>
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <p className="text-sm text-gray-600">
                Get alerts before your parking session expires
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Methods */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Notification Methods</h4>
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">Send alerts to your email address</p>
                </div>
              </div>
              <button
                onClick={() => toggleMethod('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.email ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">SMS Text Messages</p>
                  <p className="text-sm text-gray-600">Send alerts to your phone number</p>
                </div>
              </div>
              <button
                onClick={() => toggleMethod('sms')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.sms ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Browser and mobile app notifications</p>
                </div>
              </div>
              <button
                onClick={() => toggleMethod('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.push ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Warning Times */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Warning Times
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            When should we alert you before your session expires?
          </p>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {warningTimeOptions.map((minutes) => (
              <button
                key={minutes}
                onClick={() => toggleWarningTime(minutes)}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  preferences.warningTimes.includes(minutes)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {minutes} min
              </button>
            ))}
          </div>
        </div>

        {/* Demo Notification */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start">
            <Bell className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Demo Notification System</h4>
              <p className="text-sm text-orange-800 mb-2">
                This is a demonstration of the notification interface. In a production environment:
              </p>
              <ul className="text-sm text-orange-800 list-disc list-inside space-y-1">
                <li>Email notifications would be sent via SendGrid, Mailgun, or similar service</li>
                <li>SMS alerts would use Twilio, AWS SNS, or similar SMS provider</li>
                <li>Push notifications would use Firebase Cloud Messaging or Apple Push Notification service</li>
                <li>Notifications would be triggered by background jobs based on session end times</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Notification Preview */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Sample Notification</h4>
          <div className="bg-white p-3 rounded border shadow-sm">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Parking Session Expiring Soon</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Your parking session in Zone ST-101 expires in 15 minutes.
                  <span className="text-blue-600 font-medium cursor-pointer"> Extend now →</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={savePreferences}
            isLoading={isSaving}
            disabled={isSaving}
          >
            {isSaved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </>
            )}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>
            Notification preferences are saved per session and will be applied to future parking sessions.
            You can update these settings anytime from your account preferences.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}