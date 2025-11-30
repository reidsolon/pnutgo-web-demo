<template>
  <header class="relative overflow-visible bg-white border-b border-gray-100 z-50">
    <div class="relative z-10 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <!-- Page Title with Decorative Background -->
        <div class="flex-1 max-w-2xl">
          <div
            class="relative overflow-hidden bg-gradient-to-r from-amber-50 via-lime-50 to-emerald-50 rounded-3xl px-6 py-4"
          >
            <!-- Decorative cactus elements -->
            <div class="absolute right-4 top-0 bottom-0 flex items-center gap-2 opacity-40">
              <div class="w-8 h-12 bg-lime-200 rounded-full"></div>
              <div class="w-6 h-10 bg-emerald-200 rounded-full"></div>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 relative z-10">{{ title }}</h1>
          </div>
        </div>

        <!-- User Menu Dropdown or Login Button -->
        <div v-if="user" class="relative" ref="dropdownRef">
          <button
            @click.stop="toggleDropdown"
            ref="buttonRef"
            class="flex items-center gap-2 p-1.5 pr-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 group"
            :class="{ 'bg-gray-50': isDropdownOpen }"
          >
            <!-- Avatar with status indicator -->
            <div class="relative">
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm"
              >
                <Icon name="heroicons:user" class="w-5 h-5 text-white" />
              </div>
              <!-- Online status indicator -->
              <div
                v-if="locationEnabled"
                class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"
              >
                <div class="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>

            <!-- Dropdown arrow -->
            <Icon
              name="heroicons:chevron-down"
              class="w-4 h-4 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </button>
        </div>

        <!-- Login Button (when not authenticated) -->
        <NuxtLink
          v-else
          to="/login"
          class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
          <span>Login</span>
        </NuxtLink>
      </div>
    </div>
  </header>

  <!-- Dropdown Menu (Teleported to body for proper z-index) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isDropdownOpen && user"
        ref="dropdownMenuRef"
        class="fixed w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        :style="dropdownStyle"
      >
        <!-- User Info Section -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md"
            >
              <Icon name="heroicons:user" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">
                {{ user?.full_name || 'Trainer' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ user?.email || 'trainer@pnutgo.com' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="py-2">
          <!-- GPS Status Item (Only show if location features are enabled) -->
          <template v-if="showLocationFeatures">
            <button
              @click="handleLocationClick"
              class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  locationEnabled
                    ? 'bg-green-100'
                    : locationError
                    ? 'bg-red-100'
                    : 'bg-yellow-100',
                ]"
              >
                <Icon
                  :name="
                    locationEnabled
                      ? 'heroicons:map-pin'
                      : locationError
                      ? 'heroicons:exclamation-triangle'
                      : 'heroicons:arrow-path'
                  "
                  :class="[
                    'w-4 h-4',
                    locationEnabled
                      ? 'text-green-600'
                      : locationError
                      ? 'text-red-600'
                      : 'text-yellow-600',
                    !locationEnabled && !locationError ? 'animate-spin' : '',
                  ]"
                />
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-medium text-gray-900">GPS Status</p>
                <p
                  :class="[
                    'text-xs',
                    locationEnabled
                      ? 'text-green-600'
                      : locationError
                      ? 'text-red-600'
                      : 'text-yellow-600',
                  ]"
                >
                  {{ locationEnabled ? 'Active' : locationError ? 'Error' : 'Locating...' }}
                </p>
              </div>
            </button>

            <!-- Divider -->
            <div class="h-px bg-gray-100 my-2"></div>
          </template>

          <!-- Logout Item -->
          <button
            @click="handleLogout"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition-colors duration-150 text-red-600"
          >
            <div class="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 text-red-600" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-medium">Logout</p>
            </div>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  locationEnabled?: boolean;
  locationError?: string | null;
  showLocationFeatures?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Search',
  locationEnabled: false,
  locationError: null,
  showLocationFeatures: false,
});

const emit = defineEmits<{
  locationUpdate: [];
  logout: [];
}>();

const { user, logout } = useAuthentication();

// Component state
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLElement | null>(null);
const dropdownMenuRef = ref<HTMLElement | null>(null);

// Calculate dropdown position
const dropdownStyle = computed(() => {
  if (!buttonRef.value || !isDropdownOpen.value) {
    return { top: '0px', right: '0px', zIndex: 9999 };
  }

  const rect = buttonRef.value.getBoundingClientRect();
  return {
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
    zIndex: 9999,
  };
});

// Toggle dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Close dropdown
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

// Handle location click
const handleLocationClick = () => {
  emit('locationUpdate');
  closeDropdown();
};

// Handle logout
const handleLogout = async () => {
  closeDropdown();
  emit('logout');
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  const isOutsideDropdown = dropdownRef.value && !dropdownRef.value.contains(target);
  const isOutsideMenu = dropdownMenuRef.value && !dropdownMenuRef.value.contains(target);
  
  if (isOutsideDropdown && isOutsideMenu) {
    closeDropdown();
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// Watch for escape key
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isDropdownOpen.value) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
