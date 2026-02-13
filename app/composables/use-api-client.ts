export const useApiClient = () => {
  const { token } = useAuthentication();
  const config = useRuntimeConfig();

  // Create authenticated API client
  const apiClient = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onRequest({ options }) {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'X-App-Key': (config.public.appApiKey as string) || '',
        'X-App-Secret': (config.public.appApiSecret as string) || '',
      };

      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`;
      }

      options.headers = headers;
    },
    onResponseError({ response, error }) {
      // Handle 401 unauthorized
      if (response.status === 401) {
        const { logout } = useAuthentication();
        logout();
      }
      
      console.error('API Error:', error);
    }
  });

  return {
    apiClient
  };
};