# Layout Patterns Documentation

This document outlines the standardized layout patterns used throughout the Zombie.Digital dashboard to ensure consistency.

## Standard Dashboard Layout Structure

All dashboard pages should follow this consistent layout pattern:

```tsx
export default function DashboardPage() {
  // ... component logic ...

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Page Title</h1>
          <p className="text-gray-300">Page description or subtitle.</p>
        </motion.div>

        {/* Page Content */}
        <div className="space-y-8">
          {/* Content sections go here */}
        </div>
      </div>
    </div>
  )
}
```

## Layout Components

### Container Structure
- **Outer wrapper**: `min-h-screen`
- **Container**: `container mx-auto px-4 py-8`
- **Content spacing**: `space-y-8` for main sections

### Page Headers
All pages should have a consistent header structure:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8"
>
  <h1 className="text-4xl font-bold text-white mb-2">Page Title</h1>
  <p className="text-gray-300">Page description.</p>
</motion.div>
```

### Content Cards
Use glass morphism styling for content sections:

```tsx
<motion.div
  className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-white/5"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-2">Section Title</h2>
    <p className="text-muted-foreground">Section description.</p>
  </div>
  
  {/* Section content */}
</motion.div>
```

## Responsive Design

### Breakpoints
- Mobile: Default styles
- Tablet: `md:` prefix (768px+)
- Desktop: `lg:` prefix (1024px+)
- Large: `xl:` prefix (1280px+)

### Grid Patterns
```tsx
// Stats grid (responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

// Three-column layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
```

## Animation Patterns

### Page Entrance
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Staggered Animations
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
```

## Error States

### Error Pages
```tsx
if (error) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl bg-glass/50 backdrop-blur-xl p-8 border border-red-500/20">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    </div>
  )
}
```

### Feature Access Restrictions
```tsx
if (!hasFeatureAccess('FEATURE_NAME')) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-glass border-amber-500/20">
          <CardHeader className="text-center">
            <CardTitle className="text-amber-400 flex items-center justify-center gap-2">
              <Icon className="w-5 h-5" />
              Feature Not Available
            </CardTitle>
            <CardDescription>
              This feature is not available for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Access Restricted
            </div>
            <p className="text-sm text-muted-foreground">
              Contact an administrator if you believe this is an error.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## Design System

### Colors
- Glass effect: `bg-glass/50 backdrop-blur-xl`
- Borders: `border border-white/5`
- Text primary: `text-white`
- Text secondary: `text-gray-300`
- Text muted: `text-muted-foreground`

### Spacing
- Container padding: `px-4 py-8`
- Section spacing: `space-y-8`
- Card padding: `p-6` or `p-8`
- Header margin: `mb-8`

### Typography
- Page titles: `text-4xl font-bold text-white mb-2`
- Section titles: `text-2xl font-semibold mb-2`
- Descriptions: `text-gray-300` or `text-muted-foreground`

## Examples

### Dashboard Main Page
- Full-width stats grid
- Animated counters
- Glass morphism cards
- Consistent spacing

### Settings Pages
- Form layouts with proper spacing
- Section headers
- Action buttons aligned right

### List Pages
- Consistent item cards
- Proper loading states
- Empty states with helpful messaging

## Migration Checklist

When updating existing pages:

- [ ] Add proper container structure (`min-h-screen`)
- [ ] Use standard container (`container mx-auto px-4 py-8`)
- [ ] Add animated page header with consistent styling
- [ ] Wrap content in `space-y-8` container
- [ ] Use glass morphism for content cards
- [ ] Add proper error state layouts
- [ ] Ensure responsive grid patterns
- [ ] Add entrance animations
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify consistent spacing and typography 