'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, GeneratedImage } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function GalleryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Photos');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userData, imagesData] = await Promise.all([
          authService.getCurrentUser(),
          api.get('/api/images/history').then(res => res.data),
        ]);
        setUser(userData);
        setImages(imagesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredImages = images.filter(image =>
    image.category === category &&
    (searchQuery === '' ||
     image.original_prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
     image.enhanced_prompt?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onCategoryChange={handleCategoryChange} onSearch={handleSearch} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Your Gallery</h2>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate New Image
            </button>
          </div>

          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                {searchQuery ? 'No images found matching your search.' : 'No images generated yet.'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate Your First Image
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors">
                  <div className="aspect-w-1 aspect-h-1">
                    {image.image_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={image.original_prompt}
                        className="w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-300 mb-2">{image.original_prompt}</p>
                    {image.enhanced_prompt && (
                      <p className="text-xs text-gray-500 mb-2">
                        Enhanced: {image.enhanced_prompt}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = image.image_urls[0];
                          link.download = `stockly-${image.id}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
