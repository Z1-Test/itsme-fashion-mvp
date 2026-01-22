import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from "firebase/remote-config";
import { app } from "../firebase";

let remoteConfig: RemoteConfig | null = null;

/**
 * Initialize Remote Config on the client
 */
export async function initClientRemoteConfig(): Promise<RemoteConfig> {
  try {
    remoteConfig = getRemoteConfig(app);

    // Set default values (fallback if Firebase not accessible)
    remoteConfig.defaultConfig = {
      feature_fe_38_fl_39_user_authentication_enabled: "true",
    };

    // In development, fetch without cache for testing
    // In production, use longer cache (default 12 hours = 43200000ms)
    const isDev = typeof window !== "undefined" && (window as any).__DEV_MODE__;
    remoteConfig.settings.minimumFetchIntervalMillis = 0; // 1 hour in prod
    remoteConfig.settings.fetchTimeoutMillis = 0;

    // Fetch and activate Remote Config
    await fetchAndActivate(remoteConfig);
    console.log("✅ Remote Config initialized and activated");

    return remoteConfig;
  } catch (error) {
    console.error("❌ Failed to initialize Remote Config:", error);
    // Return initialized config even on fetch failure (will use defaults)
    remoteConfig = remoteConfig || getRemoteConfig(app);
    return remoteConfig;
  }
}

/**
 * Check if login and registration service is enabled
 */
export function isLoginRegistrationEnabled(): boolean {
  if (!remoteConfig) {
    console.warn("Remote Config not initialized, using default (true)");
    return true;
  }
  const value = getValue(remoteConfig, "feature_fe_38_fl_39_user_authentication_enabled");
  return value.asBoolean();
}

/**
 * Refresh Remote Config from Firebase
 */
export async function refreshRemoteConfig(): Promise<void> {
  if (!remoteConfig) {
    console.warn("Remote Config not initialized");
    return;
  }

  try {
    await fetchAndActivate(remoteConfig);
    console.log("✅ Remote Config refreshed");
  } catch (error) {
    console.error("❌ Failed to refresh Remote Config:", error);
  }
}

/**
 * Get all config values (for debugging)
 */
export function getRemoteConfigValues(): Record<string, any> {
  if (!remoteConfig) {
    console.warn("Remote Config not initialized");
    return {};
  }

  return {
    feature_fe_38_fl_39_user_authentication_enabled: getValue(remoteConfig, "feature_fe_38_fl_39_user_authentication_enabled").asBoolean(),
  };
}
