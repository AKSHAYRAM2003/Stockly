'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { Camera, Save, X, User as UserIcon } from 'lucide-react';

export default function AccountSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    avatar_url: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setFormData({
          first_name: userData.first_name,
          last_name: userData.last_name,
          avatar_url: userData.avatar_url || ''
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates: Partial<User> = {};
      if (formData.first_name !== user?.first_name) updates.first_name = formData.first_name;
      if (formData.last_name !== user?.last_name) updates.last_name = formData.last_name;
      if (formData.avatar_url !== (user?.avatar_url || '')) updates.avatar_url = formData.avatar_url || undefined;

      if (Object.keys(updates).length > 0) {
        const updatedUser = await authService.updateUser(updates);
        setUser(updatedUser);
        // Dispatch custom event to update navbar
        window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedUser }));
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just set a placeholder URL. In a real app, you'd upload to a service
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

          {/* Profile Picture Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">
                  Upload a new profile picture. Max size: 5MB
                </p>
                <p className="text-gray-500 text-xs">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors ${
                    errors.first_name ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors ${
                    errors.last_name ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg cursor-not-allowed opacity-60"
              />
              <p className="text-gray-500 text-sm mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
