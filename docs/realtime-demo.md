# Real-time Social Links Demo

This document explains how the real-time CRUD operations work for social links between the dashboard and public profile pages.

## How It Works

The application uses **Supabase Real-time** to sync social link changes between:
- Dashboard social links management page (`/dashboard/social-links`)
- Public profile page (`/[username]`)

### Real-time Features

#### ✨ **CREATE (Add Link)**
- Add a link in the dashboard
- See it appear instantly on the public profile with a smooth animation
- Visual feedback: "✨ Link added" indicator

#### 🔄 **UPDATE (Edit Link)**
- Edit a link's title or URL in the dashboard
- Changes appear immediately on the public profile
- Visual feedback: "🔄 Links updated" indicator

#### 🗑️ **DELETE (Remove Link)**
- Delete a link in the dashboard
- Link disappears from public profile with exit animation
- Visual feedback: "🗑️ Link removed" indicator

#### 📋 **REORDER (Drag & Drop)**
- Drag and drop links to reorder in the dashboard
- New order appears instantly on the public profile
- Smooth layout animations handle the reordering

## Testing the Real-time Functionality

### Setup
1. Open your dashboard: `http://localhost:3000/dashboard/social-links`
2. Open your public profile in a new tab: `http://localhost:3000/[your-username]`
3. Position both windows side by side

### Test Cases

#### Test 1: Add a New Link
1. In dashboard, click "Add Link"
2. Choose a platform (e.g., Twitter)
3. Enter your username
4. Click "Add Link"
5. **Expected**: Link appears instantly on public profile with animation

#### Test 2: Edit an Existing Link
1. In dashboard, double-click any link or click edit button
2. Change the title or URL
3. Save changes
4. **Expected**: Changes appear immediately on public profile

#### Test 3: Delete a Link
1. In dashboard, click the delete button on any link
2. Confirm deletion
3. **Expected**: Link disappears from public profile with smooth exit animation

#### Test 4: Reorder Links
1. In dashboard, drag a link to a new position
2. Drop it in the new location
3. **Expected**: Links reorder instantly on public profile with layout animations

### Visual Feedback

The public profile shows real-time update indicators:
- **✨ Link added** - When a new link is created
- **🔄 Links updated** - When links are modified or reordered
- **🗑️ Link removed** - When a link is deleted

### Technical Implementation

#### Supabase Real-time Channels
- **Dashboard**: `dashboard_social_tree_${userId}_${random}`
- **Public Profile**: `public_profile_${userId}_${timestamp}_${random}`

#### Event Handling
- Both pages listen to `INSERT`, `UPDATE`, `DELETE` events on `social_tree` table
- Debounced updates (300ms dashboard, 400ms profile) prevent conflicts
- Layout animations powered by Framer Motion

#### Animation Features
- **Entrance**: Spring animations with staggered delays
- **Exit**: Smooth fade-out with scale reduction
- **Layout**: Automatic reordering animations
- **Hover**: Subtle lift effect on interaction

## Troubleshooting

### If real-time updates aren't working:

1. **Check Console Logs**
   - Look for "Setting up realtime subscription" messages
   - Verify channel creation and subscription status

2. **Verify Database Permissions**
   - Ensure RLS policies allow real-time subscriptions
   - Check that user has access to `social_tree` table

3. **Network Issues**
   - Real-time requires WebSocket connection
   - Check for firewall or proxy blocking

4. **Multiple Tabs**
   - Each tab creates its own subscription
   - This is normal and expected behavior

### Performance Notes

- Debouncing prevents excessive updates during rapid changes
- Layout animations are optimized for 60fps
- Real-time subscriptions auto-cleanup on page unmount

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Mobile**: Responsive design with touch-friendly interactions

The real-time functionality provides a seamless experience where changes made in the dashboard instantly reflect on the public profile, creating a smooth and responsive user experience. 