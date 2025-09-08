import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface AuthPageProps {
  mode: 'signin' | 'signup';
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onAuth?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleAuth?: () => void;
  onResetPassword?: () => void;
  onToggleMode?: () => void;
  onBackToHome?: () => void;
  loading?: boolean;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-700 bg-gray-900/50 backdrop-blur-sm transition-colors focus-within:border-gray-600 focus-within:bg-gray-800/70">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700 p-5 w-64`}>
    <img 
      src={testimonial.avatarSrc} 
      className="h-10 w-10 object-cover rounded-full border-2 border-gray-600/50 flex-shrink-0" 
      alt="avatar"
      style={{ aspectRatio: '1/1' }}
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
      <p className="text-gray-400">{testimonial.handle}</p>
      <p className="mt-1 text-gray-300">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const AuthPage: React.FC<AuthPageProps> = ({
  mode = 'signin',
  title,
  description,
  heroImageSrc,
  testimonials = [],
  onAuth,
  onGoogleAuth,
  onResetPassword,
  onToggleMode,
  onBackToHome,
  loading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const defaultTitle = mode === 'signin' 
    ? <span className="font-light text-white tracking-tighter">Welcome Back</span>
    : <span className="font-light text-white tracking-tighter">Join Stockly</span>;

  const defaultDescription = mode === 'signin' 
    ? "Sign in to continue creating amazing AI-generated images"
    : "Create your account to start generating stunning images with AI";

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-geist w-full bg-black">
      {/* Left column: auth form */}
      <section className="flex-1 flex items-center justify-center p-4 md:p-8 relative min-h-screen md:min-h-auto">
        {/* Back to Home Button - Mobile/Tablet only */}
        <button
          onClick={onBackToHome}
          className="absolute top-4 left-4 md:hidden flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm z-20"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-md mt-8 md:mt-0">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
              {title || defaultTitle}
            </h1>
            <p className="animate-element animate-delay-200 text-gray-400 text-sm md:text-base">
              {description || defaultDescription}
            </p>

            <form className="space-y-4 md:space-y-5" onSubmit={onAuth}>
              {/* Name fields for signup only */}
              {mode === 'signup' && (
                <div className="animate-element animate-delay-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">First Name</label>
                    <GlassInputWrapper>
                      <input 
                        name="firstName" 
                        type="text" 
                        placeholder="First name" 
                        className="w-full bg-transparent text-sm p-3 md:p-4 rounded-2xl focus:outline-none text-white placeholder-gray-500" 
                      />
                    </GlassInputWrapper>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Last Name</label>
                    <GlassInputWrapper>
                      <input 
                        name="lastName" 
                        type="text" 
                        placeholder="Last name" 
                        className="w-full bg-transparent text-sm p-3 md:p-4 rounded-2xl focus:outline-none text-white placeholder-gray-500" 
                      />
                    </GlassInputWrapper>
                  </div>
                </div>
              )}

              <div className={`animate-element ${mode === 'signup' ? 'animate-delay-400' : 'animate-delay-300'}`}>
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full bg-transparent text-sm p-3 md:p-4 rounded-2xl focus:outline-none text-white placeholder-gray-500" 
                  />
                </GlassInputWrapper>
              </div>

              <div className={`animate-element ${mode === 'signup' ? 'animate-delay-500' : 'animate-delay-400'}`}>
                <label className="text-sm font-medium text-gray-400">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter your password" 
                      className="w-full bg-transparent text-sm p-3 md:p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder-gray-500" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {mode === 'signin' && (
                <div className="animate-element animate-delay-500 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2 sm:gap-0">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                    <span className="text-gray-300">Keep me signed in</span>
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} 
                    className="hover:underline text-gray-400 hover:text-white transition-colors"
                  >
                    Reset password
                  </a>
                </div>
              )}

              <button 
                type="submit" 
                className={`animate-element ${mode === 'signup' ? 'animate-delay-700' : 'animate-delay-600'} w-full rounded-2xl bg-white text-black py-3 md:py-4 font-medium hover:bg-gray-100 transition-colors text-sm md:text-base`}
              >
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className={`animate-element ${mode === 'signup' ? 'animate-delay-800' : 'animate-delay-700'} relative flex items-center justify-center`}>
              <span className="w-full border-t border-gray-700"></span>
              <span className="px-4 text-sm text-gray-400 bg-black absolute">Or continue with</span>
            </div>

            <button 
              onClick={onGoogleAuth} 
              disabled={loading}
              className={`animate-element ${mode === 'signup' ? 'animate-delay-900' : 'animate-delay-800'} w-full flex items-center justify-center gap-3 border border-gray-700 rounded-2xl py-3 md:py-4 hover:bg-gray-900/50 hover:border-gray-600 transition-all duration-300 text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <GoogleIcon />
              <span className="relative z-10">
                {loading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </button>

            <p className={`animate-element ${mode === 'signup' ? 'animate-delay-1000' : 'animate-delay-900'} text-center text-sm text-gray-400`}>
              {mode === 'signin' ? 'New to Stockly?' : 'Already have an account?'}{' '}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onToggleMode?.(); }} 
                className="text-white hover:underline transition-colors"
              >
                {mode === 'signin' ? 'Create Account' : 'Sign In'}
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:flex flex-1 relative p-4 min-h-screen">
          {/* Back to Home Button - Positioned in top-left corner of image for desktop */}
          <button
            onClick={onBackToHome}
            className="absolute top-8 left-8 z-20 flex items-center space-x-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-black/40 hover:border-white/30 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
            <span className="text-sm font-medium">Home</span>
          </button>

          <div 
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl  bg-center bg-no-repeat" 
            style={{ 
              backgroundImage: `url(${heroImageSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '100%'
            }}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-3xl" />
          </div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center z-10 ">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && (
                <div className="hidden xl:flex rounded-full ">
                  <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                </div>
              )}ˀ
              {testimonials[2] && (
                <div className="hidden 2xl:flex">
                  <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
