# Component Guidelines

## Purpose and Overview

### Purpose

This document establishes consistent standards for Vue component development to ensure maintainability, readability, and team collaboration.

### Overview

Rules and guidelines for creating and maintaining Vue components in this project.

## Naming Convention

- Use PascalCase for component names
- Use descriptive and meaningful names
- Avoid abbreviations when possible

### File Organization

```

```

components/
├── global/
│ ├── AppHeader.vue # Global shared components
│ ├── AppFooter.vue # Global shared components
│ └── AppNavigation.vue # Global shared components
├── ui/
│ ├── BaseButton.vue # Reusable UI components
│ ├── BaseInput.vue # Reusable UI components
│ └── BaseModal.vue # Reusable UI components
└── features/
├──── user/
│ ├──── UserProfile.vue # Feature-specific components
│ ├──── UserCard.vue # Feature-specific components
│ └──── UserSettings.vue # Feature-specific components
├──── dashboard/
│ ├──── DashboardStats.vue # Feature-specific components
│ └──── DashboardChart.vue # Feature-specific components
└──── settings/
├────── SettingsForm.vue # Feature-specific components
└────── SettingsToggle.vue # Feature-specific components

```

```

## Using UI Components

UI components in `components/ui` are designed for reuse across the app. Import and use them in your components as shown below:

### Example Usage

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';
</script>

<template>
  <Button variant="primary" size="lg" :loading="isLoading" :disabled="isDisabled">
    Submit
  </Button>

  <Input
    v-model="form.email"
    label="Email"
    placeholder="Enter your email"
    variant="material"
    size="lg"
    :disabled="isDisabled"
    autofocus
  />

  <OtpInput
    v-model="otp"
    :length="6"
    size="default"
    variant="outline"
    placeholder="*"
    :disabled="isDisabled"
    @complete="onOtpComplete"
  />
</template>
```

## Available UI Components & Props

### Button (`components/ui/button/Button.vue`)
- **Props:**
  - `variant`: `'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'` (default: `'default'`)
  - `size`: `'default' | 'sm' | 'md' | 'lg' | 'icon'` (default: `'default'`)
  - `loading`: `boolean` (default: `false`)
  - `disabled`: `boolean` (default: `false`)
  - `as`: `'button' | 'a' | ...` (default: `'button'`)
  - `class`: `string` (optional)

### Input (`components/ui/input/Input.vue`)
- **Props:**
  - `modelValue`: `string | number`
  - `label`: `string` (optional)
  - `placeholder`: `string` (optional)
  - `variant`: `'default' | 'material'` (default: `'default'`)
  - `size`: `'default' | 'sm' | 'lg'` (default: `'default'`)
  - `type`: `string` (default: `'text'`)
  - `disabled`: `boolean` (default: `false`)
  - `autofocus`: `boolean` (default: `false`)
  - `id`: `string` (optional)
  - `class`: `string` (optional)

### OtpInput (`components/ui/otp-input/OtpInput.vue`)
- **Props:**
  - `length`: `number` (default: `6`)
  - `modelValue`: `string` (optional)
  - `placeholder`: `string` (default: `''`)
  - `size`: `'sm' | 'default' | 'lg'` (default: `'default'`)
  - `variant`: `'default' | 'outline'` (default: `'default'`)
  - `disabled`: `boolean` (default: `false`)
  - `class`: `string` (optional)
- **Emits:**
  - `update:modelValue` (string)
  - `complete` (string)

## Sample Implementation

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OtpInput } from '@/components/ui/otp-input';

const isLoading = ref(false);
const isDisabled = ref(false);
const form = ref({ email: '' });
const otp = ref('');

function onOtpComplete(code: string) {
  // handle OTP completion
}
</script>

<template>
  <form>
    <Input
      v-model="form.email"
      label="Email"
      placeholder="Enter your email"
      variant="material"
      size="lg"
      :disabled="isDisabled"
      autofocus
    />
    <OtpInput
      v-model="otp"
      :length="6"
      size="default"
      variant="outline"
      placeholder="*"
      :disabled="isDisabled"
      @complete="onOtpComplete"
    />
    <Button
      variant="primary"
      size="lg"
      :loading="isLoading"
      :disabled="isDisabled"
      @click="submitForm"
    >
      Submit
    </Button>
  </form>
</template>
```

## Props

- Define prop types explicitly
- Provide default values when appropriate
- Use descriptive prop names

## Emits

- Declare all emitted events
- Use kebab-case for event names
- Include payload types in TypeScript projects

## Best Practices

- Keep template logic minimal
- Use computed properties for derived data
- Implement proper error handling
- Write unit tests for components

## Sample Component

```vue
<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
    <button @click="handleClick">
      {{ isLoading ? 'Loading...' : 'Contact' }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number;
  name: string;
  email: string;
}

interface Props {
  user: User;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  contact: [userId: number];
}>();

const isLoading: Ref<boolean> = useState('user-card-loading', () => false);

const handleClick = async (): Promise<void> => {
  if (props.disabled) return;

  isLoading.value = true;
  try {
    emit('contact', props.user.id);
  } finally {
    isLoading.value = false;
  }
};
</script>
```
