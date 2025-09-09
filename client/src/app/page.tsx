'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, GeneratedImage } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import PhotoHero from '@/components/photo_hero';
import Toolbar from '@/components/Toolbar';

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
    </div>
  );
}
