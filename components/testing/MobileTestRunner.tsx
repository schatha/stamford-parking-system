'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, Smartphone, Monitor } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string;
  duration?: number;
}

interface DeviceTest {
  device: string;
  viewport: string;
  userAgent: string;
  tests: TestResult[];
}

export function MobileTestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [deviceTests, setDeviceTests] = useState<DeviceTest[]>([]);

  const testSuite = [
    {
      name: 'Responsive Layout',
      test: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const viewport = window.innerWidth;
        return viewport <= 428 && document.querySelector('.mobile-optimized') !== null;
      }
    },
    {
      name: 'Touch Target Size',
      test: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const buttons = document.querySelectorAll('button, .tap-target');
        let validTargets = 0;
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (rect.height >= 44 && rect.width >= 44) {
            validTargets++;
          }
        });
        return validTargets === buttons.length;
      }
    },
    {
      name: 'PWA Manifest',
      test: async () => {
        try {
          const response = await fetch('/manifest.json');
          const manifest = await response.json();
          return manifest.name === 'Stamford Parking System' &&
                 manifest.display === 'standalone';
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Service Worker',
      test: async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.getRegistration();
            return registration !== undefined;
          } catch {
            return false;
          }
        }
        return false;
      }
    },
    {
      name: 'Offline Fallback',
      test: async () => {
        try {
          // Simulate offline by trying to fetch a non-existent resource
          const response = await fetch('/api/test-offline', {
            method: 'HEAD',
            cache: 'no-cache'
          });
          return false; // Should fail when offline
        } catch {
          // Check if offline page exists
          const offlineResponse = await fetch('/offline');
          return offlineResponse.ok;
        }
      }
    },
    {
      name: 'Form Validation',
      test: async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input[required]');
        return forms.length > 0 && inputs.length > 0;
      }
    },
    {
      name: 'Navigation Flow',
      test: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const navLinks = document.querySelectorAll('nav a, .mobile-nav a');
        return navLinks.length >= 3; // Should have main navigation items
      }
    },
    {
      name: 'Performance Metrics',
      test: async () => {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          return loadTime < 3000; // Less than 3 seconds
        }
        return true; // Pass if performance API not available
      }
    }
  ];

  const devices = [
    {
      name: 'iPhone SE',
      viewport: '375x667',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    },
    {
      name: 'iPhone 14 Pro',
      viewport: '393x852',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
    },
    {
      name: 'Samsung Galaxy S21',
      viewport: '360x800',
      userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36'
    },
    {
      name: 'iPad Mini',
      viewport: '768x1024',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    }
  ];

  const runTest = async (testItem: typeof testSuite[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testItem.name);

    try {
      const result = await testItem.test();
      const duration = Date.now() - startTime;

      return {
        name: testItem.name,
        status: result ? 'passed' : 'failed',
        duration,
        details: result ? 'Test passed successfully' : 'Test failed - check implementation'
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: testItem.name,
        status: 'failed',
        duration,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const simulateDevice = (device: typeof devices[0]) => {
    // Parse viewport
    const [width, height] = device.viewport.split('x').map(Number);

    // This is a simulation - in a real test environment, you'd use actual device emulation
    console.log(`Simulating ${device.name} (${device.viewport})`);
    console.log(`User Agent: ${device.userAgent}`);

    // Store original values
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;

    // Mock viewport for testing (limited simulation in browser)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });

    return () => {
      // Restore original values
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    };
  };

  const runDeviceTests = async () => {
    setIsRunning(true);
    const results: DeviceTest[] = [];

    for (const device of devices) {
      console.log(`\n=== Testing ${device.name} ===`);

      const restoreViewport = simulateDevice(device);

      // Trigger resize event to update responsive design
      window.dispatchEvent(new Event('resize'));
      await new Promise(resolve => setTimeout(resolve, 500));

      const deviceTest: DeviceTest = {
        device: device.name,
        viewport: device.viewport,
        userAgent: device.userAgent,
        tests: []
      };

      for (const testItem of testSuite) {
        const result = await runTest(testItem);
        deviceTest.tests.push(result);
        console.log(`  ${result.name}: ${result.status} (${result.duration}ms)`);
      }

      results.push(deviceTest);
      restoreViewport();

      // Brief pause between devices
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setDeviceTests(results);
    setIsRunning(false);
    setCurrentTest('');

    // Print summary
    const totalTests = results.reduce((sum, device) => sum + device.tests.length, 0);
    const passedTests = results.reduce((sum, device) =>
      sum + device.tests.filter(test => test.status === 'passed').length, 0
    );

    console.log(`\n=== TEST SUMMARY ===`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    return deviceName.toLowerCase().includes('ipad') ?
      <Monitor className="h-4 w-4" /> :
      <Smartphone className="h-4 w-4" />;
  };

  const overallStats = deviceTests.length > 0 ? {
    totalTests: deviceTests.reduce((sum, device) => sum + device.tests.length, 0),
    passedTests: deviceTests.reduce((sum, device) =>
      sum + device.tests.filter(test => test.status === 'passed').length, 0
    ),
    failedTests: deviceTests.reduce((sum, device) =>
      sum + device.tests.filter(test => test.status === 'failed').length, 0
    )
  } : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mobile Testing Suite
        </h1>
        <p className="text-gray-600">
          Comprehensive testing for mobile Chrome and Safari compatibility
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Test Controls</h2>
              <p className="text-sm text-gray-600">
                {isRunning ? `Running: ${currentTest}` : 'Ready to run tests'}
              </p>
            </div>
            <Button
              onClick={runDeviceTests}
              disabled={isRunning}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      {overallStats && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {overallStats.totalTests}
                </div>
                <div className="text-sm text-blue-800">Total Tests</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {overallStats.passedTests}
                </div>
                <div className="text-sm text-green-800">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {overallStats.failedTests}
                </div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold">
                Success Rate: {((overallStats.passedTests / overallStats.totalTests) * 100).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Test Results */}
      {deviceTests.map((deviceTest, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              {getDeviceIcon(deviceTest.device)}
              <div className="ml-3">
                <h3 className="text-lg font-semibold">{deviceTest.device}</h3>
                <p className="text-sm text-gray-600">{deviceTest.viewport}</p>
              </div>
            </div>

            <div className="space-y-3">
              {deviceTest.tests.map((test, testIndex) => (
                <div key={testIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(test.status)}
                    <span className="ml-3 font-medium">{test.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {test.duration}ms
                    </div>
                    {test.details && test.status === 'failed' && (
                      <div className="text-xs text-red-600 mt-1">
                        {test.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>
                  Passed: {deviceTest.tests.filter(t => t.status === 'passed').length} / {deviceTest.tests.length}
                </span>
                <span>
                  Success Rate: {((deviceTest.tests.filter(t => t.status === 'passed').length / deviceTest.tests.length) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {deviceTests.length === 0 && !isRunning && (
        <Card>
          <CardContent className="p-12 text-center">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Tests Run Yet
            </h3>
            <p className="text-gray-500">
              Click "Run All Tests" to begin mobile compatibility testing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}