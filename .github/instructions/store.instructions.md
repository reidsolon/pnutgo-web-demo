# Pinia Store Guidelines

## Store Structure

### Basic Store Template

```typescript
import { defineStore } from 'pinia';

// Define the entity type
interface Entity {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Define the store state type
interface EntityState {
  entities: Entity[];
  loading: boolean;
  error: string | null;
  selectedEntity: Entity | null;
}

// Initial state with proper typing
const initialState: EntityState = {
  entities: [],
  loading: false,
  error: null,
  selectedEntity: null,
};

export const useEntityStore = defineStore('entityStore', () => {
  // State
  const state = ref<EntityState>(initialState);

  // Getters
  const activeEntities = computed((): Entity[] => {
    return state.value.entities.filter((entity) => entity.status === 'active');
  });

  const entityCount = computed((): number => {
    return state.value.entities.length;
  });

  const hasError = computed((): boolean => {
    return state.value.error !== null;
  });

  // Actions
  const setLoading = (loading: boolean): void => {
    state.value.loading = loading;
  };

  const setError = (error: string | null): void => {
    state.value.error = error;
  };

  const setEntities = (entities: Entity[]): void => {
    state.value.entities = entities;
  };

  const addEntity = (entity: Entity): void => {
    state.value.entities.push(entity);
  };

  const updateEntity = (id: number, updates: Partial<Entity>): void => {
    const index = state.value.entities.findIndex((entity) => entity.id === id);
    if (index !== -1) {
      state.value.entities[index] = {
        ...state.value.entities[index],
        ...updates,
      };
    }
  };

  const removeEntity = (id: number): void => {
    state.value.entities = state.value.entities.filter((entity) => entity.id !== id);
  };

  const selectEntity = (entity: Entity | null): void => {
    state.value.selectedEntity = entity;
  };

  return {
    // State
    state: readonly(state),
    // Getters
    activeEntities,
    entityCount,
    hasError,
    // Actions
    setLoading,
    setError,
    setEntities,
    addEntity,
    updateEntity,
    removeEntity,
    selectEntity,
  };
});
```

### Naming Conventions

- Store files: `useAuthStore.ts`, `useUserStore.ts`
- Store names: `'auth'`, `'user'` (kebab-case)
- Composable exports: `useAuthStore`, `useUserStore`

## Integration Best Practices

### In Components

```vue
<script setup>
const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);

// Use actions directly
authStore.login(credentials);
</script>
```

### In Composables

```typescript
export const useAuth = () => {
  const store = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      await store.login(credentials);
      navigateTo('/dashboard');
    } catch (error) {
      // Handle error
    }
  };

  return {
    ...storeToRefs(store),
    login,
  };
};
```

## State Management Rules

### Do's

- Use `storeToRefs()` for reactive state in components
- Keep stores focused on single responsibility
- Use TypeScript for type safety
- Implement proper error handling in actions
- Use computed properties for derived state

### Don'ts

- Don't mutate state directly outside actions
- Don't create circular dependencies between stores
- Don't store component-specific state in global stores
- Don't forget to handle loading states

## Store Organization

### File Structure

```
stores/
├── auth.ts                  # Global authentication store
├── user.ts                  # Global user data store
├── notification.ts          # Global notification store
└── index.ts                 # Store exports

features/
├── user/
│   └── _stores/
│       └── user-profile.ts      # Feature-specific user profile store
├── dashboard/
│   └── _stores/
│       └── dashboard-stats.ts   # Feature-specific dashboard store
├── products/
│   └── _stores/
│       └── product-catalog.ts   # Feature-specific product store
└── settings/
    └── _stores/
        └── user-settings.ts     # Feature-specific settings store
```

### Index File

```typescript
// Global stores
export { useAuthStore } from './auth';
export { useUserStore } from './user';
export { useNotificationStore } from './notification';

// Feature-specific stores (if needed globally)
export { useUserProfileStore } from '../features/user/_stores/user-profile';
export { useDashboardStatsStore } from '../features/dashboard/_stores/dashboard-stats';
export { useProductCatalogStore } from '../features/products/_stores/product-catalog';
export { useUserSettingsStore } from '../features/settings/_stores/user-settings';
```

## When to Use Pinia

### Use Pinia When:

- **Cross-component state sharing** - Multiple components need the same data
- **Complex state logic** - Business logic that goes beyond simple reactive data
- **API state management** - Handling server data, caching, and synchronization
- **Authentication state** - User sessions, permissions, and auth tokens
- **Global application state** - Theme, language, user preferences
- **Data persistence** - State that needs to survive route changes
- **Complex computed values** - Derived state that multiple components use

### Don't Use Pinia When:

- **Component-local state** - Data only used within a single component
- **Simple reactive data** - Basic form inputs or UI state
- **Temporary state** - Modal visibility, temporary flags
- **Route-specific data** - Data that should reset on navigation
- **Simple prop drilling** - When passing props 1-2 levels deep is sufficient
