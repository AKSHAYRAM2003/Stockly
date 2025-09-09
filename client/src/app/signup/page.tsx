'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import { AuthPage } from '@/components/ui/auth';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { auth_url } = await authService.getGoogleAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
      setLoading(false);
    }
  };

  const handleToggleToSignin = () => {
    router.push('/signin');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const testimonials = [
    {
      avatarSrc: "https://images.unsplash.com/photo-1583692331501-5339b76cbf1e?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Emma Wilson",
      handle: "@emmawilson",
      text: "Creating my first AI artwork was so easy with Stockly's intuitive interface!"
    },
    {
      avatarSrc: "https://images.unsplash.com/photo-1679673988162-018d0400240e?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "David Park",
      handle: "@davidpark",
      text: "The quality of generated images exceeded my expectations completely."
    }
    // {
    //   avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b76c?w=40&h=40&fit=crop&crop=face",
    //   name: "Lisa Garcia",
    //   handle: "@lisagarcia",
    //   text: "Stockly transformed how I approach creative projects and presentations."
    // }
  ];

  return (
    <AuthPage
      mode="signup"
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
          <span className="font-light text-white tracking-tighter">Join Stockly</span>
        </div>
      }
      description="Create your account to start generating stunning images with AI technology"
      heroImageSrc="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=1000&fit=crop&crop=center"
      testimonials={testimonials}
      onGoogleAuth={handleGoogleSignup}
      onToggleMode={handleToggleToSignin}
      onBackToHome={handleBackToHome}
      onResetPassword={() => {
        console.log('Reset password clicked');
      }}
      loading={loading}
    />
  );
}
