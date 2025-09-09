'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import { Search, Send, Command, Menu, X, SparklesIcon } from 'lucide-react';

interface NavbarProps {
  onCategoryChange?: (category: string) => void;
  onSearch?: (query: string) => void;
}

export default function Navbar({ onCategoryChange, onSearch }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Photos');
  const [searchMode, setSearchMode] = useState<'search' | 'generate'>('search');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const fetchUser = async () => {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      };
      fetchUser();
    }
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

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim() && searchMode === 'generate') {
      onSearch(searchQuery);
    }
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
  };

  const handleProfile = () => {
    router.push('/profile');
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

  const categories = ['Photos', 'Illustrations', '3D'];

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
                  searchMode === 'generate' ? 'fill-yellow-700' : 'rotate-0 scale-100'
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
                  className="p-2 bg-white text-black rounded-full hover:bg-gray-100 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 animate-in fade-in slide-in-from-right-2 shadow-md"
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
                <button
                  onClick={handleProfile}
                  className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm">Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Log out
                </button>
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
                          searchMode === 'generate' ? 'fill-yellow-400 rotate-12 scale-110' : 'rotate-0 scale-100'
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
                        className="p-2 bg-white text-black rounded-full hover:bg-gray-100 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-md"
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
                  <button
                    onClick={handleProfile}
                    className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSignup}
                    className="text-white text-sm font-medium hover:text-gray-300 transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={handleLogin}
                    className="text-white text-sm font-medium hover:text-gray-300 transition-colors"
                  >
                    Log in
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
          {/* Top Row - Logo, Search Bar, and Hamburger */}
          <div className="flex items-center justify-between space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Stockly Logo"
                className="w-7 h-7 filter brightness-0 invert"
              />
              <span className="text-white font-bold text-lg italic hidden xs:block">Stockly</span>
            </div>

            {/* Search Bar - Flexible width */}
            <div className="flex-1 max-w-sm">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center  rounded-full border border-gray-700 focus-within:border-gray-600 focus-within:ring-1 focus-within:ring-gray-600/20 transition-all duration-300 h-11 shadow-sm">
                  <div className="absolute left-1 z-20 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full p-0.5 shadow-inner overflow-hidden">
                    <div className="relative flex">
                      {/* Sliding background indicator - perfectly sized and positioned */}
                      <div 
                        className={`absolute top-0 w-7 h-7 bg-white rounded-full shadow-sm transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'search' ? 'left-0' : 'left-7'
                        }`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSearchMode('search');
                          setSearchQuery('');
                          focusSearchInput();
                        }}
                        className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
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
                        className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                          searchMode === 'generate' 
                            ? 'text-black scale-105' 
                            : 'text-gray-400 hover:text-white scale-100'
                        }`}
                      >
                        <SparklesIcon className={`h-3 w-3 transition-all duration-300 ${
                          searchMode === 'generate' ? 'fill-yellow-400 rotate-12 scale-110' : 'rotate-0 scale-100'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-400 pl-18 pr-14 py-2.5 text-sm focus:outline-none rounded-full leading-none"
                  />

                  <div className="absolute right-2.5 flex items-center">
                    {searchMode === 'generate' && (
                      <button
                        type="submit"
                        disabled={!searchQuery.trim()}
                        className="p-1.5 bg-white text-black rounded-full hover:bg-gray-100 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-sm"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Hamburger Menu */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Second Row - Categories */}
          <div className="mt-4 flex space-x-6 justify-start">
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
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white rounded-full transition-all duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Auth Section - Collapsible */}
          {mobileMenuOpen && (
            <div className="mt-4 pt-4 border-t border-gray-800 animate-in slide-in-from-top-2 duration-200">
              {user ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      handleProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm">Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => {
                      handleSignup();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300 transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={() => {
                      handleLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white text-sm font-medium hover:text-gray-300 transition-colors"
                  >
                    Log in
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
