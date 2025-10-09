<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="w-full max-w-md">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 mb-6 shadow-xl">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-3">
          Welcome to PnutGo
        </h1>
        <p class="text-gray-600 text-lg">
          Discover and collect companions in the real world
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/40 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Email or Phone
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your email or phone number"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your password"
              :disabled="loading"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-200">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span class="text-sm text-red-700">{{ error }}</span>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading || !form.username || !form.password"
            class="w-full py-3 px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div class="flex items-center justify-center">
              <svg
                v-if="loading"
                class="w-5 h-5 mr-2 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            </div>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p class="text-sm text-blue-700 mb-2 font-medium">Demo Credentials:</p>
          <div class="space-y-1 text-xs text-blue-600">
            <p><strong>Email:</strong> user@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Simple reactive data without TypeScript
const form = reactive({
  username: 'user@example.com',  // Pre-filled for demo
  password: 'password123'        // Pre-filled for demo
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always succeed
    await navigateTo('/app');
  } catch (err) {
    error.value = 'Login failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>