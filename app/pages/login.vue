<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img 
        src="~/assets/images/Background Asset.png" 
        alt="Background" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <!-- Content -->
    <div class="w-full max-w-md relative z-10">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center mb-6">
          <img 
            src="~/assets/images/app-icon.png" 
            alt="PnutGo App Icon" 
            class="w-20 h-20 shadow-xl"
          />
        </div>
        <h1 class="text-3xl font-bold gradient-text mb-3">Welcome to PnutGo</h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          Discover and collect companions in the real world
        </p>
      </div>

      <!-- Login Form -->
      <div class="bg-white/80 rounded-2xl p-8 shadow-2xl">
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
            class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg sm:text-xl py-4 sm:py-5 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center justify-center gap-2 sm:gap-3"
          >
            <div class="flex items-center justify-center">
              <Icon
                v-if="loading"
                name="heroicons:arrow-path"
                class="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin"
              />
              <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
            </div>
          </button>
        </form>

        <!-- Footer -->
        <div class="text-center mt-8">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
  middleware: 'guest'
});

// Import SEO composable
const { setSEO, createWebPageStructuredData } = useSEO()

// Set SEO meta tags for the login page
setSEO({
  title: 'Login to PnutGo - Access Your Companion Collection',
  description: 'Sign in to your PnutGo account to continue your companion hunting adventure. Access your collection, view quest progress, and explore the interactive map. Secure account login.',
  keywords: [
    'PnutGo login',
    'sign in PnutGo',
    'companion hunter account',
    'PnutGo account access',
    'secure login',
    'mobile game login',
    'companion collection access',
    'quest progress login',
    'interactive map access',
    'PnutGo authentication',
    'player account signin',
    'companion hunting login'
  ],
  ogType: 'website',
  twitterCard: 'summary',
  robots: 'noindex, nofollow', // Login pages shouldn't be indexed
  structuredData: createWebPageStructuredData({
    '@type': 'WebPage',
    name: 'PnutGo Login',
    description: 'Secure login page for PnutGo companion hunting game',
    potentialAction: {
      '@type': 'AuthorizeAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://pnutgo.com/login',
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform']
      },
      result: {
        '@type': 'WebPage',
        name: 'PnutGo Game Dashboard'
      }
    }
  })
})

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
</script>