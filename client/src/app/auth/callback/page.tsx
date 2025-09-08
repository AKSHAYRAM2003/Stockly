'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      if (code) {
        try {
          const tokens = await authService.handleGoogleCallback(code);
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          router.push('/');
        } catch (error) {
          console.error('Auth callback failed:', error);
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl">Completing sign in...</p>
        <p className="text-gray-400 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
}
