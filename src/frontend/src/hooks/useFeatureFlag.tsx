/**
 * useFeatureFlag Hook
 * 
 * Purpose: Retrieve and manage feature flags from Firebase Remote Config
 * 
 * Usage:
 * ```tsx
 * const { wishlistEnabled, loading } = useFeatureFlag('feature_fe_16_fl_17_private_wishlist_enabled');
 * 
 * if (loading) return <div>Loading...</div>;
 * if (wishlistEnabled) return <WishlistComponent />;
 * ```
 */

import { useEffect, useState } from 'react';
import { remoteConfig } from '../config/firebase';
import { fetchAndActivate, getBoolean } from 'firebase/remote-config';


interface UseFeatureFlagResult {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to retrieve feature flag status from Remote Config
 * 
 * @param flagKey - The feature flag key (e.g., 'feature_fe_16_fl_17_private_wishlist_enabled')
 * @returns { enabled, loading, error }
 */
export const useFeatureFlag = (flagKey: string): UseFeatureFlagResult => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFlag = async () => {
      try {
        setLoading(true);
        
        // Fetch and activate the latest Remote Config values
        // In production, this respects the minimumFetchIntervalMillis setting
        await fetchAndActivate(remoteConfig);

        // Get the flag value, with fallback to default config
        const flagValue = getBoolean(remoteConfig, flagKey);
        
        setEnabled(flagValue);
        setError(null);
        
        console.log(`✅ Feature Flag [${flagKey}]: ${flagValue ? 'ENABLED' : 'DISABLED'}`);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error fetching feature flag');
        setError(error);
        console.error(`❌ Error fetching feature flag [${flagKey}]:`, error);
        
        // Fall back to default config value on error
        const defaultValue = getBoolean(remoteConfig, flagKey);
        setEnabled(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchFlag();
  }, [flagKey]);

  return { enabled, loading, error };
};

/**
 * Specific hook for the Private Wishlist feature flag
 */
export const useWishlistFeatureFlag = (): UseFeatureFlagResult => {
  return useFeatureFlag('feature_fe_16_fl_17_private_wishlist_enabled');
};
