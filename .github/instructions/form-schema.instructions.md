# AI Rule: Creating Form Schemas

## Location
- Place in `modules/[feature]/_utils/` for feature-specific forms
- Place in `utils/` for global/shared form schema logic

## Rule
- Use a schema validation library (e.g., Zod, Yup) for all form schemas
- Name files as `form-schema.ts` (feature-specific) or `form-schemas.ts` (global)
- Export schemas as named constants using `PascalCase` (e.g., `LoginFormSchema`)
- Schemas must define all required fields, types, and validation rules
- Use TypeScript types inferred from the schema for form data
- Document each schema with field descriptions and validation logic
- For feature modules, import only the relevant schema in composables/components
- For global schemas, organize by form type (e.g., `authFormSchemas`, `userFormSchemas`)
- Example (Zod):

```typescript
import { z } from 'zod';

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;
```

## Best Practices
- Centralize schema logic for maintainability
- Reuse schemas across components/composables
- Keep validation logic declarative and type-safe
- Update schemas when form requirements change
- Reference the todo module for implementation style
