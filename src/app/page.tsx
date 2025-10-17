'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { FormField } from '@/components/auth/FormField';
import { SubmitButton } from '@/components/auth/SubmitButton';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { auth } from '@/lib/supabase';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await auth.signIn(formData.email, formData.password);
      
      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Successful sign in - redirect to admin dashboard
        router.push('/admin');
      } else {
        throw new Error('Sign in failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Welcome back to BAWASA System"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}
        
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          required
          autoComplete="email"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Forgot your password?
            </a>
          </div>
        </div>

        <SubmitButton
          text="Sign In"
          isLoading={isLoading}
          disabled={isLoading}
        />
      </form>
      
    </AuthLayout>
  );
}