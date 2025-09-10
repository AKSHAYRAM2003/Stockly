'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { authService, User, GeneratedImage, imageService } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { Camera, Settings, ChevronDown, Filter, Wand2, Eraser } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [activeTab, setActiveTab] = useState('Images');
  const [selectedTool, setSelectedTool] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const router = useRouter();
  const params = useParams();
  const userId = params.user_id as string;
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
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
  }, [router, userId]);

  useEffect(() => {
    const fetchImages = async () => {
      if (currentUser && currentUser.user_id === userId) {
        try {
          const userImages = await imageService.getImageHistory();
          setImages(userImages);
        } catch (error) {
          console.error('Failed to fetch images:', error);
          showToast('error', 'Failed to Load Images', 'We couldn\'t load your images. Please refresh the page to try again.');
        }
      }
    };

    fetchImages();
  }, [currentUser, userId, showToast]);

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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
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
              <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors">
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
            {['Creations','Edits'].map((tab) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.length > 0 ? images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                <img 
                  src={image.image_urls[0]} 
                  alt={image.original_prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                Generation
              </div>
            </div>
          )) : (
            <p className="col-span-full text-center text-gray-400 text-xl font-bold">
              {isOwnProfile ? 'No images yet. Start generating!' : 'No public images available.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
