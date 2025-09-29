#!/usr/bin/env node

/**
 * Mobile Testing Script for Stamford Parking System
 * Tests user flow across mobile Chrome and Safari simulators
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Test configuration
const DEVICES = [
  {
    name: 'iPhone 12',
    viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'iPhone SE',
    viewport: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Samsung Galaxy S21',
    viewport: { width: 360, height: 800, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'iPad Mini',
    viewport: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  }
];

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test suite
const TESTS = [
  {
    name: 'Homepage Load',
    path: '/',
    assertions: async (page) => {
      await page.waitForSelector('body', { timeout: 5000 });
      const title = await page.title();
      return title.includes('Stamford Parking');
    }
  },
  {
    name: 'Dashboard Navigation',
    path: '/dashboard',
    assertions: async (page) => {
      await page.waitForSelector('[data-testid="dashboard"]', { timeout: 5000 });
      const dashboardExists = await page.$('[data-testid="dashboard"]') !== null;
      return dashboardExists;
    }
  },
  {
    name: 'Mobile Layout',
    path: '/dashboard',
    assertions: async (page) => {
      const mobileNav = await page.$('.mobile-nav, .bottom-nav, nav');
      const hamburgerMenu = await page.$('.hamburger, .menu-toggle, [aria-label*="menu"]');
      return mobileNav !== null || hamburgerMenu !== null;
    }
  },
  {
    name: 'Touch Targets',
    path: '/dashboard',
    assertions: async (page) => {
      const buttons = await page.$$('button, .tap-target, a[role="button"]');
      let validTargets = 0;

      for (const button of buttons) {
        const boundingBox = await button.boundingBox();
        if (boundingBox && boundingBox.height >= 44 && boundingBox.width >= 44) {
          validTargets++;
        }
      }

      return validTargets === buttons.length && buttons.length > 0;
    }
  },
  {
    name: 'PWA Manifest',
    path: '/manifest.json',
    assertions: async (page) => {
      try {
        const response = await page.goto(`${BASE_URL}/manifest.json`);
        const manifest = await response.json();
        return manifest.name === 'Stamford Parking System' && manifest.display === 'standalone';
      } catch (error) {
        return false;
      }
    }
  },
  {
    name: 'Service Worker Registration',
    path: '/',
    assertions: async (page) => {
      const hasServiceWorker = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });

      if (!hasServiceWorker) return false;

      // Wait for service worker to register
      await page.waitForTimeout(2000);

      const isRegistered = await page.evaluate(async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          return registration !== undefined;
        } catch {
          return false;
        }
      });

      return isRegistered;
    }
  },
  {
    name: 'Offline Page',
    path: '/offline',
    assertions: async (page) => {
      await page.waitForSelector('body', { timeout: 5000 });
      const offlineContent = await page.evaluate(() => {
        return document.body.textContent.toLowerCase().includes('offline') ||
               document.body.textContent.toLowerCase().includes('connection');
      });
      return offlineContent;
    }
  },
  {
    name: 'Form Inputs',
    path: '/dashboard',
    assertions: async (page) => {
      const inputs = await page.$$('input, select, textarea');
      let validInputs = 0;

      for (const input of inputs) {
        const boundingBox = await input.boundingBox();
        if (boundingBox && boundingBox.height >= 44) {
          validInputs++;
        }
      }

      return inputs.length === 0 || validInputs === inputs.length; // Pass if no inputs or all valid
    }
  },
  {
    name: 'Performance Metrics',
    path: '/dashboard',
    assertions: async (page) => {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (!navigation) return { loadTime: 0 };

        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
        };
      });

      // Consider good performance if load time < 3 seconds
      return performanceMetrics.loadTime < 3000;
    }
  }
];

class MobileTestRunner {
  constructor() {
    this.results = {};
    this.browser = null;
  }

  async init() {
    console.log('🚀 Initializing Mobile Test Runner...\n');

    this.browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async runTest(device, test) {
    const page = await this.browser.newPage();

    try {
      // Configure device emulation
      await page.setViewport(device.viewport);
      await page.setUserAgent(device.userAgent);

      // Enable mobile-specific features
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'platform', {
          get: () => device.name.includes('iPhone') || device.name.includes('iPad') ? 'iPhone' : 'Linux armv8l'
        });

        // Mock touch events
        Object.defineProperty(navigator, 'maxTouchPoints', {
          get: () => 5
        });
      });

      const startTime = Date.now();

      // Navigate to test page
      const url = `${BASE_URL}${test.path}`;
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Run test assertions
      const passed = await test.assertions(page);
      const duration = Date.now() - startTime;

      return {
        name: test.name,
        passed,
        duration,
        url,
        device: device.name,
        viewport: `${device.viewport.width}x${device.viewport.height}`,
        error: null
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: test.name,
        passed: false,
        duration,
        url: `${BASE_URL}${test.path}`,
        device: device.name,
        viewport: `${device.viewport.width}x${device.viewport.height}`,
        error: error.message
      };
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    console.log(`📱 Testing ${DEVICES.length} devices with ${TESTS.length} tests each...\n`);

    for (const device of DEVICES) {
      console.log(`🔧 Testing ${device.name} (${device.viewport.width}x${device.viewport.height})`);

      this.results[device.name] = [];

      for (const test of TESTS) {
        process.stdout.write(`  ⏳ ${test.name}...`);

        const result = await this.runTest(device, test);
        this.results[device.name].push(result);

        const status = result.passed ? '✅' : '❌';
        const duration = `${result.duration}ms`;
        console.log(`\r  ${status} ${test.name} (${duration})`);

        if (!result.passed && result.error) {
          console.log(`     Error: ${result.error}`);
        }

        // Brief pause between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('');
    }
  }

  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================\n');

    let totalTests = 0;
    let totalPassed = 0;

    for (const [deviceName, deviceResults] of Object.entries(this.results)) {
      const passed = deviceResults.filter(r => r.passed).length;
      const total = deviceResults.length;
      const percentage = ((passed / total) * 100).toFixed(1);

      totalTests += total;
      totalPassed += passed;

      console.log(`${deviceName}:`);
      console.log(`  ✅ ${passed}/${total} tests passed (${percentage}%)`);

      const failedTests = deviceResults.filter(r => !r.passed);
      if (failedTests.length > 0) {
        console.log(`  ❌ Failed tests: ${failedTests.map(t => t.name).join(', ')}`);
      }
      console.log('');
    }

    const overallPercentage = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`Overall: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)\n`);

    // Save detailed report
    this.saveDetailedReport();

    return {
      totalTests,
      totalPassed,
      percentage: overallPercentage,
      deviceResults: this.results
    };
  }

  saveDetailedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      devices: DEVICES.map(d => ({
        name: d.name,
        viewport: d.viewport,
        userAgent: d.userAgent
      })),
      results: this.results,
      summary: {
        totalDevices: Object.keys(this.results).length,
        totalTests: Object.values(this.results).reduce((sum, deviceResults) => sum + deviceResults.length, 0),
        totalPassed: Object.values(this.results).reduce((sum, deviceResults) =>
          sum + deviceResults.filter(r => r.passed).length, 0
        )
      }
    };

    const reportPath = path.join(__dirname, '..', 'test-results', `mobile-test-${Date.now()}.json`);

    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const runner = new MobileTestRunner();

  try {
    await runner.init();
    await runner.runAllTests();
    const summary = runner.generateReport();

    // Exit with error code if tests failed
    if (summary.percentage < 100) {
      console.log('⚠️  Some tests failed. Check the results above.');
      process.exit(1);
    } else {
      console.log('🎉 All tests passed!');
      process.exit(0);
    }

  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n👋 Test runner interrupted. Cleaning up...');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MobileTestRunner, DEVICES, TESTS };