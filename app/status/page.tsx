import { Metadata } from 'next';
import { StatusDashboard } from '@/components/status/StatusDashboard';

export const metadata: Metadata = {
  title: 'System Status - Stamford Parking',
  description: 'Real-time system health and status monitoring for Stamford Parking System',
  robots: 'noindex,nofollow', // Don't index status pages
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StatusDashboard />
    </div>
  );
}