'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ImageGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export default function ImageGallery({ images, onImageClick }: ImageGalleryProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (index: number) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleLike = (index: number) => {
    setLiked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelected(new Set(images.map((_, i) => i)));
  };

  const handleDeselect = () => {
    setSelected(new Set());
  };

  const handleDownload = () => {
    // Placeholder for download logic
    console.log('Download selected images:', Array.from(selected));
  };

  const handleMenuItem = (action: string, index: number) => {
    console.log(`${action} for image ${index}`);
    setDropdownOpen(null);
  };

  const handleDownloadSingle = (src: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = `image-${Date.now()}.jpg`;
    link.click();
  };

  const isSelected = (index: number) => selected.has(index);
  const isLiked = (index: number) => liked.has(index);

  return (
    <div className="w-full max-w-full overflow-hidden relative">
      {/* Action Bar */}
      {selected.size > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-white text-sm">{selected.size} selected</span>
            <button
              onClick={handleDownload}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Download
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-white hover:text-gray-300 px-3 py-1 rounded text-sm transition-colors"
            >
              Select all
            </button>
            <button
              onClick={handleDeselect}
              className="text-white hover:text-gray-300 px-3 py-1 rounded text-sm transition-colors"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      <div className={`columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 ${selected.size > 0 ? 'pt-20' : ''}`}>
        {images.map((src, index) => (
          <div
            key={index}
            className="relative group overflow-hidden rounded-2xl bg-gray-900/20 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/70 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 break-inside-avoid mb-4 md:mb-6 cursor-pointer"
            onClick={() => !dropdownOpen && onImageClick?.(index)}
          >
            <div className="w-full overflow-hidden rounded-2xl relative">
              <img
                src={src}
                alt={`Gallery Image ${index + 1}`}
                loading="lazy"
                className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
              />
              {/* Selection Overlay */}
              {isSelected(index) && (
                <div className="absolute inset-0 bg-blue-500/50 flex items-center justify-center rounded-2xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Sparkle Icon with Tooltip */}
            <div className="absolute top-3 right-12 group/sparkle opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-lg transition-colors z-10">
                ✨
              </button>
              <div className="absolute top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover/sparkle:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                Use to create
              </div>
            </div>

            {/* Like Button */}
            <button
              className="absolute top-3 right-[84px] w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-lg transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); handleLike(index); }}
            >
              {isLiked(index) ? '❤️' : '🤍'}
            </button>

            {/* 3-dot Menu Button */}
            <button
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-lg transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(dropdownOpen === index ? null : index);
              }}
            >
              ⋮
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen === index && (
              <div
                ref={dropdownRef}
                className="absolute top-12 right-3 bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg z-20 min-w-[160px]"
              >
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                    onClick={() => handleMenuItem('Add to collection', index)}
                  >
                    Add to collection
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      handleSelect(index);
                      setDropdownOpen(null);
                    }}
                  >
                    Select
                  </button>
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              className="absolute bottom-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); handleDownloadSingle(src); }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
