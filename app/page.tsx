'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Car, Shield, CreditCard, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { UserMenu } from '@/components/auth/UserMenu';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Stamford Parking System
              </h1>
            </div>
            <div className="space-x-4">
              {session ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Municipal Parking Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay for parking, extend your time, and manage your vehicles all from your mobile device.
            Quick, secure, and convenient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardContent className="text-center p-8">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quick Payment</h3>
              <p className="text-gray-600">
                Pay for parking in seconds with secure online payments. No more hunting for coins.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-8">
              <Clock className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Extend Anytime</h3>
              <p className="text-gray-600">
                Running late? Extend your parking session remotely without returning to your car.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-8">
              <Car className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Vehicle Management</h3>
              <p className="text-gray-600">
                Store multiple vehicles and view your complete parking history in one place.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-8">
            Create your account today and never worry about parking payments again.
          </p>
          <div className="space-x-4">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg">Create Account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              © 2024 City of Stamford. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}