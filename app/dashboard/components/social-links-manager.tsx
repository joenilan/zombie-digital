import { useUser } from '@/app/hooks/useUser';

export function SocialLinksManager() {
  const user = useUser();

  const handleSubmit = async (formData: FormData) => {
    // Make sure to include the user_id from the context
    const newLink = {
      user_id: user.id, // This should now be properly set
      platform: formData.get('platform'),
      url: formData.get('url'),
      title: formData.get('title'),
      // ... other fields
    };
    
    // Rest of your submission logic
  };

  // ... rest of the component
} 