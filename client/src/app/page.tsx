'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, GeneratedImage } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import PhotoHero from '@/components/photo_hero';
import Toolbar from '@/components/Toolbar';

// Placeholder images for the grid - using Unsplash AI-generated images
const placeholderImages = [
  'https://plus.unsplash.com/premium_photo-1721994124206-72a30b904249?q=80&w=776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1757252872535-01668694fb44?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=550&fit=crop',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&h=450&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=550&fit=crop',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&h=450&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=550&fit=crop',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&h=450&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
  'https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=400&h=500&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=550&fit=crop',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=400&h=450&fit=crop',
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('Photos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [featuredImages, setFeaturedImages] = useState<GeneratedImage[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      // Don't redirect to login, just show public content
      fetchFeaturedImages();
      return;
    }

    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        fetchUserImages();
      } catch (error) {
        console.error('Failed to fetch user:', error);
        fetchFeaturedImages();
      }
    };

    fetchUser();
  }, [router]);

  const fetchUserImages = async () => {
    try {
      const response = await api.get('/api/images/history');
      setImages(response.data);
    } catch (error) {
      console.error('Failed to fetch user images:', error);
    }
  };

  const fetchFeaturedImages = async () => {
    // For demo purposes, we'll show some placeholder images
    // In a real app, this would fetch from a public API
    setFeaturedImages([
      {
        id: '1',
        original_prompt: 'Beautiful sunset over mountains',
        enhanced_prompt: 'Stunning landscape with vibrant colors',
        image_urls: ['https://picsum.photos/400/300?random=1'],
        category: 'Photos',
        created_at: new Date().toISOString(),
        user_id: 'demo',
        is_deleted: false
      },
      {
        id: '2',
        original_prompt: 'Abstract geometric patterns',
        enhanced_prompt: 'Modern art with clean lines',
        image_urls: ['https://picsum.photos/400/300?random=2'],
        category: 'Illustrations',
        created_at: new Date().toISOString(),
        user_id: 'demo',
        is_deleted: false
      },
      {
        id: '3',
        original_prompt: 'Tech startup icon',
        enhanced_prompt: 'Minimalist app icon design',
        image_urls: ['https://picsum.photos/400/300?random=3'],
        category: 'Icons',
        created_at: new Date().toISOString(),
        user_id: 'demo',
        is_deleted: false
      }
    ]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/api/images/generate', {
        prompt,
        category: category || undefined,
      });
      const newImage = response.data;
      setImages([newImage, ...images]);
      setPrompt('');
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality here
    console.log('Searching for:', query);
  };

  const filteredImages = images.filter(image =>
    image.category === category &&
    (searchQuery === '' ||
     image.original_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
     image.enhanced_prompt?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const displayImages = user ? filteredImages : featuredImages.filter(img => img.category === category);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <PhotoHero onSearch={handleSearch} />
      <Toolbar/>

      {/* Image Showcase Grid */}
      <div className="container mx-auto px-4 py-12 max-w-full overflow-hidden">
        {/* <h2 className="text-2xl font-semibold mb-6 text-center">Explore AI-Generated Images</h2> */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {placeholderImages.map((src, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`AI Generated Image ${index + 1}`}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-sm font-medium">AI Generated</p>
                  <p className="text-xs opacity-80">Image {index + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
