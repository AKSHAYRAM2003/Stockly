'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        router.push(`/profile/${userData.user_id}`);
      } catch (error) {
        router.push('/signin');
      }
    };

    redirectToProfile();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p>Redirecting to profile...</p>
    </div>
  );
}
