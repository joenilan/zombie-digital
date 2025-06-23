# Action Button System

A consistent design system for colorful buttons with matching tooltips across Zombie.Digital.

## Overview

The ActionButton system provides pre-styled, colorful buttons with matching tooltips that follow our cyber theme. This ensures consistency across the entire application and makes it easy to implement beautiful, accessible action buttons.

## Button Variants

### Available Colors

All button variants follow the pattern `cyber-{color}` and include matching tooltip colors:

- **cyber-cyan** - For copy, link, and primary actions
- **cyber-pink** - For view, open, and navigation actions  
- **cyber-purple** - For QR codes, special features
- **cyber-green** - For success, confirm, and positive actions
- **cyber-orange** - For edit, modify, and warning actions
- **cyber-red** - For delete, remove, and destructive actions

### Usage Examples

#### Basic ActionButton

```tsx
import { ActionButton } from '@/components/ui/action-button'
import { Copy } from 'lucide-react'

<ActionButton
  color="cyber-cyan"
  size="icon"
  tooltip="Copy to clipboard"
  onClick={handleCopy}
>
  <Copy className="w-4 h-4" />
</ActionButton>
```

#### Pre-configured Buttons

For common use cases, use the pre-configured components:

```tsx
import { CopyButton, ViewButton, QRButton, EditButton, DeleteButton, SuccessButton } from '@/components/ui/action-button'

// Copy button (cyber-cyan)
<CopyButton size="icon" tooltip="Copy profile link" onClick={handleCopy}>
  <Copy className="w-4 h-4" />
</CopyButton>

// View button (cyber-pink)
<ViewButton size="sm" tooltip="Open profile" onClick={handleView} icon={<ExternalLink className="w-4 h-4" />}>
  View Profile
</ViewButton>

// Delete button (cyber-red)
<DeleteButton size="icon" tooltip="Delete item" onClick={handleDelete}>
  <Trash className="w-4 h-4" />
</DeleteButton>
```

#### With TooltipProvider

For single buttons, use the convenience wrapper:

```tsx
import { ActionButtonWithProvider } from '@/components/ui/action-button'

<ActionButtonWithProvider
  color="cyber-purple"
  size="icon"
  tooltip="Generate QR code"
  onClick={handleQR}
>
  <QrCode className="w-4 h-4" />
</ActionButtonWithProvider>
```

#### Multiple Buttons

When using multiple action buttons together, wrap them in `TooltipProvider`:

```tsx
import { TooltipProvider } from '@/components/ui/tooltip'
import { CopyButton, ViewButton, QRButton } from '@/components/ui/action-button'

<div className="flex items-center gap-2">
  <TooltipProvider>
    <CopyButton size="icon" tooltip="Copy link" onClick={handleCopy}>
      <Copy className="w-4 h-4" />
    </CopyButton>
    
    <ViewButton size="icon" tooltip="Open profile" onClick={handleView}>
      <ExternalLink className="w-4 h-4" />
    </ViewButton>
    
    <QRButton size="icon" tooltip="Get QR code" onClick={handleQR}>
      <QrCode className="w-4 h-4" />
    </QRButton>
  </TooltipProvider>
</div>
```

## Props Reference

### ActionButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tooltip` | `string` | - | **Required.** Tooltip text |
| `color` | `ColorTheme` | - | **Required.** Button color theme |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Button size |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | Tooltip position |
| `variant` | `ButtonProps['variant']` | `color` | Override button variant |
| `tooltipClassName` | `string` | - | Additional tooltip classes |
| `className` | `string` | - | Additional button classes |

### Color Themes

Each color theme includes automatic tooltip styling:

```tsx
type ColorTheme = 
  | "cyber-cyan"    // Copy, link actions
  | "cyber-pink"    // View, navigation
  | "cyber-purple"  // Special features
  | "cyber-green"   // Success actions
  | "cyber-orange"  // Edit, warnings
  | "cyber-red"     // Delete, destructive
```

## Design Guidelines

### When to Use Each Color

- **Cyan** - Primary actions, copying, linking
- **Pink** - Navigation, viewing, opening
- **Purple** - Special features, QR codes, unique actions
- **Green** - Success states, confirmations, positive actions
- **Orange** - Editing, modifications, warnings
- **Red** - Destructive actions, deletion, errors

### Size Guidelines

- **icon** - Use for icon-only buttons in toolbars and action groups
- **sm** - Use for compact buttons in cards and lists
- **default** - Standard size for most buttons
- **lg** - Use for prominent call-to-action buttons

### Accessibility

- All buttons include proper ARIA labels via tooltips
- Tooltips provide context for icon-only buttons
- Color is not the only indicator (icons provide meaning)
- Proper focus management and keyboard navigation

## Migration Guide

### From Manual Styling

**Before:**
```tsx
<Button
  size="icon"
  variant="ghost"
  className="h-9 w-9 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/30 hover:border-cyber-cyan/50 transition-all duration-300"
  onClick={handleCopy}
>
  <Copy className="w-4 h-4" />
</Button>
```

**After:**
```tsx
<CopyButton size="icon" tooltip="Copy to clipboard" onClick={handleCopy}>
  <Copy className="w-4 h-4" />
</CopyButton>
```

### From Manual Tooltips

**Before:**
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline" onClick={handleView}>
        <ExternalLink className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent className="bg-cyber-pink/90 text-white border-cyber-pink/50">
      Open profile
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

**After:**
```tsx
<ViewButton size="icon" tooltip="Open profile" onClick={handleView}>
  <ExternalLink className="w-4 h-4" />
</ViewButton>
```

## Examples in the Codebase

- **Social Links Page** - Header action buttons for copy, view, and QR
- **Admin Users Page** - Quick action buttons in user details
- **Canvas Page** - Delete buttons for canvas management

## Best Practices

1. **Consistent Tooltips** - Use clear, actionable tooltip text
2. **Appropriate Colors** - Follow the color guidelines for semantic meaning
3. **Icon Consistency** - Use Lucide React icons for consistency
4. **Grouping** - Group related actions together with proper spacing
5. **Responsive Design** - Consider mobile interaction patterns

## Related Components

- `Button` - Base button component
- `Tooltip` - Base tooltip component  
- `TooltipProvider` - Required wrapper for tooltip functionality 