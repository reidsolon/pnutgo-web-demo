export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuthentication();

  // If authenticated and trying to access guest-only route (like login)
  if (isAuthenticated.value) {
    return navigateTo('/map');
  }
});