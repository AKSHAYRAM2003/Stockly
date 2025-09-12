'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { Search, Send, Command, Menu, X, SparklesIcon, ChevronDown, Settings, LogOut, User2Icon, Settings2 } from 'lucide-react';

interface NavbarProps {
  onCategoryChange?: (category: string) => void;
  onSearch?: (query: string) => void;
  onGenerate?: (query: string) => void;
  activeCategory?: string;
}

export default function Navbar({ onCategoryChange, onSearch, onGenerate, activeCategory = 'Photos' }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'search' | 'generate'>('generate');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('Navbar: Checking for access token:', !!token);

    if (token) {
      const fetchUser = async () => {
        try {
          const userData = await authService.getCurrentUser();
          console.log('Navbar: User data fetched:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Navbar: Failed to fetch user:', error);
          // Clear invalid token
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      };
      fetchUser();
    } else {
      console.log('Navbar: No access token found');
    }
  }, []);

  // Listen for storage changes (for OAuth login)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          // Token was added - fetch user
          const fetchUser = async () => {
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (error) {
              console.error('Failed to fetch user:', error);
            }
          };
          fetchUser();
        } else {
          // Token was removed - clear user
          setUser(null);
        }
      }
    };

    const handleAuthLogin = () => {
      // OAuth login completed - fetch user
      const fetchUser = async () => {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      };
      fetchUser();
    };

    const handleAuthLogout = () => {
      // User logged out - clear user state
      setUser(null);
    };

    const handleUserUpdated = (e: CustomEvent<User>) => {
      // User profile updated - update user state
      setUser(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-login', handleAuthLogin);
    window.addEventListener('auth-logout', handleAuthLogout);
    window.addEventListener('user-updated', handleUserUpdated as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-login', handleAuthLogin);
      window.removeEventListener('auth-logout', handleAuthLogout);
      window.removeEventListener('user-updated', handleUserUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchMode('search');
        setSearchQuery(''); // Clear any existing query
        // Focus the search input with a slight delay to ensure mode change is processed
        setTimeout(() => {
          const searchInputs = document.querySelectorAll('input[type="text"]');
          // Get the visible search input (not hidden by responsive design)
          const visibleInput = Array.from(searchInputs).find((input) => {
            const rect = (input as HTMLElement).getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          }) as HTMLInputElement;
          
          if (visibleInput) {
            visibleInput.focus();
            visibleInput.select(); // Select any existing text
          }
        }, 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleCategoryClick = (category: string) => {
    onCategoryChange?.(category);
    // Navigate to the appropriate page based on category
    if (category === 'Photos') {
      router.push('/');
    } else if (category === 'Interior') {
      router.push('/interior');
    } else if (category === '3D') {
      router.push('/3d');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchMode === 'generate') {
        if (user?.user_id) {
          // Check if onGenerate is available (user is on their own profile page)
          if (onGenerate) {
            // In-page generation - no redirect, just generate
            onGenerate(searchQuery);
            setSearchQuery(''); // Clear the search
          } else {
            // Redirect to profile page for generation
            router.push(`/profile/${user.user_id}?generating=true&prompt=${encodeURIComponent(searchQuery)}&tab=creations`);
            setSearchQuery(''); // Clear the search
          }
        } else {
          // User not logged in, redirect to signin
          router.push('/signin');
        }
      } else if (searchMode === 'search' && onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleProfile = () => {
    if (user?.user_id) {
      router.push(`/profile/${user.user_id}`);
    }
  };

  const handleViewProfile = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false); // Close mobile menu if open
    handleProfile();
  };

  const handleAccountSettings = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false); // Close mobile menu if open
    router.push('/account-settings');
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false); // Close mobile menu if open
    authService.logout();
    
    // Dispatch custom event to notify navbar of logout
    window.dispatchEvent(new CustomEvent('auth-logout'));
    
    router.push('/');
  };

  const focusSearchInput = () => {
    setTimeout(() => {
      const searchInputs = document.querySelectorAll('input[type="text"]');
      // Get the visible search input (not hidden by responsive design)
      const visibleInput = Array.from(searchInputs).find((input) => {
        const rect = (input as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }) as HTMLInputElement;
      
      if (visibleInput) {
        visibleInput.focus();
      }
    }, 100);
  };

  const getPlaceholder = () => {
    return searchMode === 'search' ? 'Search for anything' : 'Generate an image';
  };

  const getLeftIcon = () => {
    return searchMode === 'search' ? (
      <Search className="h-5 w-5" />
    ) : (
      <SparklesIcon className="h-5 w-5" />
    );
  };

  const categories = ['Photos', 'Interior', '3D'];

  return (
    <nav className="sticky top-0 z-50 bg-black border-gray-800 px-4 lg:px-8 py-4 font-inter mb-0">
      <div className="max-w-full mx-auto">
        {/* Desktop Layout (lg and above) */}
        <div className="hidden  lg:flex items-center justify-between">
          {/* Left section - Logo + Categories */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Stockly Logo"
                className="w-8 h-8 filter brightness-0 invert"
              />
              <span className="text-white font-bold text-xl italic">Stockly</span>
            </div>

            {/* Categories */}
            <div className="flex space-x-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative text-md font-medium transition-all duration-300 ${
                    activeCategory === category 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {category}
                  {activeCategory === category && (
                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-white rounded-full transition-all duration-300" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Center - Search Bar (Larger) */}
            <div className="flex-1 max-w-5xl mx-11">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative flex items-center  rounded-full border border-gray-700 focus-within:border-gray-600 focus-within:ring-2 focus-within:ring-gray-600/20 transition-all duration-300 h-12 shadow-lg">
              {/* Toggle Switcher with perfect sliding animation */}
              <div className="absolute left-1 z-20 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full p-0.5 shadow-inner overflow-hidden ">
                <div className="relative flex ">

                {/* Sliding background indicator - perfectly sized and positioned */}
                <div 
                  className={`absolute top-0 w-8 h-8 bg-neutral-300 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  searchMode === 'search' ? 'left-0' : 'left-8'
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => {
                  setSearchMode('search');
                  setSearchQuery('');
                  focusSearchInput();
                  }}
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  searchMode === 'search' 
                    ? 'text-black scale-105' 
                    : 'text-gray-400 hover:text-white scale-100'
                  }`}
                >
                  <Search className={`h-3 w-3 transition-all duration-300 ${
                  searchMode === 'search' ? 'scale-110' : 'scale-100'
                  }`} />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                  setSearchMode('generate');
                  setSearchQuery('');
                  focusSearchInput();
                  }}
                  className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                  searchMode === 'generate' 
                    ? 'text-black  scale-105' 
                    : 'text-gray-400 hover:text-white scale-100'
                  }`}
                >
                  <SparklesIcon className={`h-3 w-3 transition-all duration-300 ${
                  searchMode === 'generate' ? 'scale-110' : 'rotate-0 scale-100'
                  }`} />
                </button>
                </div>
              </div>

              {/* Input with perfect padding and alignment */}
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 pl-20 pr-24 py-5 text-base focus:outline-none rounded-full transition-all duration-300 leading-none"
              />

              {/* Right Side Icons */}
              <div className="absolute right-2 flex items-center space-x-3">
                {/* Command + K hint with animation */}
                {searchMode === 'search' && (
                <div className="flex items-center space-x-1.5 text-gray-500 text-xs bg-gradient-to-br from-neutral-700 to-neutral-800 px-2 py-1 rounded-full border border-neutral-500 animate-in fade-in slide-in-from-right-4 duration-300">
                  <Command className="h-3 w-3" />
                  <span className="font-medium">K</span>
                </div>
                )}

                {/* Send Button with animation - Always visible and rounded in generate mode */}
                {searchMode === 'generate' && (
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="p-2 bg-white text-black rounded-full hover:bg-gray-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 animate-in fade-in slide-in-from-right-2 shadow-md"
                >
                  <Send className="h-3 w-3" />
                </button>
                )}
              </div>
              </div>
            </form>
            </div>

          {/* Right section - Auth */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 text-white hover:text-gray-300 transition-all duration-300 group"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-gray-500 transition-colors duration-300"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-600 group-hover:border-gray-500 transition-colors duration-300">
                        <span className="text-white text-sm font-medium">
                          {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-base font-medium">Profile</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-black border border-gray-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-4 py-3 text-base md:text-lg lg:text-xl text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                      >
                        <span><User2Icon/></span>
                        <span>View profile</span>
                      </button>
                      <button
                        onClick={handleAccountSettings}
                        className="w-full text-left px-4 py-3 text-base md:text-lg lg:text-xl text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                      >
                        <span><Settings/></span>
                        <span>Account settings</span>
                      </button>
                      <div className="border-t border-gray-700 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-base md:text-lg lg:text-xl text-gray-400 hover:text-white hover:bg-gray-800  transition-colors flex items-center space-x-3"
                      >
                        <span><LogOut/></span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-5 text-md">
                <button
                  onClick={handleSignup}
                  className="text-white  font-medium hover:text-gray-300 transition-colors"
                >
                  Sign up
                </button>
                <button
                  onClick={handleLogin}
                  className="text-white  font-medium hover:text-gray-300 transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tablet Layout (md to lg) */}
        <div className="hidden md:flex lg:hidden flex-col space-y-4">
          {/* First Row - Logo, Search, Auth */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Stockly Logo"
                className="w-8 h-8 filter brightness-0 invert"
              />
              <span className="text-white font-bold text-xl italic">Stockly</span>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center rounded-full border border-gray-700 focus-within:border-gray-600 focus-within:ring-2 focus-within:ring-gray-600/20 transition-all duration-300 h-12 shadow-md">

                  <div className="absolute left-1 z-20 bg-gray-800 rounded-full p-1 bg-gradient-to-br from-neutral-700 to-neutral-800 shadow-inner overflow-hidden">
                    <div className="relative flex">
                      {/* Sliding background indicator - perfectly sized and positioned */}
                      <div 
                        className={`absolute top-0 w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'search' ? 'left-0' : 'left-8'
                        }`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode('search');
                          setSearchQuery('');
                          focusSearchInput();
                        }}
                        className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'search' 
                            ? 'text-black scale-105' 
                            : 'text-gray-400 hover:text-white scale-100'
                        }`}
                      >
                        <Search className={`h-3.5 w-3.5 transition-all duration-300 ${
                          searchMode === 'search' ? 'scale-110' : 'scale-100'
                        }`} />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode('generate');
                          setSearchQuery('');
                          focusSearchInput();
                        }}
                        className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'generate' 
                            ? 'text-black scale-105' 
                            : 'text-gray-400 hover:text-white scale-100'
                        }`}
                      >
                        <SparklesIcon className={`h-3.5 w-3.5 transition-all duration-300 ${
                          searchMode === 'generate' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-400 pl-24 pr-20 py-3 text-sm focus:outline-none rounded-full leading-none"
                  />

                  <div className="absolute right-2 flex items-center space-x-2 ">
                    {searchMode === 'search' && (
                      <div className="flex items-center space-x-1 text-gray-500 text-xs bg-gradient-to-br from-neutral-700 to-neutral-800 px-3 py-2 rounded-full  border border-neutral-700 animate-in fade-in duration-300 ">
                        <Command className="h-2.5 w-2.5" />
                        <span className="font-medium">K</span>
                      </div>
                    )}
                    {searchMode === 'generate' && (
                      <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className="p-2 bg-white text-black rounded-full hover:bg-gray-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-md"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Auth buttons - Always visible on tablet */}
            <div className="flex items-center flex-shrink-0">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center space-x-3 text-white hover:text-gray-300 transition-all duration-300 group"
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-gray-500 transition-colors duration-300"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-600 group-hover:border-gray-500 transition-colors duration-300">
                          <span className="text-white text-sm font-medium">
                            {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-base font-medium">Profile</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-black border border-gray-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                        <button
                          onClick={handleViewProfile}
                          className="w-full text-left px-4 py-3 text-base text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                        >
                          <User2Icon className="w-4 h-4" />
                          <span>View profile</span>
                        </button>
                        <button
                          onClick={handleAccountSettings}
                          className="w-full text-left px-4 py-3 text-base text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Account settings</span>
                        </button>
                        <div className="border-t border-gray-700 my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-base text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center space-x-3"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSignup}
                    className="text-white text-base font-medium hover:text-gray-300 transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={handleLogin}
                    className="text-white text-base font-medium hover:text-gray-300 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Second Row - Categories */}
          <div className="flex space-x-8 justify-left border-gray-800 ">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`relative text-sm font-medium transition-all duration-300 ${
                  activeCategory === category 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {category}
                {activeCategory === category && (
                  <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-white rounded-full transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row - Logo, Search Bar, and Auth */}
          <div className="flex items-center justify-between space-x-3">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Stockly Logo"
                className="w-6 h-6 filter brightness-0 invert"
              />
              <span className="text-white font-bold text-base italic hidden xs:block">Stockly</span>
            </div>

            {/* Search Bar - Flexible width */}
            <div className="flex-1 max-w-xs mx-2">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center rounded-full border border-gray-700 focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600/20 transition-all duration-300 h-10 shadow-sm">
                  <div className="absolute left-1 z-20 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full p-0.5 shadow-inner overflow-hidden">
                    <div className="relative flex">
                      {/* Sliding background indicator */}
                      <div 
                        className={`absolute top-0 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'search' ? 'left-0' : 'left-6'
                        }`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode('search');
                          setSearchQuery('');
                          focusSearchInput();
                        }}
                        className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'search' 
                            ? 'text-black scale-105' 
                            : 'text-gray-400 hover:text-white scale-100'
                        }`}
                      >
                        <Search className={`h-2.5 w-2.5 transition-all duration-300 ${
                          searchMode === 'search' ? 'scale-110' : 'scale-100'
                        }`} />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode('generate');
                          setSearchQuery('');
                          focusSearchInput();
                        }}
                        className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'generate' 
                            ? 'text-black scale-105' 
                            : 'text-gray-400 hover:text-white scale-100'
                        }`}
                      >
                        <SparklesIcon className={`h-2.5 w-2.5 transition-all duration-300 ${
                          searchMode === 'generate' ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-400 pl-14 pr-12 py-2 text-sm focus:outline-none rounded-full leading-none"
                  />

                  <div className="absolute right-2 flex items-center">
                    {searchMode === 'generate' && (
                      <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className="p-1.5 bg-white text-black rounded-full hover:bg-gray-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-sm"
                      >
                        <Send className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Auth Section - Login or Avatar only */}
            <div className="flex items-center flex-shrink-0">
              {user ? (
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center text-white hover:text-gray-300 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-gray-600"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center border border-gray-500">
                        <span className="text-white text-xs font-medium">
                          {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                  
                  {/* Mobile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-48 bg-black border border-gray-700 rounded-lg shadow-xl py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                      <button
                        onClick={handleViewProfile}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                      >
                        <User2Icon className="w-4 h-4" />
                        <span>View profile</span>
                      </button>
                      <button
                        onClick={handleAccountSettings}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-neutral-800 transition-colors flex items-center space-x-3"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account settings</span>
                      </button>
                      <div className="border-t border-gray-700 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-white text-sm font-medium hover:text-gray-300 transition-colors px-3 py-1.5 border border-gray-600 rounded-full hover:border-gray-500"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Second Row - Categories */}
          <div className="mt-3 flex space-x-4 justify-start overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`relative text-sm font-medium transition-all duration-300 whitespace-nowrap px-2 py-1 ${
                  activeCategory === category 
                    ? 'text-white' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {category}
                {activeCategory === category && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full transition-all duration-300" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
