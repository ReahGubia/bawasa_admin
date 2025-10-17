'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await auth.getCurrentUser();
        if (user) {
          setUser(user);
        } else {
          // No user found, redirect to sign in
          router.push('/');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">BAWASA Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
          
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome!</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">
                <strong>Email:</strong> {user?.email}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>User ID:</strong> {user?.id}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Last Sign In:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}