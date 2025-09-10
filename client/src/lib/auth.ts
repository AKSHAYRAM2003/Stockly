import api from './api';

export interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  avatar_url?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface GeneratedImage {
  id: string;
  original_prompt: string;
  enhanced_prompt?: string;
  image_urls: string[];
  category?: string;
  created_at: string;
  user_id: string;
  is_deleted: boolean;
}

export const authService = {
  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    const response = await api.get('/api/auth/google/url');
    return response.data;
  },

  async handleGoogleCallback(code: string): Promise<AuthTokens> {
    const response = await api.post('/api/auth/google/callback', { code });
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    const response = await api.post('/api/auth/register', { 
      email, 
      password, 
      first_name: firstName,
      last_name: lastName
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async getUserByUserId(userId: string): Promise<User> {
    const response = await api.get(`/api/auth/user/${userId}`);
    return response.data;
  },

  async updateUser(updates: Partial<Pick<User, 'first_name' | 'last_name' | 'name' | 'avatar_url'>>): Promise<User> {
    const response = await api.put('/api/auth/me', updates);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },
};

export const imageService = {
  async generateImages(prompt: string, category?: string): Promise<GeneratedImage> {
    const formData = new FormData();
    formData.append('prompt', prompt);
    if (category) {
      formData.append('category', category);
    }

    const response = await api.post('/api/images/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getImageHistory(skip: number = 0, limit: number = 50): Promise<GeneratedImage[]> {
    const response = await api.get(`/api/images/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/api/images/${imageId}`);
  },
};
