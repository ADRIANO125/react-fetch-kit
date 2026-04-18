<div align="center">

# ⚡ react-fetch-kit

**Batteries-included data fetching hooks for React & Next.js**

Zero config. Maximum power. Built-in UI components.

[![npm version](https://img.shields.io/npm/v/react-fetch-kit?color=4F8EF7&style=flat-square)](https://www.npmjs.com/package/react-fetch-kit)
[![npm downloads](https://img.shields.io/npm/dm/react-fetch-kit?color=00D2FF&style=flat-square)](https://www.npmjs.com/package/react-fetch-kit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/react-fetch-kit?color=4ade80&style=flat-square)](https://bundlephobia.com/package/react-fetch-kit)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-4F8EF7?style=flat-square)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-ADRIANO125-181717?style=flat-square&logo=github)](https://github.com/ADRIANO125/react-fetch-kit)
[![Live Demo](https://img.shields.io/badge/Demo-Vercel-black?style=flat-square&logo=vercel)](https://react-fetch-kit-demo.vercel.app/)

</div>

---

## ✨ Why react-fetch-kit?

| Feature | react-fetch-kit | SWR | TanStack Query |
|---|:---:|:---:|:---:|
| Zero config | ✅ | ⚠️ | ❌ |
| Built-in Debounce | ✅ | ❌ | ❌ |
| Auto AbortController | ✅ | ⚠️ | ⚠️ |
| Tab-based fetching | ✅ | ❌ | ❌ |
| Built-in Loader UI | ✅ | ❌ | ❌ |
| Built-in Toast UI | ✅ | ❌ | ❌ |
| Built-in Skeleton UI | ✅ | ❌ | ❌ |
| Bundle size | 🟢 ~6kb | 🟡 ~4kb | 🔴 ~13kb |
| TypeScript | ✅ | ✅ | ✅ |

---

## 📦 Installation

```bash
npm install react-fetch-kit axios
```

---

## 🚀 Quick Start

```tsx
import { FetchKitProvider, ToastContainer } from 'react-fetch-kit';

// Wrap your app once
export default function App({ children }) {
  return (
    <FetchKitProvider config={{ baseUrl: 'https://api.example.com' }}>
      <ToastContainer position="top-right" />
      {children}
    </FetchKitProvider>
  );
}
```

```tsx
import { useFetch, Loader, EmptyState } from 'react-fetch-kit';

function UserList() {
  const { data, loading, error, refetch } = useFetch('/users');

  if (loading) return <Loader color="#4F8EF7" />;
  if (error)   return <p>Error: {error.message}</p>;
  if (!data?.length) return <EmptyState title="No users found" action={<button onClick={refetch}>Retry</button>} />;

  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

---

## 🪝 Hooks

---

### `useFetch<T>`

The core hook. Fetches data automatically when the component mounts.

```tsx
const { data, loading, error, status, refetch } = useFetch<User[]>('/api/users');
```

**Options:**

```ts
useFetch('/api/users', {
  method: 'GET',                    // HTTP method
  params: { role: 'admin' },        // Query params → /api/users?role=admin
  headers: { 'X-Custom': 'value' }, // Extra headers
  body: {},                         // Request body
  enabled: true,                    // Set to false to prevent auto-fetch
  onSuccess: (data) => {},          // Success callback
  onError: (err) => {},             // Error callback
  transform: (raw) => raw.items,    // Transform response before storing
  retry: 3,                         // Retry count on failure
  retryDelay: 1000,                 // Delay between retries (ms) — exponential backoff
  cache: true,                      // Enable in-memory cache
  cacheTime: 5 * 60 * 1000,        // Cache TTL (5 minutes)
});
```

**Return:**

| Property | Type | Description |
|---|---|---|
| `data` | `T \| null` | Response data |
| `loading` | `boolean` | Is fetching |
| `error` | `FetchError \| null` | Error object |
| `status` | `'idle' \| 'loading' \| 'success' \| 'error'` | Request status |
| `refetch` | `() => void` | Manually trigger refetch |

---

### `useMutation<TData, TVariables>`

For POST / PUT / PATCH / DELETE requests. Supports built-in toast notifications.

```tsx
const { mutate, loading, error, data, reset } = useMutation<User, CreateUserDto>('/api/users', {
  method: 'POST',
  toast: {
    success: 'User created! ✅',
    error: 'Failed to create user ❌',
    loading: 'Creating user...',
  },
  onSuccess: (data) => console.log(data),
  invalidates: ['/api/users'], // Clears cache for these keys
});

// Call it
await mutate({ name: 'Ahmed', email: 'ahmed@example.com' });
```

**Options:**

| Option | Type | Description |
|---|---|---|
| `method` | `'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` | HTTP method (default: `'POST'`) |
| `headers` | `object` | Extra headers |
| `toast` | `{ success?, error?, loading? }` | Auto-show toast on each state |
| `onSuccess` | `(data, variables) => void` | Callback |
| `onError` | `(error) => void` | Callback |
| `invalidates` | `string[]` | Cache keys to clear on success |

---

### `useRealtime<T>`

Auto-refreshes data on a timer. Pauses when the tab is hidden. Aborts on unmount.

```tsx
const { data, loading, error, isPolling, stop, resume } = useRealtime<Stats>('/api/stats');
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `every` | `number` | `5000` | Poll interval in ms |
| `paused` | `boolean` | `false` | Start paused |

```tsx
// With options
const { data, stop, resume, isPolling } = useRealtime<Stats>('/api/stats', {
  every: 3000,
  paused: false,
});

<button onClick={isPolling ? stop : resume}>
  {isPolling ? 'Stop' : 'Resume'}
</button>
```

---

### `useDebouncedFetch<T>`

Perfect for search inputs. Waits for the user to stop typing before fetching.

```tsx
const [query, setQuery] = useState('');

const { data, loading, error, isDebouncing } = useDebouncedFetch<Product[]>('/api/search', {
  params: { q: query },
  delay: 400,      // Wait 400ms after last keystroke
  minLength: 2,    // Don't fetch if query < 2 chars
});
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `params` | `object` | `{}` | Query params (include search term here) |
| `delay` | `number` | `400` | Debounce delay in ms |
| `minLength` | `number` | `0` | Min length of `q`/`query`/`search` param |
| `enabled` | `boolean` | `true` | Toggle fetching |

**Return:**

| Property | Description |
|---|---|
| `isDebouncing` | `true` while waiting to fire the request |

---

### `usePaginatedFetch<T>`

Full pagination with helpers out of the box.

```tsx
const {
  data,
  loading,
  page,
  totalPages,
  total,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
  goToPage,
  refetch,
} = usePaginatedFetch<Product>('/api/products', {
  pageSize: 10,
  params: { category: 'meds' },
});
```

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `pageSize` | `number` | `10` | Items per page |
| `params` | `object` | `{}` | Extra query params |
| `pageParam` | `string` | `'page'` | Query param name for page number |
| `limitParam` | `string` | `'limit'` | Query param name for page size |

**Supports common API shapes automatically:**
- `{ data: [], meta: { total, totalPages } }`
- `{ items: [], total, totalPages }`
- `{ results: [], total }`
- Plain array

---

### `useInfiniteFetch<T>`

Loads more data as the user scrolls.

```tsx
const { data, loading, loadMore, hasMore, isFetchingMore } = useInfiniteFetch<Post>('/api/posts', {
  pageSize: 20,
  dataKey: 'items',
  getNextPageParam: (lastPage) => lastPage.nextCursor, // Optional — uses page number by default
});

// Use with IntersectionObserver or a "Load More" button
<button
  onClick={loadMore}
  disabled={!hasMore || isFetchingMore}
>
  {isFetchingMore ? <Loader size="sm" /> : 'Load More'}
</button>
```

---

### `useTabFetch<T>`

Fetches different data per tab, with optional per-tab caching.

```tsx
const { data, loading, activeTab, setTab } = useTabFetch<Order>({
  tabs: [
    { key: 'all',     url: '/api/orders',                label: 'All' },
    { key: 'pending', url: '/api/orders?status=pending', label: 'Pending' },
    { key: 'done',    url: '/api/orders?status=done',    label: 'Done' },
  ],
  defaultTab: 'all',
  cacheEachTab: true, // Caches each tab's data separately
});

// Render tabs
{tabs.map(tab => (
  <button
    key={tab.key}
    onClick={() => setTab(tab.key)}
    style={{ fontWeight: activeTab === tab.key ? 'bold' : 'normal' }}
  >
    {tab.label}
  </button>
))}
```

---

## 🎨 UI Components

All components inject their CSS automatically — no imports needed.

---

### `<Loader />`

Accepts any CSS color. 4 variants. 5 sizes.

```tsx
import { Loader } from 'react-fetch-kit';

<Loader />
<Loader color="#4F8EF7" />
<Loader color="tomato" size="lg" variant="dots" />
<Loader color="hsl(280, 80%, 60%)" size="xl" variant="ring" />
<Loader color="var(--primary)" size="sm" variant="pulse" />
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `string` | `'#4F8EF7'` | Any valid CSS color |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size |
| `variant` | `'spinner' \| 'dots' \| 'pulse' \| 'ring'` | `'spinner'` | Animation style |
| `className` | `string` | `''` | Extra CSS class |

**Variants:**

| Variant | Description |
|---|---|
| `spinner` | Classic rotating circle |
| `ring` | Gradient ring |
| `dots` | 3 bouncing dots |
| `pulse` | Pulsing circle |

---

### `<ToastContainer />` + `useToast`

Add `<ToastContainer />` once in your root. Use `useToast` anywhere.

```tsx
// Root (app.tsx or layout.tsx)
import { FetchKitProvider, ToastContainer } from 'react-fetch-kit';

<FetchKitProvider config={...}>
  <ToastContainer position="top-right" />
  {children}
</FetchKitProvider>
```

```tsx
// Anywhere in your app
import { useToast } from 'react-fetch-kit';

function MyComponent() {
  const { toast } = useToast();

  return (
    <button onClick={() => toast.success('Saved! ✅')}>
      Save
    </button>
  );
}
```

**Toast methods:**

```ts
toast.success('Message');           // ✅ Green
toast.error('Message');             // ❌ Red
toast.info('Message');              // 💡 Blue
toast.warning('Message');           // ⚠️ Yellow
toast.loading('Message');           // ⏳ Purple (won't auto-dismiss)
toast.dismiss();                    // Dismiss all
toast.dismiss(id);                  // Dismiss specific toast

// With options
toast.success('Message', {
  duration: 5000,         // Auto-dismiss after 5s (default: 3500ms)
  color: '#00b894',       // Custom progress bar color
});
```

**ToastContainer Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center'` | `'top-right'` | Screen position |
| `maxToasts` | `number` | `5` | Max toasts shown at once |

---

### `<Skeleton />`

Shimmer loading placeholder.

```tsx
import { Skeleton } from 'react-fetch-kit';

// Single line
<Skeleton width="200px" height="20px" />

// Multiple lines
<Skeleton width="100%" height="14px" count={3} />

// Circle (avatar)
<Skeleton variant="circle" height="48px" />

// Full card
<Skeleton variant="card" />

// Custom colors
<Skeleton
  color="#1e1e2e"
  highlightColor="#313244"
  width="100%"
  height="16px"
/>
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'text' \| 'rect' \| 'circle' \| 'card'` | `'rect'` | Shape preset |
| `width` | `string` | `'100%'` | CSS width |
| `height` | `string` | `'16px'` | CSS height |
| `color` | `string` | `'#e0e0e0'` | Base color |
| `highlightColor` | `string` | `'#f5f5f5'` | Shimmer highlight |
| `borderRadius` | `string` | `'6px'` | Custom border radius |
| `count` | `number` | `1` | Number of lines |

---

### `<EmptyState />`

For when data is empty.

```tsx
import { EmptyState } from 'react-fetch-kit';

<EmptyState
  icon="📭"
  title="No results found"
  description="Try adjusting your search or filters"
  action={<button onClick={refetch}>Refresh</button>}
/>
```

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `string` | `'📭'` | Emoji or any string |
| `title` | `string` | `'No data found'` | Heading text |
| `description` | `string` | — | Body text |
| `action` | `ReactNode` | — | CTA button or element |

---

## ⚙️ FetchKitProvider

Global configuration for all hooks.

```tsx
import { FetchKitProvider } from 'react-fetch-kit';

<FetchKitProvider
  config={{
    baseUrl: 'https://api.example.com',       // Prepended to all URLs
    headers: {
      Authorization: `Bearer ${token}`,        // Sent on every request
      'Accept-Language': 'en',
    },
    defaultCacheTime: 5 * 60 * 1000,           // Default cache TTL (5 min)
    onError: (error) => {                       // Global error handler
      if (error.status === 401) logout();
      if (error.status === 403) redirectTo('/forbidden');
    },
    devMode: true,                              // Future: enables request logging
  }}
>
  {children}
</FetchKitProvider>
```

---

## 📖 Real-world Examples

### Search with Debounce

```tsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, loading, isDebouncing } = useDebouncedFetch('/api/products', {
    params: { q: query },
    delay: 400,
    minLength: 2,
  });

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." />
      {(loading || isDebouncing) && <Loader size="sm" color="#4F8EF7" />}
      {data?.length === 0 && <EmptyState title="No products found" />}
      {data?.map(p => <ProductCard key={p.id} product={p} />)}
    </>
  );
}
```

### Paginated Table

```tsx
function ProductsPage() {
  const { data, loading, page, totalPages, nextPage, prevPage } = usePaginatedFetch('/api/products', {
    pageSize: 20,
  });

  if (loading) return <Skeleton variant="card" count={5} />;

  return (
    <>
      {data?.map(p => <ProductRow key={p.id} {...p} />)}
      <div>
        <button onClick={prevPage} disabled={page === 1}>← Prev</button>
        <span>{page} / {totalPages}</span>
        <button onClick={nextPage} disabled={page === totalPages}>Next →</button>
      </div>
    </>
  );
}
```

### Mutation with Toast

```tsx
function DeleteButton({ id }) {
  const { toast } = useToast();
  const { mutate, loading } = useMutation(`/api/users/${id}`, {
    method: 'DELETE',
    toast: {
      success: 'User deleted ✅',
      error: 'Could not delete user ❌',
      loading: 'Deleting...',
    },
    invalidates: ['/api/users'],
  });

  return (
    <button onClick={() => mutate()} disabled={loading}>
      {loading ? <Loader size="xs" /> : 'Delete'}
    </button>
  );
}
```

### Tab-based Dashboard

```tsx
function OrdersDashboard() {
  const { data: orders, loading, activeTab, setTab } = useTabFetch({
    tabs: [
      { key: 'all',      url: '/api/orders',                 label: 'All Orders' },
      { key: 'pending',  url: '/api/orders?status=pending',  label: 'Pending' },
      { key: 'shipped',  url: '/api/orders?status=shipped',  label: 'Shipped' },
      { key: 'done',     url: '/api/orders?status=done',     label: 'Done' },
    ],
    defaultTab: 'all',
    cacheEachTab: true,
  });

  return (
    <div>
      <div className="tabs">
        {['all','pending','shipped','done'].map(key => (
          <button key={key} onClick={() => setTab(key)} className={activeTab === key ? 'active' : ''}>
            {key}
          </button>
        ))}
      </div>
      {loading && <Loader color="#4F8EF7" />}
      {orders?.length === 0 && <EmptyState title="No orders" />}
      {orders?.map(o => <OrderCard key={o.id} order={o} />)}
    </div>
  );
}
```

---

## 🔭 TypeScript

Full TypeScript support with generics on all hooks.

```ts
import type {
  FetchOptions,
  MutationOptions,
  RealtimeOptions,
  LoaderProps,
  ToastOptions,
} from 'react-fetch-kit';
```

---

## 📋 Roadmap

- [ ] `useLazyFetch` — fetch on demand
- [ ] `useOptimisticMutation` — optimistic UI updates
- [ ] Request interceptors
- [ ] Devtools panel
- [ ] SSR / Next.js Server Components support

---

## 🤝 Contributing

PRs and issues are welcome!

1. Fork the repo → [github.com/ADRIANO125/react-fetch-kit](https://github.com/ADRIANO125/react-fetch-kit)
2. `npm install`
3. `npm run dev` — watch mode
4. Build your feature
5. Open a PR

---

## 📄 License

MIT © 2025 [ADRIANO125](https://github.com/ADRIANO125)

---

<div align="center">
  Made with ❤️ by (SKY) Developers, for Developers.
  <br/>
  <strong>If this saved you time, drop a ⭐ on GitHub!</strong>
</div>
