# Styling Rules for AI - Tailwind CSS + Nuxt

## Purpose

This document establishes comprehensive styling guidelines for AI-driven development using Tailwind CSS within a Nuxt 3 application. These rules ensure consistent, maintainable, accessible, and responsive user interfaces while leveraging AI capabilities for efficient development.

## Core Guidelines

### 1. Tailwind CSS Best Practices

#### Utility-First Approach

- **Prefer utility classes** over custom CSS
- Use component extraction only when utilities become repetitive (5+ times)
- Leverage `@apply` directive sparingly in component styles

```vue
<!-- ✅ Good: Utility-first -->
<button
  class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
>
  Click me
</button>

<!-- ❌ Avoid: Custom CSS when utilities suffice -->
<button class="custom-button">Click me</button>
```

#### Class Organization

Follow this order for better readability:

1. Layout (flex, grid, position)
2. Box model (margin, padding, width, height)
3. Typography (font, text)
4. Visual (background, border, shadow)
5. Interactive (hover, focus, transition)

```vue
<!-- ✅ Good: Organized classes -->
<div
  class="flex items-center justify-between w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
></div>
```

### 2. Nuxt-Specific Styling Rules

#### Component Structure

```vue
<template>
  <div class="component-container">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
// Component logic
</script>

<style scoped>
/* Only use when Tailwind utilities are insufficient */
.component-container {
  @apply relative;
}
</style>
```

#### CSS Modules with Nuxt

Use CSS modules for complex components:

```vue
<template>
  <div :class="$style.complexComponent">
    <h1 :class="$style.title">AI-Generated Content</h1>
  </div>
</template>

<style module>
.complexComponent {
  @apply relative overflow-hidden;
  /* Custom properties that can't be achieved with utilities */
  background: linear-gradient(135deg, theme('colors.blue.500'), theme('colors.purple.600'));
}

.title {
  @apply text-2xl font-bold text-white;
}
</style>
```

### 3. AI-Specific Design Patterns

#### Loading States for AI Operations

```vue
<template>
  <div class="ai-chat-container">
    <!-- Loading skeleton for AI responses -->
    <div v-if="isLoading" class="flex space-x-3 p-4">
      <div class="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>

    <!-- AI response content -->
    <div
      v-else
      class="ai-response bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg"
    >
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Icon name="robot" class="w-4 h-4 text-white" />
        </div>
        <div class="flex-1 prose prose-sm max-w-none">
          {{ aiResponse }}
        </div>
      </div>
    </div>
  </div>
</template>
```

#### Interactive AI Elements

```vue
<template>
  <!-- AI Input Field -->
  <div class="relative">
    <textarea
      v-model="prompt"
      class="w-full min-h-[120px] p-4 pr-12 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
      placeholder="Ask AI anything..."
    />
    <button
      class="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
      :disabled="!prompt.trim() || isLoading"
    >
      <Icon v-if="isLoading" name="spinner" class="w-4 h-4 text-white animate-spin" />
      <Icon v-else name="send" class="w-4 h-4 text-white" />
    </button>
  </div>
</template>
```

## Responsive Design Approach

### 1. Mobile-First Strategy

Always start with mobile styles and enhance for larger screens:

```vue
<template>
  <!-- Mobile-first responsive grid -->
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div class="ai-card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <!-- Card content -->
    </div>
  </div>
</template>
```

### 2. Breakpoint System

Use Tailwind's default breakpoints consistently:

- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

### 3. Container Patterns

```vue
<template>
  <!-- Page container -->
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Content wrapper -->
      <div class="py-8 lg:py-12">
        <!-- AI Dashboard Layout -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <!-- Sidebar -->
          <aside class="lg:col-span-3">
            <div class="sticky top-6 space-y-6">
              <!-- AI Tools Navigation -->
            </div>
          </aside>

          <!-- Main content -->
          <main class="lg:col-span-9">
            <!-- AI Chat/Interface -->
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Design System Components

### 1. Color Palette for AI Interfaces

```css
/* Extend Tailwind config for AI-specific colors */
module.exports = {
  theme: {
    extend: {
      colors: {
        ai: {
          primary: '#3B82F6',    // Blue for AI actions
          secondary: '#8B5CF6',  // Purple for AI responses
          success: '#10B981',    // Green for completed tasks
          warning: '#F59E0B',    // Amber for processing
          error: '#EF4444',      // Red for errors
          neutral: '#6B7280',    // Gray for neutral states
        }
      }
    }
  }
}
```

### 2. Typography Scale

```vue
<template>
  <div class="ai-content">
    <!-- AI Response Typography -->
    <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">AI Assistant</h1>

    <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Response Section</h2>

    <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-4">
      AI-generated content with proper line height for readability.
    </p>

    <code class="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono"> AI code output </code>
  </div>
</template>
```

### 3. Animation and Transitions

```vue
<template>
  <!-- AI Thinking Animation -->
  <div class="ai-thinking flex items-center space-x-2 p-4">
    <div class="flex space-x-1">
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    </div>
    <span class="text-sm text-gray-600">AI is thinking...</span>
  </div>

  <!-- Slide-in animation for AI responses -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
  >
    <div v-if="showResponse" class="ai-response">
      <!-- AI response content -->
    </div>
  </Transition>
</template>
```

## Accessibility Guidelines

### 1. Focus Management

```vue
<template>
  <!-- Proper focus indicators -->
  <button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg">
    Generate AI Response
  </button>

  <!-- Screen reader support -->
  <div role="status" aria-live="polite">
    <span v-if="isLoading" class="sr-only">AI is generating response...</span>
    <span v-else-if="response" class="sr-only">AI response ready</span>
  </div>
</template>
```

### 2. Color Contrast

Ensure WCAG AA compliance:

```vue
<template>
  <!-- High contrast for text -->
  <div class="bg-white text-gray-900">
    <!-- 21:1 ratio -->
    <button class="bg-blue-600 text-white hover:bg-blue-700">
      <!-- 4.5:1 minimum -->
      AI Action
    </button>
  </div>
</template>
```

## Performance Optimization

### 1. CSS Purging

Configure Tailwind to purge unused styles:

```js
// tailwind.config.js
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  // ...
};
```

### 2. Critical CSS

Use Nuxt's CSS optimization:

```js
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});
```

## Examples

### Complete AI Chat Interface

```vue
<template>
  <div class="ai-chat-interface min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div class="mx-auto max-w-4xl px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900">AI Assistant</h1>
      </div>
    </header>

    <!-- Chat Messages -->
    <main class="mx-auto max-w-4xl px-4 py-6">
      <div class="space-y-6 mb-6">
        <!-- User Message -->
        <div class="flex justify-end">
          <div class="max-w-xs sm:max-w-md lg:max-w-lg bg-blue-500 text-white rounded-lg rounded-br-none p-4">
            <p class="text-sm sm:text-base">{{ userMessage }}</p>
          </div>
        </div>

        <!-- AI Response -->
        <div class="flex justify-start">
          <div
            class="max-w-xs sm:max-w-md lg:max-w-lg bg-white border border-gray-200 rounded-lg rounded-bl-none p-4 shadow-sm"
          >
            <div class="flex items-start space-x-3">
              <div
                class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <Icon name="robot" class="w-4 h-4 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm sm:text-base text-gray-800 leading-relaxed">
                  {{ aiResponse }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div class="relative">
          <textarea
            v-model="currentMessage"
            class="w-full min-h-[60px] max-h-32 p-4 pr-12 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base"
            placeholder="Type your message to AI..."
            @keydown.enter.prevent="sendMessage"
          />
          <button
            @click="sendMessage"
            class="absolute bottom-3 right-3 w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="!currentMessage.trim() || isLoading"
          >
            <Icon v-if="isLoading" name="spinner" class="w-4 h-4 text-white animate-spin" />
            <Icon v-else name="send" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const currentMessage = ref('');
const isLoading = ref(false);
const userMessage = ref('How can AI help with my project?');
const aiResponse = ref(
  'I can help you with various aspects of your project including code generation, debugging, architecture decisions, and best practices. What specific area would you like assistance with?'
);

const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return;

  isLoading.value = true;
  // Simulate AI processing
  await new Promise((resolve) => setTimeout(resolve, 2000));
  isLoading.value = false;

  currentMessage.value = '';
};
</script>
```

## Maintenance and Evolution

### 1. Regular Audits

- Review unused classes monthly
- Update design tokens quarterly
- Accessibility audit bi-annually

### 2. Documentation Updates

- Keep examples current with latest Tailwind/Nuxt versions
- Document new AI design patterns as they emerge
- Update responsive breakpoints as needed

### 3. Team Consistency

- Use linting rules for class ordering
- Establish component review process
- Create shared component library for common AI patterns

---

_These guidelines should be living documents that evolve with your AI application needs and design system maturity._
