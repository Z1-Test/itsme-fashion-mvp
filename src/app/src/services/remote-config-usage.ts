import {
  isLoginRegistrationEnabled,
  refreshRemoteConfig,
  getRemoteConfigValues,
} from "./remote-config";

/**
 * Example: Initialize Remote Config on app startup
 */
export async function setupRemoteConfig() {
  try {
    const { initClientRemoteConfig } = await import("./remote-config");
    await initClientRemoteConfig();
    console.log("🔧 Remote Config setup complete");
  } catch (error) {
    console.error("Failed to setup Remote Config:", error);
  }
}

/**
 * Check if login/registration UI should be shown
 */
export function shouldShowLoginRegistration(): boolean {
  return isLoginRegistrationEnabled();
}

/**
 * Render login/registration UI conditionally
 */
export function renderAuthUI(): HTMLElement | null {
  if (!shouldShowLoginRegistration()) {
    console.log("🔒 Login/Registration is disabled");
    return null;
  }

  const authSection = document.createElement("div");
  authSection.className = "auth-section";
  authSection.innerHTML = `
    <div class="auth-container">
      <h2>User Authentication</h2>
      <button class="btn-login">Login</button>
      <button class="btn-register">Register</button>
    </div>
  `;

  return authSection;
}

/**
 * Monitor Remote Config changes and update UI
 */
export function monitorRemoteConfigChanges(intervalMs: number = 5 * 60 * 1000) {
  setInterval(async () => {
    console.log("🔄 Checking for Remote Config updates...");
    await refreshRemoteConfig();

    // Check if login/registration status changed
    const enabled = shouldShowLoginRegistration();
    console.log("📊 Login/Registration status:", enabled);

    // Update UI
    updateAuthUI(enabled);

    // Log config values
    const values = getRemoteConfigValues();
    console.log("Remote Config values:", values);
  }, intervalMs);
}

/**
 * Update UI based on Remote Config
 */
export function updateAuthUI(enabled: boolean) {
  const authContainer = document.getElementById("auth-container");
  
  if (authContainer) {
    if (enabled) {
      const authUI = renderAuthUI();
      if (authUI) {
        authContainer.innerHTML = "";
        authContainer.appendChild(authUI);
      }
    } else {
      authContainer.innerHTML = '<p class="message-disabled">Login/Registration service is currently unavailable.</p>';
    }
  }

  // Also hide/show any elements marked with data-auth attribute
  const authElements = document.querySelectorAll("[data-auth]");
  authElements.forEach((el) => {
    (el as HTMLElement).style.display = enabled ? "block" : "none";
  });
}

/**
 * Initialize all Remote Config features
 */
export async function initializeRemoteConfigFeatures() {
  // Setup Remote Config
  await setupRemoteConfig();

  // Start monitoring for changes
  monitorRemoteConfigChanges();

  // Initial UI update
  const enabled = shouldShowLoginRegistration();
  updateAuthUI(enabled);

  console.log("✨ Remote Config features initialized");
}
