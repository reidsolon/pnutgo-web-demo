# Composables Guidelines

## Purpose and Overview

### Purpose

This document establishes consistent standards for creating and organizing composables in Nuxt.js applications. Composables are reusable functions that encapsulate reactive state and logic, providing a clean way to share functionality across components.

### Overview

Composables in Nuxt.js serve as the primary mechanism for sharing reactive state between components, encapsulating business logic and API interactions, managing application-wide state without external state management libraries, and leveraging Nuxt's auto-import capabilities for seamless development experience.

**Note:** Composables placed in the `composables/` directory are auto-loaded by Nuxt. You do not need to manually import them in your components or plugins—just use them directly.

## Naming Convention

### Export Naming

All composables must be exported using the `use` prefix followed by the entity or service name. Use PascalCase for the entity/service name: `use[Entity]` or `use[Service]`. Examples include `useAuth`, `useUserProfile`, `useApiClient`, and `useNotification`.

### File Naming

Use kebab-case for composable files and match the export name: `use-auth.ts`, `use-user-profile.ts`.

## Structure Rules

### File Organization

```
composables/
├── use-auth.ts # Global shared composables
├── use-api-client.ts # Global shared composables
└── use-notification.ts # Global shared composables

features/
├── user/
|     └── _composables/
|         └── use-user-profile.ts # Feature-specific composables
├── dashboard/
│     └── _composables/
│         └── use-dashboard-stats.ts
└── settings/
      └── _composables/
           └── use-settings.ts
```

### Export Pattern

```typescript
// ✅ Correct
export const useAuth = () => {
  // composable logic
};

// ❌ Incorrect
export const authComposable = () => {
  // composable logic
};
```

## State Management

### State Placement

Composables can have states inside the exported function if required or suggested. Composables can have states outside the exported function if required or suggested. Use `useState` for SSR-compatible reactive state and `ref` or `reactive` for client-side only state.

### State Guidelines

Inside function placement is for component-scoped state. Outside function placement is for global shared state across components. Always initialize state with proper types.

## Best Practices

### Return Object

Always return an object with named properties. Use `readonly` for reactive state when appropriate and provide both state and actions.

### Example Structure

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export const useUser = () => {
  const user = useState<User | null>('user', () => null);
  const loading = useState<boolean>('user_loading', () => false);
  const error = useState<string | null>('user_error', () => null);

  const fetchUser = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await useFetch<User>('/api/user');

      if (fetchError.value) throw new Error(fetchError.value.message);

      user.value = data.value ?? null;
    } catch (err) {
      error.value = (err as Error).message;
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    error,
    fetchUser,
  };
};
```

### TanStack Query Example

```typescript
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const usePosts = () => {
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await $fetch<Post[]>('/api/posts');
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { mutate: createPost, isPending: isCreating } = useMutation({
    mutationFn: async (newPost: Omit<Post, 'id'>) => {
      return await $fetch<Post>('/api/posts', {
        method: 'POST',
        body: newPost,
      });
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      refetch();
    },
  });

  return {
    posts,
    isLoading,
    error,
    refetch,
    createPost,
    isCreating,
  };
};
```

This example demonstrates:

- Using `useQuery` for data fetching with caching
- Using `useMutation` for data mutations
- Proper TypeScript typing
- Cache invalidation after mutations
- Configuring stale time and garbage collection time

### Auto-imports

Leverage Nuxt's auto-import feature by placing composables in the `composables/` directory. No need for manual imports in components.

## When to use composables

### Use composable state when:

- You don’t need global access (just scoped/shared logic).
- You want lightweight, local state (like in a form or module).
- You don’t need DevTools debugging, or persistence.
