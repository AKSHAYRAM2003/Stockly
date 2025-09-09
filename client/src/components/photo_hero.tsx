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
      {/* <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black to-gray-900/50" /> */}
      <div className="absolute" />
      
    <div className="relative z-10 container pl-2 py-2 md:py-1">
      {/* Search Bar */}
     

      {/* Hero Text */}
      <div className="text-left">

        <h1 className="text-[9.6vw] leading-[10vw] font-semibold md:text-[9.7vw] whitespace-nowrap mt-2 mb-1 text-center">
        no more boring Images
        </h1>
        <p className="text-left lg:text-[1.5vw] md:text-[1.5vw] sm:text-[1.1vw] mb-3 ml-2">
        Create or use stunning AI-generated images and transform your creative vision.
        </p>
      </div>
    </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
    </div>
    
  );
}

