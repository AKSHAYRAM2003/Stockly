'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { AuthPage } from '@/components/ui/auth';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      const checkAuth = async () => {
        try {
          await authService.getCurrentUser();
          router.push('/');
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      };
      checkAuth();
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { auth_url } = await authService.getGoogleAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      setError('Failed to connect to Google. Please try again.');
      setLoading(false);
    }
  };

  const handleToggleToSignup = () => {
    router.push('/signup');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const tokens = await authService.login(email, password);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      // Dispatch custom event to notify navbar of login
      window.dispatchEvent(new CustomEvent('auth-login'));
      
      router.push('/');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      const message = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail 
        : 'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      avatarSrc: "https://images.unsplash.com/photo-1678483573236-d8eb3fb024e2?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Alex Chen",
      handle: "@alexchen",
      text: "Stockly has revolutionized how I create visual content for my projects!"
    },
    {
      avatarSrc: "https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Sarah Rodriguez",
      handle: "@sarahdesigns",
      text: "The AI-generated images are incredibly detailed and professional."
    }
    // {
    //   avatarSrc: "https://www.lummi.ai/api/render/image/8a9a5f1f-f2aa-47e7-b91f-1ae13f11c6e5?token=eyJhbGciOiJIUzI1NiJ9.eyJpZHMiOlsiOGE5YTVmMWYtZjJhYS00N2U3LWI5MWYtMWFlMTNmMTFjNmU1Il0sInJlc29sdXRpb24iOiJtZWRpdW0iLCJyZW5kZXJTcGVjcyI6eyJlZmZlY3RzIjp7InJlZnJhbWUiOnt9fX0sInNob3VsZEF1dG9Eb3dubG9hZCI6ZmFsc2UsImp0aSI6IjVheHRaTkhnQ2tkRWs0aENEdE04SSIsImlhdCI6MTc1NzM0MjExNiwiZXhwIjoxNzU3MzQyMTc2fQ.vZdv_-Ez8lNuPrR98aRYRGId_vnvpw6lw-NP5POlp6U",
    //   name: "Mike Thompson",
    //   handle: "@mikethompson",
    //   text: "Perfect for creating unique artwork and illustrations quickly."
    // }
  ];

  return (
    <AuthPage
      mode="signin"
      title={
        <div className="flex flex-col items-start">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="/logo.png"
              alt="Stockly Logo"
              className="w-12 h-12 filter brightness-0 invert"
            />
            <span className="text-white font-bold text-2xl italic">Stockly</span>
          </div>
          <span className="font-light text-white tracking-tighter">Welcome Back</span>
        </div>
      }
      description="Sign in to create stunning AI-generated images and unlock your creative potential"
      heroImageSrc="https://images.unsplash.com/photo-1756992293716-b843700b5ab0?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      testimonials={testimonials}
      onAuth={handleEmailLogin}
      onGoogleAuth={handleGoogleLogin}
      onToggleMode={handleToggleToSignup}
      onBackToHome={handleBackToHome}
      onResetPassword={() => {
        console.log('Reset password clicked');
      }}
      loading={loading}
      error={error}
    />
  );
}


