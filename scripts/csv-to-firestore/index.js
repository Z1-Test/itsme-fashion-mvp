import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BATCH_SIZE = 500;

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: 'dev-ecom-test-010126',
  storageBucket: 'dev-ecom-test-010126.appspot.com' // Add storage bucket for Cloud Storage
});

// Set emulator host
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

const db = admin.firestore();
const bucket = admin.storage().bucket('dev-ecom-test-010126.appspot.com'); // Use emulator bucket
db.settings({ ignoreUndefinedProperties: true });

const csvFilePath = path.join(__dirname, '../../data/products.csv');
const imagesDirPath = path.join(__dirname, '../../src/app/public');
const collectionName = 'products';

/**
 * Upload image to Firebase Cloud Storage
 * @param {string} imagePath - Local path to the image file
 * @param {string} productId - Product ID for organizing in storage
 * @param {string} fileName - Original filename
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function uploadImageToStorage(imagePath, productId, fileName) {
  try {
    const destination = `products/${productId}/${fileName}`;
    const [file] = await bucket.upload(imagePath, {
      destination,
      metadata: {
        contentType: getContentType(fileName),
        metadata: {
          uploadedAt: new Date().toISOString(),
          productId: productId,
        },
      },
      public: true, // Make the file publicly accessible
    });

    // For emulator, return the local emulator URL
    // For production, return signed URL
    let url;
    if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      // Emulator URL format - Firebase Storage emulator REST API endpoint
      // Note: The emulator serves files at /storage/v1/b/bucket/o/path?alt=media
      url = `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/storage/v1/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media`;
    } else {
      // Production: Get signed URL
      [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Far future date to make it effectively permanent
      });
    }

    console.log(`Uploaded image: ${destination}`);
    return url;
  } catch (error) {
    console.error(`Error uploading image ${imagePath}:`, error);
    return null;
  }
}

/**
 * Get content type based on file extension
 * @param {string} fileName - Filename with extension
 * @returns {string} - MIME type
 */
function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

/**
 * Find image file for a product
 * @param {string} productName - Product name to match
 * @returns {string|null} - Path to image file or null if not found
 */
function findProductImage(productName) {
  try {
    const files = fs.readdirSync(imagesDirPath);
    // Look for exact match or close match
    const imageFile = files.find(file => {
      const nameWithoutExt = path.parse(file).name;
      return nameWithoutExt.toLowerCase() === productName.toLowerCase() ||
             nameWithoutExt.toLowerCase().includes(productName.toLowerCase()) ||
             productName.toLowerCase().includes(nameWithoutExt.toLowerCase());
    });

    if (imageFile) {
      return path.join(imagesDirPath, imageFile);
    }
  } catch (error) {
    console.error(`Error reading images directory:`, error);
  }
  return null;
}

async function importCSV() {
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const results = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Parsed ${results.length} products from CSV.`);

  // Group products by Product ID
  const productsMap = new Map();

  for (const row of results) {
    const productId = row['Product ID'];
    if (!productId) {
      console.warn('Skipping row without Product ID:', row);
      continue;
    }

    if (!productsMap.has(productId)) {
      productsMap.set(productId, {
        common: {
          githubUrl: row['URL'] || '', // Store original GitHub URL
          productId: row['Product ID'],
          category: row['Category'] || '',
          productName: row['Product name'] || '',
          productCode: row['Product code'] || '',
          tagline: row['Tagline'] || '',
          shortDescription: row['Short description'] || '',
          description: row['Description'] || '',
          keyBenefits: row['Key benefits'] || '',
          ingredients: row['Ingredients'] || '',
          howToUse: row['How to Use'] || '',
          caution: row['Caution'] || '',
          shippingAndDelivery: row['Shipping and Delivery'] || '',
          productLink: row['Product link'] || '',
        },
        shades: []
      });
    }

    // Add shade
    const shade = {
      no: (() => {
        const val = parseInt(row['No']);
        if (isNaN(val)) {
          console.warn(`Invalid 'No' for Product ID ${productId}: ${row['No']}`);
          return 0;
        }
        return val;
      })(),
      sku: row['SKU'] || '',
      shadeName: row['Shade name'] || '',
      shadeCode: row['Shade code'] || '',
      hexCode: row['Hex code'] || '',
      price: (() => {
        const val = parseFloat(row['Price (₹)']);
        if (isNaN(val)) {
          console.warn(`Invalid price for Product ID ${productId}: ${row['Price (₹)']}`);
          return 0;
        }
        return val;
      })(),
      stock: (() => {
        const val = parseInt(row['Stock']);
        if (isNaN(val)) {
          console.warn(`Invalid stock for Product ID ${productId}: ${row['Stock']}`);
          return 0;
        }
        return val;
      })(),
      quantity: row['Quantity'] || '',
    };

    productsMap.get(productId).shades.push(shade);
  }

  console.log(`Grouped into ${productsMap.size} unique products.`);

  // Process and upload images, then batch write to Firestore
  let batch = db.batch();
  let count = 0;

  for (const [productId, productData] of productsMap) {
    try {
      // Find and upload product image
      const imagePath = findProductImage(productData.common.productName);
      let imageUrl = null;

      if (imagePath) {
        const fileName = path.basename(imagePath);
        console.log(`Uploading image for ${productData.common.productName}...`);
        imageUrl = await uploadImageToStorage(imagePath, productId, fileName);
        if (imageUrl) {
          console.log(`Image uploaded successfully: ${imageUrl}`);
        }
      } else {
        console.warn(`No image found for product: ${productData.common.productName}`);
      }

      const docRef = db.collection(collectionName).doc(productId);
      batch.set(docRef, {
        ...productData.common,
        url: imageUrl || productData.common.githubUrl, // Use image URL as main URL, fallback to GitHub URL
        imageUrl: imageUrl, // Keep separate imageUrl field for reference
        shades: productData.shades
      });
      count++;

      // Firestore batch limit is 500
      if (count % BATCH_SIZE === 0) {
        await batch.commit();
        console.log(`Committed batch of ${count} products.`);
        batch = db.batch();
      }
    } catch (error) {
      console.error(`Error processing product ${productId}:`, error);
    }
  }

  // Commit remaining
  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
    console.log(`Committed final batch of ${count % BATCH_SIZE} products.`);
  }

  console.log(`Successfully imported ${count} products to Firestore.`);
  process.exit(0);
}

importCSV().catch((error) => {
  console.error('Error importing CSV:', error);
  process.exit(1);
});