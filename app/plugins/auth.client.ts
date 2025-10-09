export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuthentication();
  
  // Initialize authentication on app start
  await initAuth();
});