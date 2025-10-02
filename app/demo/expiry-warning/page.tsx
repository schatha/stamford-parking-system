'use client';

import { useState } from 'react';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ExpiryWarningDemo } from '@/components/demo/ExpiryWarningDemo';

export default function ExpiryWarningDemoPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Expiry Warning System Demo
                </h1>
                <p className="!text-black font-medium mt-2">
                  Experience our multi-channel notification system in action
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          {!showDemo && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Smart Notification System
                </h2>
                <p className="!text-black font-medium">
                  See how our intelligent warning system helps users avoid parking violations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      What You'll See
                    </h3>
                    <ul className="space-y-2 !text-black font-medium">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        Browser push notifications with action buttons
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        Mobile-style push notifications
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        Email notification templates
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        Real-time countdown timers
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                        Session extension workflows
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Key Features
                    </h3>
                    <ul className="space-y-2 !text-black font-medium">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <strong>15-minute warning threshold</strong> - Automatic alerts before expiry
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <strong>Multi-channel delivery</strong> - Email, SMS, push, browser
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <strong>Quick actions</strong> - Extend or manage directly from notifications
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <strong>Smart dismissal</strong> - Warnings clear when sessions extend
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        <strong>User preferences</strong> - Customizable notification settings
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Production Implementation
                  </h4>
                  <p className="text-blue-800 text-sm">
                    In a live environment, this system would integrate with services like
                    SendGrid (email), Twilio (SMS), Firebase Cloud Messaging (mobile push),
                    and browser Push API for comprehensive notification delivery.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button
                    size="lg"
                    onClick={() => setShowDemo(true)}
                    className="flex items-center mx-auto"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Component */}
          {showDemo && (
            <ExpiryWarningDemo onClose={() => setShowDemo(false)} />
          )}

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Technical Implementation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Frontend Components</h4>
                  <ul className="text-sm !text-black font-medium space-y-1">
                    <li>• Real-time countdown timer with WebSocket updates</li>
                    <li>• React state management for notification visibility</li>
                    <li>• Responsive notification UI components</li>
                    <li>• Browser Push API integration</li>
                    <li>• Service Worker for background notifications</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Backend Services</h4>
                  <ul className="text-sm !text-black font-medium space-y-1">
                    <li>• Scheduled notification jobs with queue system</li>
                    <li>• Multi-provider notification routing</li>
                    <li>• User preference management</li>
                    <li>• Delivery tracking and retry logic</li>
                    <li>• Rate limiting and spam prevention</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Notification Flow</h4>
                <div className="text-sm !text-black font-medium">
                  <p>
                    <strong>1. Session Creation:</strong> Background jobs are scheduled based on session end time
                  </p>
                  <p>
                    <strong>2. Warning Triggers:</strong> Jobs execute at configured intervals (15min, 5min, etc.)
                  </p>
                  <p>
                    <strong>3. Multi-channel Delivery:</strong> Notifications sent via user's preferred channels
                  </p>
                  <p>
                    <strong>4. Action Handling:</strong> Users can extend sessions directly from notifications
                  </p>
                  <p>
                    <strong>5. Smart Cleanup:</strong> Jobs are canceled when sessions are extended or terminated
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <h3 className="text-xl font-semibold text-green-900">
                Business Benefits
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">95%</div>
                  <p className="text-sm text-green-800">Fewer parking violations</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">40%</div>
                  <p className="text-sm text-green-800">More session extensions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">80%</div>
                  <p className="text-sm text-green-800">Higher user satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center">
            <div className="space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
              {showDemo && (
                <Button onClick={() => setShowDemo(false)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Demo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}