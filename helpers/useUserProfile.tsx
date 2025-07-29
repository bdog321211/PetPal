import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(250, 'Bio must be 250 characters or less').optional(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

const settingsSchema = z.object({
  notifications: z.object({
    newFollowers: z.boolean().default(true),
    postLikes: z.boolean().default(true),
    postComments: z.boolean().default(false),
  }),
  privacy: z.object({
    showEmail: z.boolean().default(false),
    showPhoneNumber: z.boolean().default(false),
  }),
});

export type UserProfile = z.infer<typeof profileSchema>;
export type UserSettings = z.infer<typeof settingsSchema>;

const USER_PROFILE_KEY = 'petpal_user_profile';
const USER_SETTINGS_KEY = 'petpal_user_settings';

const defaultProfile: UserProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  phone: '123-456-7890',
  address: '123 PetPal Lane, Dogtown, USA 12345',
  bio: 'Lover of all things furry and feathered. I have a golden retriever named Buddy and a cat named Mittens. Looking to connect with other pet owners!',
  imageUrl: 'https://i.pravatar.cc/150?u=alexdoe',
};

const defaultSettings: UserSettings = {
  notifications: {
    newFollowers: true,
    postLikes: true,
    postComments: false,
  },
  privacy: {
    showEmail: false,
    showPhoneNumber: false,
  },
};

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      const storedSettings = localStorage.getItem(USER_SETTINGS_KEY);

      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        setUserProfile(defaultProfile);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(defaultProfile));
      }

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
        localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error("Failed to load user data from local storage", error);
      setUserProfile(defaultProfile);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
      setUserProfile(newProfile);
      console.log("User profile updated successfully.");
    } catch (error) {
      console.error("Failed to save user profile to local storage", error);
    }
  }, []);

  const updateSettings = useCallback((newSettings: UserSettings) => {
    try {
      localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      console.log("User settings updated successfully.");
    } catch (error) {
      console.error("Failed to save user settings to local storage", error);
    }
  }, []);

  return {
    userProfile,
    settings,
    updateProfile,
    updateSettings,
    isLoading,
    profileSchema,
    settingsSchema,
  };
}