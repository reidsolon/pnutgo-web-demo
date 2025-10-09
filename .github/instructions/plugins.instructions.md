# Plugin Guidelines

**Note:** Plugins placed in the `plugins/` directory are auto-loaded by Nuxt. You do not need to manually register them—Nuxt will automatically load and initialize all plugins in this directory.

## Naming Convention

- Use descriptive camelCase names followed by `.ts` extension
- Format: `[pluginName].ts`
- Examples: `apiClient.ts`, `authProvider.ts`, `themeManager.ts`

## File Structure

```typescript
// plugins/[pluginName].ts
export default defineNuxtPlugin(() => {
  // Plugin logic here
});
```

## Best Practices

### 1. Plugin Registration

- Use `defineNuxtPlugin()` wrapper
- Return objects or functions to be injected globally
- Prefer `provide()` for global injection

### 2. Dependencies

- Use `dependsOn` option for plugin ordering
- Declare external dependencies clearly
- Handle async initialization properly

### 3. Client/Server Side

- Use `.client.ts` suffix for client-only plugins
- Use `.server.ts` suffix for server-only plugins
- Default plugins run on both sides

### 4. Error Handling

- Implement proper error boundaries
- Gracefully handle plugin failures
- Log errors appropriately

### 5. Performance

- Lazy load heavy dependencies
- Minimize bundle size impact
- Use tree-shaking friendly imports

## Example Template

```typescript
// plugins/example.ts
export default defineNuxtPlugin({
  name: 'example-plugin',
  dependsOn: ['other-plugin'],
  async setup() {
    // Initialize plugin
    const service = await initializeService();

    return {
      provide: {
        example: service,
      },
    };
  },
});
```
