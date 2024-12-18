"use client";

import { useUser } from '@/app/hooks/useUser';
import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Make sure this import exists

export function SocialLinksManager() {
  const user = useUser();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      // Log the user object to verify it exists
      console.log('Current user:', user);

      if (!user?.id) {
        throw new Error('User ID is required');
      }

      const newLink = {
        user_id: user.id,
        platform: formData.get('platform'),
        url: formData.get('url'),
        title: formData.get('title'),
        order_index: 999 // or however you want to handle ordering
      };

      // Log the newLink object to verify data
      console.log('Submitting link:', newLink);

      const { data, error: supabaseError } = await supabase
        .from('social_tree')
        .insert([newLink])
        .select();

      if (supabaseError) {
        throw supabaseError;
      }

      // Handle success (clear form, show success message, etc.)
      
    } catch (err) {
      console.error('Error adding link:', err);
      setError(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  // Rest of your component JSX...
}; 