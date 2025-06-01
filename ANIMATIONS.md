# Animation System Documentation

This document outlines the comprehensive animation system implemented throughout Zombie.Digital using Framer Motion. The system provides consistent, beautiful animations across all pages and components.

## Overview

The animation system consists of:
- **Centralized animation variants** (`lib/animations.ts`)
- **Reusable layout components** (`components/animations/`)
- **Animated UI components** (cards, buttons, etc.)
- **Page-level transitions**

## Core Animation Library (`lib/animations.ts`)

### Timing & Easing
```typescript
// Consistent easing curves
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94],
  bounce: [0.68, -0.55, 0.265, 1.55],
  sharp: [0.4, 0, 0.2, 1],
  gentle: [0.25, 0.1, 0.25, 1]
}

// Consistent timing
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7
}
```

### Animation Variants

#### Page Animations
```typescript
// Use for page-level transitions
export const pageAnimations: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 }
}
```

#### Stagger Animations
```typescript
// Container for staggered child animations
export const staggerContainer: Variants
export const staggerItem: Variants
```

#### Directional Animations
```typescript
export const fadeInUp: Variants
export const fadeInDown: Variants
export const fadeInLeft: Variants
export const fadeInRight: Variants
export const slideInLeft: Variants
export const slideInRight: Variants
export const slideInUp: Variants
export const slideInDown: Variants
```

#### Interactive Animations
```typescript
export const cardAnimations: Variants  // For cards with hover effects
export const buttonAnimations: Variants  // For buttons
export const cyberGlow: Variants  // Cyber-themed glow effects
```

## Layout Components

### AnimatedLayout
Base layout wrapper for all pages:

```tsx
import { AnimatedLayout } from '@/components/animations/AnimatedLayout'

// Basic usage
<AnimatedLayout>
  <YourPageContent />
</AnimatedLayout>

// With stagger effects
<AnimatedLayout enableStagger>
  <YourPageContent />
</AnimatedLayout>
```

### Specialized Layouts
```tsx
import { DashboardLayout, AuthLayout, ProfileLayout } from '@/components/animations/AnimatedLayout'

// Dashboard pages
<DashboardLayout>
  <DashboardContent />
</DashboardLayout>

// Authentication pages
<AuthLayout>
  <LoginForm />
</AuthLayout>

// Profile pages
<ProfileLayout>
  <ProfileContent />
</ProfileLayout>
```

## Card Components

### AnimatedCard
Basic animated card with hover effects:

```tsx
import { AnimatedCard } from '@/components/animations/AnimatedCard'

<AnimatedCard 
  enableHover={true}
  enableGlow={false}
  delay={0.1}
  onClick={() => handleClick()}
>
  <CardContent />
</AnimatedCard>
```

### Specialized Cards
```tsx
import { StatsCard, GlassCard, CyberCard } from '@/components/animations/AnimatedCard'

// For statistics display
<StatsCard delay={0.1}>
  <StatContent />
</StatsCard>

// Glass morphism effect
<GlassCard enableHover={true}>
  <Content />
</GlassCard>

// Cyber-themed with glow effects
<CyberCard onClick={handleClick}>
  <Content />
</CyberCard>
```

## Button Components

### AnimatedButton
Consistent button animations:

```tsx
import { AnimatedButton, CyberButton, PrimaryButton } from '@/components/animations/AnimatedButton'

// Basic animated button
<AnimatedButton 
  variant="primary"
  size="md"
  loading={isLoading}
  icon={<Icon />}
  onClick={handleClick}
>
  Click Me
</AnimatedButton>

// Specialized variants
<CyberButton onClick={handleClick}>Cyber Style</CyberButton>
<PrimaryButton loading={isLoading}>Primary Action</PrimaryButton>
```

### Button Variants
- `primary` - Main action buttons with gradient
- `secondary` - Secondary actions with cyan gradient  
- `outline` - Outlined buttons with hover effects
- `ghost` - Minimal buttons with subtle hover
- `cyber` - Cyber-themed with glass morphism

## Page Implementation Examples

### Landing Page
```tsx
import { AnimatedLayout } from '@/components/animations/AnimatedLayout'
import { StatsCard, CyberCard } from '@/components/animations/AnimatedCard'
import { staggerContainer, staggerItem, fadeInUp, slideInLeft } from '@/lib/animations'

export default function HomePage() {
  return (
    <AnimatedLayout>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        <motion.div variants={staggerItem}>
          <motion.h1 variants={fadeInUp}>
            Welcome to Zombie.Digital
          </motion.h1>
        </motion.div>
        
        <motion.div variants={staggerItem}>
          <motion.div variants={slideInLeft}>
            <StatsCard>
              <StatContent />
            </StatsCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatedLayout>
  )
}
```

### Dashboard Page
```tsx
import { DashboardLayout } from '@/components/animations/AnimatedLayout'
import { StatsCard } from '@/components/animations/AnimatedCard'
import { staggerContainer, staggerItem, slideInLeft, fadeInUp } from '@/lib/animations'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <motion.div variants={staggerContainer} initial="initial" animate="enter">
        <motion.div variants={staggerItem} className="grid grid-cols-3 gap-6">
          <motion.div variants={slideInLeft}>
            <StatsCard>Stat 1</StatsCard>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <StatsCard>Stat 2</StatsCard>
          </motion.div>
          <motion.div variants={slideInRight}>
            <StatsCard>Stat 3</StatsCard>
          </motion.div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
```

## Best Practices

### 1. Consistent Timing
Always use the predefined durations and easings:
```tsx
// ✅ Good
transition={{ duration: durations.slow, ease: easings.smooth }}

// ❌ Avoid
transition={{ duration: 0.5, ease: "easeInOut" }}
```

### 2. Stagger Delays
Use consistent stagger timing:
```tsx
// ✅ Good - 0.1s intervals
<motion.div variants={staggerItem} />

// ✅ Good - Custom delay for special cases
<StatsCard delay={0.2} />
```

### 3. Loading States
Always animate loading states:
```tsx
// ✅ Good
{loading ? (
  <motion.div variants={pulseAnimation} animate="animate">
    <LoadingSpinner />
  </motion.div>
) : (
  <motion.div variants={fadeInUp}>
    <Content />
  </motion.div>
)}
```

### 4. Error States
Animate error states for better UX:
```tsx
// ✅ Good
<motion.div variants={scaleIn}>
  <ErrorMessage />
</motion.div>
```

### 5. Responsive Animations
Consider mobile performance:
```tsx
// ✅ Good - Reduced motion on mobile
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div 
  variants={shouldAnimate ? cardAnimations : undefined}
  animate={shouldAnimate ? "enter" : undefined}
>
```

## Performance Considerations

1. **Use `will-change` sparingly** - Only on actively animating elements
2. **Prefer transforms over layout properties** - Use `x`, `y`, `scale` instead of `left`, `top`, `width`
3. **Batch animations** - Use stagger containers for multiple elements
4. **Respect reduced motion** - Check user preferences
5. **Optimize for 60fps** - Keep animations under 16ms per frame

## Cyber Theme Integration

The animation system is designed to complement the cyber/gaming theme:

- **Glass morphism effects** with backdrop blur
- **Neon glow animations** for interactive elements  
- **Gradient transitions** using cyber-pink and cyber-cyan
- **Subtle scale effects** for depth perception
- **Smooth easing curves** for premium feel

## Migration Guide

To update existing components:

1. **Replace individual motion components** with centralized variants
2. **Wrap pages** in appropriate layout components
3. **Use specialized card/button components** instead of custom implementations
4. **Apply consistent timing** using the animation library

Example migration:
```tsx
// Before
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// After  
<motion.div variants={fadeInUp}>
```

This system ensures consistent, beautiful animations throughout the entire application while maintaining excellent performance and user experience. 