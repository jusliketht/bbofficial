import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prefer server-backed flag if present on cached user object; fallback to legacy local flag
    let completed = false;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        completed = !!u?.onboardingCompleted;
      }
    } catch (e) {
      // ignore parse errors
    }

    if (!completed) {
      completed = localStorage.getItem('itr_onboarding_completed') === 'true';
    }
    const profile = localStorage.getItem('itr_user_profile');

    setIsCompleted(completed);

    if (profile) {
      try {
        setUserProfile(JSON.parse(profile));
      } catch (error) {
        console.error('Error parsing user profile:', error);
        // Reset corrupted profile
        localStorage.removeItem('itr_user_profile');
        setIsCompleted(false);
      }
    }

    setIsLoading(false);
  }, []);

  const completeOnboarding = (profile) => {
    localStorage.setItem('itr_onboarding_completed', 'true');
    localStorage.setItem('itr_user_profile', JSON.stringify(profile));
    setIsCompleted(true);
    setUserProfile(profile);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('itr_onboarding_completed');
    localStorage.removeItem('itr_user_profile');
    setIsCompleted(false);
    setUserProfile(null);
  };

  const updateProfile = (updates) => {
    const newProfile = { ...userProfile, ...updates };
    localStorage.setItem('itr_user_profile', JSON.stringify(newProfile));
    setUserProfile(newProfile);
  };

  return {
    isCompleted,
    userProfile,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    updateProfile,
  };
};
