'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { validateEmail, validatePhoneNumber } from '@/lib/utils/validation';
import { validatePassword } from '@/lib/password';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Failed to create account' });
        return;
      }

      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ form: 'Account created but login failed. Please try signing in.' });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors({ form: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-800">
            Sign up for the Stamford Parking System
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.form}
                </div>
              )}

              <Input
                id="name"
                name="name"
                type="text"
                label="Full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Input
                id="phone"
                name="phone"
                type="tel"
                label="Phone number (optional)"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                helperText="Used for parking session notifications"
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                required
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-800">
                Already have an account?{' '}
                <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}