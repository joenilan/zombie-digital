# Loading Patterns Documentation

This document outlines the standardized loading patterns used throughout the Zombie.Digital application.

## Components

### LoadingSpinner
The main loading component for actions and full-page loading states.

```tsx
import { LoadingSpinner } from "@/components/LoadingSpinner"

// Default usage
<LoadingSpinner />

// With custom text
<LoadingSpinner text="Authenticating..." />

// Different sizes
<LoadingSpinner size="sm" />   // Small (w-8 h-8)
<LoadingSpinner size="md" />   // Medium (w-16 h-16) - default
<LoadingSpinner size="lg" />   // Large (w-24 h-24)

// Minimal variant (no text, smaller container)
<LoadingSpinner variant="minimal" />

// For buttons and inline usage
<LoadingSpinner size="sm" variant="minimal" className="!min-h-0 !p-0" />
```

### Skeleton Components
For content loading states that preserve layout.

```tsx
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonStats, 
  SkeletonPage, 
  SkeletonForm, 
  SkeletonList 
} from "@/components/ui/skeleton"

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Pre-built patterns
<SkeletonCard />           // Single stat card
<SkeletonStats count={4} /> // Grid of stat cards
<SkeletonPage />           // Full page with header and stats
<SkeletonForm />           // Form with inputs and buttons
<SkeletonList count={5} /> // List of items
```

## Usage Guidelines

### When to Use LoadingSpinner
- Full-page loading states
- Authentication flows
- Action buttons (login, submit, etc.)
- Initial app loading
- Route transitions

### When to Use Skeleton Components
- Content that's loading but layout is known
- Dashboard stats loading
- Form loading states
- List/table loading
- Settings pages

### Design Principles
- All loading states use glass morphism: `bg-glass/50 backdrop-blur-xl`
- Consistent border styling: `border border-white/5`
- Cyber theme colors: `border-t-cyber-pink border-r-cyber-cyan`
- Smooth animations with `animate-pulse` for skeletons
- Spinning animations for spinners

## Examples

### Dashboard Loading
```tsx
// ❌ Don't do this
<div className="grid grid-cols-4 gap-6">
  {[...Array(4)].map((_, i) => (
    <div key={i} className="bg-gray-200 animate-pulse h-32" />
  ))}
</div>

// ✅ Do this
<SkeletonStats count={4} />
```

### Button Loading
```tsx
// ❌ Don't do this
{isLoading ? (
  <div className="w-5 h-5 border-2 border-white animate-spin rounded-full" />
) : (
  <ButtonIcon />
)}

// ✅ Do this
{isLoading ? (
  <LoadingSpinner size="sm" variant="minimal" className="!min-h-0 !p-0" />
) : (
  <ButtonIcon />
)}
```

### Page Loading
```tsx
// ❌ Don't do this
if (loading) {
  return <div>Loading...</div>
}

// ✅ Do this
if (loading) {
  return <LoadingSpinner text="Loading dashboard..." />
}
```

## File Locations
- `components/LoadingSpinner.tsx` - Main spinner component
- `components/ui/skeleton.tsx` - All skeleton components
- `app/loading.tsx` - Global loading page
- `app/dashboard/loading.tsx` - Dashboard loading page

## Migration Checklist
- [ ] Replace custom spinners with `LoadingSpinner`
- [ ] Replace custom skeletons with skeleton components
- [ ] Update loading pages to use standardized components
- [ ] Ensure consistent styling with glass morphism
- [ ] Add appropriate loading text for context
- [ ] Use correct variant (default vs minimal) for context 