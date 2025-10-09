<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 mb-6 shadow-xl">
          <Icon name="heroicons:map" class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold gradient-text mb-3">Welcome to PnutGo</h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Discover and collect companions in the real world
        </p>
      </div>

      <!-- Login Form -->
      <div class="glass-strong rounded-2xl p-8 shadow-2xl">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email or Phone
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter your email or phone number"
              :disabled="loading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter your password"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="loading"
              >
                <Icon
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                />
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center">
              <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-red-500 mr-2" />
              <span class="text-sm text-red-700 dark:text-red-400">{{ error }}</span>
            </div>
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            :disabled="loading || !form.username || !form.password"
            class="w-full btn-gradient disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div class="flex items-center justify-center">
              <Icon
                v-if="loading"
                name="heroicons:arrow-path"
                class="w-5 h-5 mr-2 animate-spin"
              />
              <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            </div>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-700 dark:text-blue-400 mb-2 font-medium">Demo Credentials:</p>
          <div class="space-y-1 text-xs text-blue-600 dark:text-blue-300">
            <p><strong>Email:</strong> user@example.com</p>
            <p><strong>Password:</strong> password123</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
});

const { login, loading, error } = useAuthentication();

const form = reactive({
  username: '',
  password: ''
});

const showPassword = ref(false);

const handleLogin = async () => {
  await login({
    username: form.username,
    password: form.password
  });
};

// Auto-fill demo credentials for testing
onMounted(() => {
  if (process.dev) {
    form.username = 'user@example.com';
    form.password = 'password123';
  }
});
</script>