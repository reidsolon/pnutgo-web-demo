export const useApiClient = () => {
  const { token } = useAuthentication();
  const config = useRuntimeConfig();

  // Create authenticated API client
  const apiClient = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    headers: {
      Accept: 'application/json',
    },
    onRequest({ options }) {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        };
      }
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