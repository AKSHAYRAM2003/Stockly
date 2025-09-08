'use client';

import { useState } from 'react';

interface PhotoHeroProps {
  onSearch?: (query: string) => void;
}

export default function PhotoHero({ onSearch }: PhotoHeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <div className="relative bg-black text-white overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50" />
      
      <div className="relative z-10 container mx-auto px-2 py-3 md:py-2">
        {/* Search Bar */}
        {/* <div className="flex justify-center mb-16">
          <div className="relative w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for anything"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-16 py-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-3">
                <div className="flex items-center space-x-1 text-gray-400 text-xs">
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/50 rounded border border-gray-600">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 text-xs bg-gray-700/50 rounded border border-gray-600">K</kbd>
                </div>
                <button type="button" className="p-1 text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div> */}

        {/* Hero Text */}
        <div className="text-center">
          <h1 className="text-[9.6vw] tracking-tight leading-[10vw] font-semibold md:text-[9.8vw] whitespace-nowrap">
            no more boring design
          </h1>
          <p className="text-body text-muted-foreground md:text-lead md:text-foreground">
            Create stunning AI-generated images and transform your creative vision. 
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
    </div>
    
  );
}
