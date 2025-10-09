export interface User {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  avatar_permanent_url?: string;
  avatar_permanent_thumb_url?: string;
  verified: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
    token_type: string;
    expires_in: string;
    user: User;
  };
}

export const useAuthentication = () => {
  // Simple reactive state management without complex auto-imports
  const user = useState<User | null>('auth.user', () => null);
  const token = useState<string | null>('auth.token', () => null);
  const loading = useState<boolean>('auth.loading', () => false);
  const error = useState<string | null>('auth.error', () => null);

  const config = useRuntimeConfig();

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<LoginResponse>('/auth/login', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        body: credentials
      });

      if (response.data) {
        token.value = response.data.access_token;
        user.value = response.data.user;
        
        // Store token in cookie for persistence
        const tokenCookie = useCookie('auth-token', {
          default: () => null,
          maxAge: 60 * 60 * 24 * 7, // 7 days
          secure: true,
          sameSite: 'strict'
        });
        tokenCookie.value = token.value;

        await navigateTo('/map');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      error.value = err.data?.message || 'Login failed. Please try again.';
      user.value = null;
      token.value = null;
    } finally {
      loading.value = false;
    }
  };

  // Logout function
  const logout = async () => {
    loading.value = true;

    try {
      if (token.value) {
        await $fetch('/auth/logout', {
          baseURL: config.public.apiBaseUrl,
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user data regardless of API call success
      user.value = null;
      token.value = null;
      
      // Clear cookie
      const tokenCookie = useCookie('auth-token');
      tokenCookie.value = null;
      
      loading.value = false;
      
      await navigateTo('/login');
    }
  };

  // Initialize auth from stored token
  const initAuth = async () => {
    const tokenCookie = useCookie('auth-token');
    
    if (tokenCookie.value && !user.value) {
      token.value = tokenCookie.value;
      
      try {
        const userData = await $fetch<User>('/auth/me', {
          baseURL: config.public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });
        
        user.value = userData;
      } catch (err) {
        console.error('Failed to get user data:', err);
        // Clear invalid token
        token.value = null;
        tokenCookie.value = null;
      }
    }
  };

  return {
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    error: readonly(error),
    isAuthenticated,
    login,
    logout,
    initAuth
  };
};