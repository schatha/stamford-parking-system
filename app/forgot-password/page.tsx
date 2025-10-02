'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/ui/AuthCard';
import FormField from '@/components/ui/FormField';
import Button from '@/components/ui/Button';
import { validateEmail } from '@/lib/utils/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement password reset functionality
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-800">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-700">
              Check your email and follow the link to reset your password.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              Send another email
            </Button>

            <Link
              href="/login"
              className="block w-full text-center py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <FormField
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Sending instructions...' : 'Send reset instructions'}
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Password reset functionality is not yet implemented in this demo.
          Please contact your system administrator for password assistance.
        </p>
      </div>
    </AuthCard>
  );
}