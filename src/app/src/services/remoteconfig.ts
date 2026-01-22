import { remoteConfig } from "../firebase";
import { fetchAndActivate, getValue } from "firebase/remote-config";

// Initialize Remote Config
export const initRemoteConfig = async () => {
  try {
    remoteConfig.settings.minimumFetchIntervalMillis = 0; // 1 hour
    remoteConfig.settings.fetchTimeoutMillis = 0; // 1 minute
    
    // Set default values
    remoteConfig.defaultConfig = {
      feature_fe_24_fl_25_ethical_category_filtering_enabled: false // false = show all categories (filtering OFF), true = enable filtering
    };

    // Fetch and activate remote config
    await fetchAndActivate(remoteConfig);
    console.log("✅ Remote Config initialized and activated");
  } catch (error) {
    console.error("❌ Failed to initialize Remote Config:", error);
  }
};

// Check if category filtering is enabled
export const isCategoryFilteringEnabled = (): boolean => {
  try {
    return getValue(remoteConfig, "feature_fe_24_fl_25_ethical_category_filtering_enabled").asBoolean();
  } catch (error) {
    console.error("❌ Error getting category filtering status:", error);
    return false; // default: show all categories (filtering OFF)
  }
};

// Get visible categories based on remote config
export const getVisibleCategories = (): string[] => {
  const filteringEnabled = isCategoryFilteringEnabled();
  
  if (filteringEnabled) {
    // Flag ON: show all four buttons (All, Eyes, Lips, Face)
    return ["all", "eyes", "lips", "face"];
  } else {
    // Flag OFF: show only All button
    return ["all"];
  }
};
