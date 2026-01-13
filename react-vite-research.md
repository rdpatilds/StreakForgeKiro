# React + Vite Best Practices 2026 Research

## Project Structure

### Recommended Folder Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Input, etc.)
│   └── common/          # Shared business components
├── features/            # Feature-based organization
│   └── auth/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
├── hooks/               # Custom hooks
├── services/            # API calls and external services
├── stores/              # State management
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── assets/              # Static assets
```

## State Management Comparison

### Context API
**Best for:** Small to medium apps, component-specific state
```tsx
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

### Zustand (Recommended for most projects)
**Best for:** Medium to large apps, simple global state
```tsx
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
}

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Redux Toolkit (RTK)
**Best for:** Complex apps with heavy async logic, time-travel debugging needs
```tsx
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});
```

## Modern React Patterns

### Server Components (React 19+)
```tsx
// Server Component
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetchUser(userId);
  return <div>{user.name}</div>;
}
```

### Concurrent Features
```tsx
import { useDeferredValue, useTransition } from 'react';

function SearchResults({ query }: { query: string }) {
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  
  // Expensive computation with deferred value
  const results = useMemo(() => 
    searchData(deferredQuery), [deferredQuery]
  );
  
  return <div>{isPending ? 'Loading...' : results}</div>;
}
```

### Custom Hooks Pattern
```tsx
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData).finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading };
}
```

## TypeScript Integration

### Vite + TypeScript Setup
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Component Props Typing
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return <button className={`btn-${variant}`} {...props} />;
};
```

## Build Optimization

### Vite Configuration
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## Component Organization

### Barrel Exports
```tsx
// components/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Modal } from './Modal';
```

### Component Co-location
```
features/auth/
├── components/
│   ├── LoginForm/
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
└── services/
```

## Key Recommendations

1. **Use Zustand** for most state management needs - simpler than Redux, more powerful than Context
2. **Feature-based folder structure** - organize by domain, not by file type
3. **React 19 features** - Server Components, Actions, and improved Suspense
4. **SWC over Babel** - Vite's default, much faster compilation
5. **Strict TypeScript** - Enable all strict mode options
6. **Code splitting** - Use React.lazy for route-level splitting
7. **Bundle analysis** - Use `vite-bundle-analyzer` to optimize chunks

## Performance Tips

- Use `React.memo` sparingly, only for expensive components
- Prefer `useDeferredValue` over `debounce` for search inputs
- Use `useTransition` for non-urgent state updates
- Enable React DevTools Profiler in development
- Consider using `@tanstack/react-query` for server state management