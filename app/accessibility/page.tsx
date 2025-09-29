'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  AccessibleLayout,
  PageHeading,
  StatusMessage,
  ProgressIndicator,
  LoadingSpinner,
  NavigationLandmark,
  BannerLandmark,
  ContentInfoLandmark
} from '@/components/layout/AccessibleLayout';
import { announceToScreenReader, keyboardNavigation } from '@/lib/utils/accessibility';
import {
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Type,
  MousePointer,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AccessibilityPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      setStatusType('success');
      setStatusMessage('Form submitted successfully! This message was announced to screen readers.');
    }, 2000);
  };

  const testScreenReaderAnnouncement = () => {
    announceToScreenReader('This is a test announcement for screen readers. You should hear this message.', 'polite');
  };

  const simulateProgressUpdate = () => {
    const newProgress = Math.min(progress + 20, 100);
    setProgress(newProgress);
    announceToScreenReader(`Progress updated: ${newProgress}% complete`, 'polite');
  };

  const toggleStatusMessage = (type: 'success' | 'error' | 'warning' | 'info') => {
    setStatusType(type);
    const messages = {
      success: 'This is a success message that will be announced to screen readers',
      error: 'This is an error message with assertive announcement priority',
      warning: 'This is a warning message about potential issues',
      info: 'This is an informational message for users'
    };
    setStatusMessage(messages[type]);
  };

  const wcagFeatures = [
    {
      category: 'Perceivable',
      icon: <Eye className="h-5 w-5" />,
      features: [
        'High contrast color scheme support',
        'Alt text for all images and icons',
        'Sufficient color contrast ratios (4.5:1)',
        'Text alternatives for non-text content',
        'Resizable text up to 200% without loss of functionality'
      ]
    },
    {
      category: 'Operable',
      icon: <Keyboard className="h-5 w-5" />,
      features: [
        'Full keyboard navigation support',
        'Visible focus indicators',
        'No keyboard traps',
        'Skip to content links',
        'Customizable timeout warnings'
      ]
    },
    {
      category: 'Understandable',
      icon: <Info className="h-5 w-5" />,
      features: [
        'Clear and consistent navigation',
        'Form labels and instructions',
        'Error identification and suggestions',
        'Language of page declared',
        'Predictable functionality'
      ]
    },
    {
      category: 'Robust',
      icon: <Zap className="h-5 w-5" />,
      features: [
        'Valid HTML markup',
        'Compatible with assistive technologies',
        'Proper ARIA labels and roles',
        'Screen reader announcements',
        'Progressive enhancement'
      ]
    }
  ];

  return (
    <AccessibleLayout pageTitle="Accessibility Features Demo">
      <div className={`min-h-screen transition-all ${
        highContrast ? 'bg-black text-white' : 'bg-gray-100'
      } ${largeText ? 'text-lg' : ''}`}>

        {/* Header */}
        <BannerLandmark ariaLabel="Page header" className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <PageHeading level={1} className="text-gray-900 mb-2">
                  ♿ Accessibility Features Demo
                </PageHeading>
                <p className="text-gray-600">
                  WCAG 2.1 AA compliant parking payment system
                </p>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </BannerLandmark>

        <div className="container mx-auto px-4 py-8">

          {/* Demo Notice */}
          <StatusMessage type="info" className="mb-8">
            <div>
              <strong>Interactive Accessibility Demo</strong>
              <p className="mt-1">
                This page demonstrates comprehensive accessibility features. Use a screen reader,
                navigate with keyboard only, or adjust your accessibility preferences to test the features.
              </p>
            </div>
          </StatusMessage>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Accessibility Controls */}
            <div>
              <Card>
                <CardHeader>
                  <PageHeading level={2}>🎛️ Accessibility Controls</PageHeading>
                  <p className="text-gray-600">
                    Test different accessibility features and preferences
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Visual Controls */}
                  <div>
                    <PageHeading level={3} className="mb-4">Visual Settings</PageHeading>
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setHighContrast(!highContrast)}
                        className="justify-between"
                        aria-pressed={highContrast}
                        srOnlyText="Toggle high contrast mode for better visibility"
                      >
                        <span className="flex items-center">
                          {highContrast ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                          High Contrast Mode
                        </span>
                        <span className={`text-sm ${highContrast ? 'text-green-600' : 'text-gray-500'}`}>
                          {highContrast ? 'ON' : 'OFF'}
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setLargeText(!largeText)}
                        className="justify-between"
                        aria-pressed={largeText}
                        srOnlyText="Toggle large text size for better readability"
                      >
                        <span className="flex items-center">
                          <Type className="h-4 w-4 mr-2" />
                          Large Text
                        </span>
                        <span className={`text-sm ${largeText ? 'text-green-600' : 'text-gray-500'}`}>
                          {largeText ? 'ON' : 'OFF'}
                        </span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setReducedMotion(!reducedMotion)}
                        className="justify-between"
                        aria-pressed={reducedMotion}
                        srOnlyText="Toggle reduced motion for users sensitive to animations"
                      >
                        <span className="flex items-center">
                          <MousePointer className="h-4 w-4 mr-2" />
                          Reduced Motion
                        </span>
                        <span className={`text-sm ${reducedMotion ? 'text-green-600' : 'text-gray-500'}`}>
                          {reducedMotion ? 'ON' : 'OFF'}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Screen Reader Tests */}
                  <div>
                    <PageHeading level={3} className="mb-4">Screen Reader Tests</PageHeading>
                    <div className="space-y-3">
                      <Button
                        onClick={testScreenReaderAnnouncement}
                        className="w-full justify-start"
                        srOnlyText="This will test screen reader announcements"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Test Screen Reader Announcement
                      </Button>

                      <div className="grid grid-cols-2 gap-2">
                        {(['success', 'error', 'warning', 'info'] as const).map(type => (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatusMessage(type)}
                            srOnlyText={`Test ${type} message announcement`}
                          >
                            {type === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
                            {type === 'error' && <AlertCircle className="h-4 w-4 mr-1" />}
                            {type === 'warning' && <AlertCircle className="h-4 w-4 mr-1" />}
                            {type === 'info' && <Info className="h-4 w-4 mr-1" />}
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Demo */}
                  <div>
                    <PageHeading level={3} className="mb-4">Progress Updates</PageHeading>
                    <ProgressIndicator
                      value={progress}
                      max={100}
                      label="Task Progress"
                      className="mb-3"
                    />
                    <Button
                      onClick={simulateProgressUpdate}
                      variant="outline"
                      size="sm"
                      disabled={progress >= 100}
                      srOnlyText="Increase progress by 20% and announce to screen readers"
                    >
                      Update Progress (+20%)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Form */}
            <div>
              <Card>
                <CardHeader>
                  <PageHeading level={2}>📝 Accessible Form Demo</PageHeading>
                  <p className="text-gray-600">
                    Fully accessible form with proper labels, validation, and announcements
                  </p>
                </CardHeader>
                <CardContent>

                  {/* Status Messages */}
                  {statusMessage && (
                    <div className="mb-6">
                      <StatusMessage type={statusType}>
                        {statusMessage}
                      </StatusMessage>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      id="demo-email"
                      type="email"
                      label="Email Address"
                      value={email}
                      onChange={handleEmailChange}
                      error={emailError}
                      helperText="We'll never share your email with anyone"
                      isRequired
                      placeholder="Enter your email address"
                      aria-describedby="email-help"
                    />

                    <div>
                      <Input
                        id="demo-password"
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        helperText="Must be at least 8 characters long"
                        isRequired
                        placeholder="Enter a secure password"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="mt-2"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        srOnlyText="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPassword ? 'Hide' : 'Show'} Password
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={isLoading}
                      loadingText="Submitting form, please wait"
                      disabled={!email || !password || !!emailError}
                      srOnlyText="Submit the form after validation"
                    >
                      {isLoading ? 'Submitting...' : 'Submit Form'}
                    </Button>
                  </form>

                  {isLoading && (
                    <div className="mt-4 text-center">
                      <LoadingSpinner label="Submitting form" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* WCAG Compliance Features */}
          <div className="mt-12">
            <PageHeading level={2} className="text-center mb-8">
              ✅ WCAG 2.1 AA Compliance Features
            </PageHeading>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {wcagFeatures.map((category, index) => (
                <Card key={category.category}>
                  <CardHeader>
                    <div className="flex items-center space-x-2 mb-2">
                      {category.icon}
                      <PageHeading level={3}>{category.category}</PageHeading>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Keyboard Navigation Guide */}
          <Card className="mt-8">
            <CardHeader>
              <PageHeading level={2}>⌨️ Keyboard Navigation Guide</PageHeading>
              <p className="text-gray-600">
                This application is fully navigable using keyboard shortcuts
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <PageHeading level={3} className="mb-4">Navigation Keys</PageHeading>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Tab</kbd></dt>
                      <dd>Move to next interactive element</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Shift + Tab</kbd></dt>
                      <dd>Move to previous interactive element</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Enter</kbd></dt>
                      <dd>Activate buttons and links</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Space</kbd></dt>
                      <dd>Activate buttons and checkboxes</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Escape</kbd></dt>
                      <dd>Close modals and dropdowns</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <PageHeading level={3} className="mb-4">Form Keys</PageHeading>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Arrow Keys</kbd></dt>
                      <dd>Navigate radio buttons and menus</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Home/End</kbd></dt>
                      <dd>Move to first/last item in lists</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">Page Up/Down</kbd></dt>
                      <dd>Scroll through content</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt><kbd className="bg-gray-200 px-2 py-1 rounded">F6</kbd></dt>
                      <dd>Cycle through page regions</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <ContentInfoLandmark ariaLabel="Page footer" className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-gray-600">
              <p>
                This accessibility demo meets WCAG 2.1 AA standards.
                For assistance, contact{' '}
                <a
                  href="mailto:accessibility@stamfordparking.gov"
                  className="text-blue-600 hover:underline"
                  aria-label="Email accessibility support"
                >
                  accessibility@stamfordparking.gov
                </a>
              </p>
            </div>
          </div>
        </ContentInfoLandmark>
      </div>
    </AccessibleLayout>
  );
}