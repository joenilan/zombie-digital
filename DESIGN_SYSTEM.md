# Zombie.Digital Design System

## 🎨 Theme Overview
Our design system follows a **cyber/gaming aesthetic** with glass morphism effects, gradient accents, and smooth animations. The theme balances professional functionality with engaging visual elements.

## 🌈 Color Palette

### Primary Colors
```css
--cyber-pink: #ec4899 (rgb(236, 72, 153))
--cyber-purple: #9146ff (rgb(145, 70, 255))
--cyber-cyan: #67e8f9 (rgb(103, 232, 249))
--cyber-darker: #0f0f23 (rgb(15, 15, 35))
```

### Semantic Colors
```css
--background: hsl(240 10% 3.9%) /* Dark mode */
--foreground: hsl(0 0% 98%) /* Light text */
--foreground-muted: rgba(255, 255, 255, 0.7) /* Secondary text */
--foreground-subtle: rgba(255, 255, 255, 0.5) /* Tertiary text */
```

### Glass Effects
```css
--glass-bg: rgba(255, 255, 255, 0.05) /* Light glass */
--glass-border: rgba(255, 255, 255, 0.1) /* Glass borders */
--glass-hover: rgba(255, 255, 255, 0.1) /* Hover state */
```

## 🎭 Typography

### Font Stack
```css
font-family: var(--font-sofia-sans), 'Sofia Sans', system-ui, sans-serif;
```

### Hierarchy
- **Hero Headings**: `text-5xl md:text-7xl font-bold` (80px-112px)
- **Page Titles**: `text-3xl md:text-4xl font-bold` (48px-56px)
- **Section Headings**: `text-xl md:text-2xl font-semibold` (24px-32px)
- **Card Titles**: `text-lg font-semibold` (18px)
- **Body Text**: `text-base` (16px)
- **Small Text**: `text-sm` (14px)
- **Captions**: `text-xs` (12px)

### Text Colors
- **Primary**: `text-foreground` (white)
- **Secondary**: `text-foreground/80` (80% opacity)
- **Muted**: `text-foreground/70` (70% opacity)
- **Subtle**: `text-foreground/60` (60% opacity)
- **Disabled**: `text-foreground/50` (50% opacity)

## 🎨 Gradients

### Brand Gradients
```css
.gradient-brand {
  background: linear-gradient(to right, #ec4899, #9146ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-cyber-gradient {
  background: linear-gradient(135deg, #ec4899, #9146ff, #67e8f9);
}
```

### Background Gradients
```css
/* Page background */
background: linear-gradient(to bottom right, 
  rgba(236, 72, 153, 0.2), 
  rgba(145, 70, 255, 0.2), 
  rgba(103, 232, 249, 0.2)
);
```

## 🪟 Glass Morphism

### Standard Glass Panel
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

### Interactive Glass Elements
```css
.glass-interactive {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.glass-interactive:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(145, 70, 255, 0.15);
}
```

## 🎯 Component Patterns

### Buttons

#### Primary Button (Ethereal Button)
```tsx
<button className="ethereal-button inline-flex items-center gap-3 px-8 py-4 text-lg font-medium hover:scale-105 transition-all duration-300">
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="glass-panel px-6 py-3 text-foreground hover:bg-glass-hover transition-all duration-300 rounded-xl">
  Button Text
</button>
```

### Cards

#### Feature Card
```tsx
<div className="group p-4 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/10 
                hover:bg-glass/50 hover:border-white/20 transition-all duration-300 
                hover:shadow-[0_8px_32px_rgba(145,70,255,0.15)]">
  <div className="flex items-center gap-3 mb-2">
    <div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20 
                    group-hover:from-cyber-pink/30 group-hover:to-purple-500/30 transition-all duration-300">
      {icon}
    </div>
    <h3 className="font-semibold text-foreground group-hover:text-white transition-colors duration-300">
      {title}
    </h3>
  </div>
  <p className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors duration-300">
    {description}
  </p>
</div>
```

#### Content Card
```tsx
<div className="glass-panel p-6 hover:shadow-cyber transition-all duration-300">
  {content}
</div>
```

### Navigation

#### Navigation Container
```css
.nav-container {
  height: 56px; /* h-14 */
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
```

#### Active Navigation Link
```tsx
<Link className="relative px-3 py-2 text-foreground">
  {/* Animated background */}
  <motion.div
    layoutId="nav-highlight"
    className="absolute inset-0 bg-gradient-to-r from-cyber-pink to-purple-500/80 rounded-md"
  />
  <span className="relative z-10">{text}</span>
</Link>
```

## ✨ Animations

### Page Transitions
```tsx
// Entry animation
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

### Staggered Animations
```tsx
// For lists/grids
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1, duration: 0.5 }}
>
```

### Hover Animations
```css
.hover-scale {
  transition: transform 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.02);
}
```

## 🎪 Layout Patterns

### Page Container
```tsx
<div className="min-h-screen">
  <div className="container mx-auto px-4 py-8">
    {content}
  </div>
</div>
```

### Hero Section
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="text-center mb-12"
>
  <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
    <span className="gradient-brand">Brand</span>
    <span className="text-foreground/90">.Text</span>
  </h1>
  <p className="text-xl md:text-2xl text-foreground/80 mb-3 font-medium">
    Subtitle
  </p>
  <p className="text-foreground/60 mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
    Description
  </p>
</motion.div>
```

### Grid Layouts
```tsx
// Feature grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
  {items}
</div>

// Content grid
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {items}
</div>
```

## 🎨 Icon Guidelines

### Icon Colors
- **Primary**: `text-cyber-pink`
- **Secondary**: `text-purple-400`
- **Accent**: `text-cyber-cyan`
- **Neutral**: `text-foreground/70`

### Icon Containers
```tsx
<div className="p-2 rounded-lg bg-gradient-to-br from-cyber-pink/20 to-purple-500/20">
  <Icon className="w-5 h-5 text-cyber-pink" />
</div>
```

## 🌊 Shadows & Effects

### Shadow Utilities
```css
.shadow-cyber {
  box-shadow: 0 4px 20px rgba(145, 70, 255, 0.1);
}

.shadow-cyber-hover {
  box-shadow: 0 8px 32px rgba(145, 70, 255, 0.15);
}

.shadow-glass {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

### Responsive Patterns
```tsx
// Text scaling
className="text-base md:text-lg lg:text-xl"

// Spacing scaling
className="p-4 md:p-6 lg:p-8"

// Grid responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## 🎯 Implementation Checklist

When creating new pages, ensure:

- [ ] Glass morphism backgrounds with proper backdrop blur
- [ ] Consistent color palette (cyber-pink, purple, cyan)
- [ ] Smooth animations with Framer Motion
- [ ] Proper typography hierarchy
- [ ] Hover states on interactive elements
- [ ] Responsive design across all breakpoints
- [ ] Gradient accents on key elements
- [ ] Consistent spacing and padding
- [ ] Glass panel styling for cards/containers
- [ ] Proper contrast for accessibility

## 🔧 Quick Implementation

### Import Required Dependencies
```tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
```

### Base Page Structure
```tsx
export default function PageName() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-brand">Page</span>
            <span className="text-foreground/90"> Title</span>
          </h1>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cards */}
        </div>
      </div>
    </div>
  );
}
```

This design system ensures consistency across all pages while maintaining the beautiful cyber/gaming aesthetic we've established! 