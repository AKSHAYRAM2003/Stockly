'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService, User, GeneratedImage, imageService } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import { Camera, Settings, ChevronDown, Filter, Wand2, Eraser } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [activeTab, setActiveTab] = useState('Creations');
  const [selectedTool, setSelectedTool] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [generating, setGenerating] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState('');
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.user_id as string;
  const { showToast } = useToast();

  // Handle in-page image generation (when user is already on profile page)
  const handleInPageGeneration = async (prompt: string) => {
    if (!currentUser || currentUser.user_id !== userId) {
      return; // Not authorized to generate on this profile
    }

    try {
      console.log('Starting in-page image generation for prompt:', prompt);
      
      // Set generating state without URL changes
      setGenerating(true);
      setGeneratingPrompt(prompt);
      setActiveTab('Creations'); // Switch to creations tab

      // Start background generation
      const newImage = await imageService.generateImages(prompt, 'Photos');
      console.log('In-page image generated successfully:', newImage);
      
      // Add the new image to the list
      setImages(prevImages => [newImage, ...prevImages]);
      
      // Stop generating state
      setTimeout(() => {
        setGenerating(false);
        showToast('success', 'Image Generated!', 'Your AI-generated image is ready.');
        setGeneratingPrompt(''); // Clear the prompt
      }, 800);
    } catch (error) {
      console.error('Error in in-page generation:', error);
      setGenerating(false);
      setGeneratingPrompt('');
      showToast('error', 'Generation Failed', 'Failed to generate your image. Please try again.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Check if generating - set state immediately for instant UI update
        const isGenerating = searchParams.get('generating') === 'true';
        const promptFromUrl = searchParams.get('prompt') || '';
        const tabFromUrl = searchParams.get('tab') || '';
        
        // Set generating state immediately if redirected from navbar
        if (isGenerating && promptFromUrl) {
          setGenerating(true);
          setGeneratingPrompt(promptFromUrl);
        }
        
        // Set active tab if specified in URL
        if (tabFromUrl === 'creations') {
          setActiveTab('Creations');
        }

        // Fetch the profile user
        const profileUser = await authService.getUserByUserId(userId);
        setUser(profileUser);

        // Check if logged in
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const currentUserData = await authService.getCurrentUser();
            setCurrentUser(currentUserData);
          } catch (error) {
            // Not logged in or invalid token
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // User not found, redirect to home or show error
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [router, userId, searchParams]);

  useEffect(() => {
    const fetchImages = async () => {
      // Check if user is authenticated and this is their profile
      if (!currentUser || currentUser.user_id !== userId) {
        console.log('Not fetching images - user not authenticated or not owner');
        return;
      }

      try {
        console.log('Fetching images for current user');
        const userImages = await imageService.getImageHistory();
        console.log('Fetched images:', userImages.length);
        setImages(userImages);
      } catch (error) {
        console.error('Failed to fetch images:', error);
        setImages([]);
        showToast('error', 'Error', 'Failed to load your images.');
      }
    };

    fetchImages();
  }, [userId, currentUser, showToast]);

  // Handle image generation when redirected with prompt - separate from image fetching
  useEffect(() => {
    const handleImageGeneration = async () => {
      if (generating && generatingPrompt && currentUser && currentUser.user_id === userId) {
        // Skip if we're already in the middle of in-page generation
        if (searchParams.get('generating') !== 'true') {
          return; // This is in-page generation, already handled
        }

        try {
          console.log('Starting background image generation for prompt:', generatingPrompt);
          
          // Use the imageService for consistency
          const newImage = await imageService.generateImages(generatingPrompt, 'Photos');
          console.log('Image generated successfully:', newImage);
          
          // Add the new image to the list
          setImages(prevImages => [newImage, ...prevImages]);
          
          // Stop generating state and clean up URL
          setTimeout(() => {
            setGenerating(false);
            showToast('success', 'Image Generated!', 'Your AI-generated image is ready.');
            
            // Clean up URL parameters after generation
            const url = new URL(window.location.href);
            url.searchParams.delete('generating');
            url.searchParams.delete('prompt');
            url.searchParams.delete('tab');
            window.history.replaceState({}, '', url.toString());
          }, 800);
        } catch (error) {
          console.error('Error generating image:', error);
          setGenerating(false);
          showToast('error', 'Generation Failed', 'Failed to generate your image. Please try again.');
        }
      }
    };

    // Start generation immediately if parameters are present
    if (generating && generatingPrompt && currentUser && searchParams.get('generating') === 'true') {
      handleImageGeneration();
    }
  }, [generating, generatingPrompt, currentUser, userId, showToast, searchParams]);

  const handleLogout = () => {
    authService.logout();
    
    // Dispatch custom event to notify navbar of logout
    window.dispatchEvent(new CustomEvent('auth-logout'));
    
    router.push('/');
  };

  const isOwnProfile = currentUser && currentUser.user_id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white">
        <Navbar onGenerate={isOwnProfile ? handleInPageGeneration : undefined} />
        
        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-6 mb-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold ">
                    {user.first_name[0]}{user.last_name[0]}
                  </span>
                )}
              </div>
              {/* Camera Icon Overlay - only show if own profile */}
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.first_name} {user.last_name}</h1>
              {isOwnProfile && (
                <Link href="/account-settings">
                  <button className="px-4 py-2 border-2 border-neutral-500 rounded-3xl hover:bg-neutral-700 transition-colors flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Account Settings</span>
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-700 mb-6">
            <div className="flex space-x-8">
              {['Creations', 'Edits'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 relative ${
                    activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar - only show for own profile */}
          {/* {isOwnProfile && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                  <span>Tools</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                  <Filter className="w-4 h-4" />
                  <span>Type of image</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Wand2 className="w-4 h-4" />
                <span>Reframe</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                <Eraser className="w-4 h-4" />
                <span>Background removal</span>
              </button>
            </div>
          )} */}

          {/* Gallery Section */}
          {activeTab === 'Creations' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {/* Show single shimmer placeholder when generating */}
                {generating && (
                  <div key="generating-shimmer" className="relative group">
                    <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative shadow-lg">
                      {/* Base background with subtle gradient */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"></div>
                      {/* Shimmer overlay - improved animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer -skew-x-12"></div>
                      {/* Subtle grid pattern overlay */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 8px, white 8px, white 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, white 8px, white 9px)`
                      }}></div>
                    </div>
                    {/* Generating label with improved styling */}
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium text-white border border-gray-700">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span>Generating</span>
                      </div>
                    </div>
                    {/* Show prompt on hover with improved styling */}
                    {generatingPrompt && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <p className="text-white text-sm line-clamp-2 font-medium leading-relaxed">
                          "{generatingPrompt}"
                        </p>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          <span className="text-gray-400 text-xs ml-1">AI is creating your image</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Show existing images */}
                {images.length > 0 ? images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={image.image_urls[0]} 
                        alt={image.original_prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log('Image failed to load:', target.src);
                          // Try next image URL if available
                          if (image.image_urls.length > 1 && !target.src.includes('fallback')) {
                            const currentIndex = image.image_urls.findIndex(url => url === target.src);
                            const nextIndex = (currentIndex + 1) % image.image_urls.length;
                            target.src = image.image_urls[nextIndex] + '&fallback=1';
                          } else if (!target.src.includes('picsum.photos')) {
                            // Final fallback to picsum
                            target.src = `https://picsum.photos/512x512?random=${image.id.slice(-8)}`;
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', image.image_urls[0]);
                        }}
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                      AI Generated
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm line-clamp-2 mb-1">{image.original_prompt}</p>
                      {image.enhanced_prompt && image.enhanced_prompt !== image.original_prompt && (
                        <p className="text-gray-300 text-xs line-clamp-2 opacity-80">
                          Enhanced: {image.enhanced_prompt}
                        </p>
                      )}
                    </div>
                  </div>
                )) : !generating && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400 text-xl mb-4">
                      {isOwnProfile ? 'No creations yet' : 'No public images available'}
                    </p>
                    <p className="text-gray-500">
                      {isOwnProfile ? 'Start generating amazing images!' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Edits' && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-xl">Edits feature coming soon</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
