import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin for Emulator
console.log("🔧 Initializing Firebase Admin for Emulator...");

admin.initializeApp({
  projectId: "dev-ecom-test-010126",
});

// Set environment variables for emulators
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for development
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API endpoint to get Remote Config
app.get("/api/config", async (req, res) => {
  try {
    console.log("📡 Fetching Remote Config template...");
    
    const template = await admin.remoteConfig().getTemplate();
    
    // Extract enable_category_filter
    const enableCategoryFilter =
      template.parameters["enable_category_filter"]?.defaultValue?.value === "true";
    
    // Extract sale banner configuration
    const showSale =
      template.parameters["show_sale_banner"]?.defaultValue?.value === "true";
    
    const saleBannerText =
      template.parameters["sale_banner_text"]?.defaultValue?.value || 
      "30% OFF Everything - Limited Time!";
    
    const saleBannerDiscount =
      template.parameters["sale_banner_discount"]?.defaultValue?.value || "30";
    
    const saleBannerBackground =
      template.parameters["sale_banner_background"]?.defaultValue?.value || 
      "#FF6B6B";
    
    const saleBannerTextColor =
      template.parameters["sale_banner_text_color"]?.defaultValue?.value || 
      "#FFFFFF";

    const config = {
      enableCategoryFilter,
      showSale: enableCategoryFilter, // Use enable_category_filter to control banner
      saleBanner: {
        enabled: enableCategoryFilter,
        text: saleBannerText,
        discount: saleBannerDiscount,
        background: saleBannerBackground,
        textColor: saleBannerTextColor,
      },
    };

    console.log("✅ Remote Config loaded:", config);
    res.json(config);
  } catch (error) {
    console.error("❌ Error fetching Remote Config:", error);
    
    // Return default config on error
    res.json({
      enableCategoryFilter: true,
      showSale: true,
      saleBanner: {
        enabled: true,
        text: "30% OFF SALE!",
        discount: "30",
        background: "#FF6B6B",
        textColor: "#FFFFFF",
      },
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`
🚀 Remote Config Server running!
📍 Server: http://localhost:${PORT}
🔧 Environment: Emulator
📡 API: http://localhost:${PORT}/api/config
  `);
});
