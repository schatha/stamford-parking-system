import { Metadata } from 'next';
import { MobileTestRunner } from '@/components/testing/MobileTestRunner';

export const metadata: Metadata = {
  title: 'Mobile Testing Suite - Stamford Parking',
  description: 'Comprehensive mobile compatibility testing for Chrome and Safari',
  robots: 'noindex,nofollow', // Prevent indexing of test pages
};

export default function MobileTestPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto">
        <MobileTestRunner />
      </div>
    </div>
  );
}