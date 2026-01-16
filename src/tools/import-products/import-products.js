#!/usr/bin/env node

/**
 * Product Data Import Tool
 * 
 * Imports product data from CSV into Firestore emulator.
 * Part of Feature: Product Data Import (Issue #18)
 * 
 * Usage: npm run import-products
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const admin = require('firebase-admin');

// Configuration
const CSV_PATH = path.join(__dirname, '../../../data/products.csv');
const COLLECTION_NAME = 'products';
const BATCH_SIZE = 500;

// Initialize Firebase Admin for emulator
const app = admin.initializeApp({
  projectId: 'dev-ecom-test-010126'
});

// Connect to Firestore emulator
const db = admin.firestore(app);
db.settings({
  host: 'localhost:8081',
  ssl: false
});

/**
 * Validates a single product row from CSV
 * @param {Object} row - CSV row as object
 * @param {number} lineNumber - Line number for error reporting
 * @returns {Object} Validation result with isValid and errors
 */
function validateProduct(row, lineNumber) {
  const errors = [];
  
  // Required fields validation
  const requiredFields = ['Product ID', 'Product name', 'Price (₹)', 'Category'];
  for (const field of requiredFields) {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Missing required field '${field}'`);
    }
  }
  
  // Price validation
  if (row['Price (₹)']) {
    const price = parseInt(row['Price (₹)']);
    if (isNaN(price) || price <= 0) {
      errors.push(`Invalid price value '${row['Price (₹)']}'`);
    }
  }
  
  // Stock validation
  if (row['Stock']) {
    const stock = parseInt(row['Stock']);
    if (isNaN(stock) || stock < 0) {
      errors.push(`Invalid stock value '${row['Stock']}'`);
    }
  }
  
  // Hex code validation
  if (row['Hex code']) {
    const hexCodes = row['Hex code'].split(',').map(h => h.trim());
    for (const hex of hexCodes) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        errors.push(`Invalid hex code '${hex}' in shades field`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.map(error => `Row ${lineNumber}: ${error}`)
  };
}

/**
 * Transforms CSV row to Firestore document structure
 * @param {Object} row - CSV row as object
 * @returns {Object} Shade object for the product
 */
function transformToShadeObject(row) {
  return {
    name: row['Shade name'] || 'Unnamed',
    code: row['Shade code'] || '',
    hexCode: row['Hex code'] || '#000000'
  };
}

/**
 * Transforms CSV rows (grouped by Product ID) to Firestore document structure
 * @param {string} productId - Product ID
 * @param {Array} rows - All CSV rows with this Product ID
 * @returns {Object} Firestore document data
 */
function transformToFirestoreDocument(productId, rows) {
  // Use the first row for base product info
  const baseRow = rows[0];
  
  // Collect all unique shades from all rows
  const shadesMap = new Map();
  rows.forEach(row => {
    const hexCode = row['Hex code'] || '#000000';
    if (!shadesMap.has(hexCode)) {
      shadesMap.set(hexCode, {
        name: row['Shade name'] || 'Unnamed',
        code: row['Shade code'] || '',
        hexCode: hexCode
      });
    }
  });
  
  const shades = Array.from(shadesMap.values());
  
  return {
    id: row['Product ID'],
    name: row['Product name'],
    category: row['Category'],
    price: parseInt(row['Price (₹)']) || 0,
    stock: parseInt(row['Stock']) || 0,
    quantity: row['Quantity'] || '',
    tagline: row['Tagline'] || '',
    shortDescription: row['Short description'] || '',
    description: row['Description'] || '',
    keyBenefits: row['Key benefits'] || '',
    ingredients: row['Ingredients'] || '',
    howToUse: row['How to Use'] || '',
    caution: row['Caution'] || '',
    shades,
    ethicalMarkers,
    metadata: {
      productCode: row['Product code'] || '',
      sku: row['SKU'] || '',
      url: row['URL'] || '',
      productLink: row['Product link'] || '',
      shippingAndDelivery: row['Shipping and Delivery'] || '',
      importedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  };
}

/**
 * Writes products to Firestore in batches
 * @param {Array} products - Array of product documents
 * @returns {Promise} Promise resolving to write results
 */
async function writeProductsToFirestore(products) {
  console.log(`Writing ${products.length} products to Firestore in batches of ${BATCH_SIZE}...`);
  
  const batches = [];
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = products.slice(i, i + BATCH_SIZE);
    
    chunk.forEach(product => {
      const docRef = db.collection(COLLECTION_NAME).doc(product.id);
      batch.set(docRef, product);
    });
    
    batches.push(batch);
  }
  
  console.log(`Created ${batches.length} batches`);
  
  // Execute batches sequentially to avoid overwhelming emulator
  let successCount = 0;
  for (let i = 0; i < batches.length; i++) {
    try {
      await batches[i].commit();
      const batchSize = Math.min(BATCH_SIZE, products.length - (i * BATCH_SIZE));
      successCount += batchSize;
      console.log(`Batch ${i + 1}/${batches.length} committed successfully (${successCount}/${products.length} products)`);
    } catch (error) {
      console.error(`Batch ${i + 1} failed:`, error.message);
      throw error;
    }
  }
  
  return successCount;
}

/**
 * Verifies import success by checking document count
 * @param {number} expectedCount - Expected number of documents
 * @returns {Promise<boolean>} Promise resolving to verification result
 */
async function verifyImport(expectedCount) {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const actualCount = snapshot.size;
    
    console.log(`Verification: Expected ${expectedCount} products, found ${actualCount} in Firestore`);
    
    if (actualCount === expectedCount) {
      console.log('✅ Import verification successful');
      return true;
    } else {
      console.error('❌ Import verification failed - document count mismatch');
      return false;
    }
  } catch (error) {
    console.error('❌ Import verification failed:', error.message);
    return false;
  }
}

/**
 * Main import function
 */
async function main() {
  console.log('🚀 Starting product data import...');
  console.log(`📁 Reading CSV from: ${CSV_PATH}`);
  
  try {
    // Check if emulator is running
    try {
      await db.collection('_health_check').limit(1).get();
      console.log('✅ Firestore emulator connection verified');
    } catch (error) {
      console.error('❌ Firestore emulator not running. Start with `firebase emulators:start`');
      process.exit(1);
    }
    
    // Read and parse CSV
    if (!fs.existsSync(CSV_PATH)) {
      console.error(`❌ CSV file not found: ${CSV_PATH}`);
      process.exit(1);
    }
    
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');
    const records = await new Promise((resolve, reject) => {
      parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, records) => {
        if (err) reject(err);
        else resolve(records);
      });
    });
    
    console.log(`📊 Parsed ${records.length} product records from CSV`);
    
    // Group records by Product ID (each unique ID = one product with multiple shades)
    const productGroups = new Map();
    
    records.forEach((row, index) => {
      const productId = row['Product ID'];
      if (!productGroups.has(productId)) {
        productGroups.set(productId, []);
      }
      productGroups.get(productId).push({ ...row, _rowNumber: index + 2 });
    });
    
    console.log(`📦 Found ${productGroups.size} unique products with ${records.length} total shade variants`);
    
    // Validate and transform all product groups
    const validationErrors = [];
    const validProducts = [];
    
    productGroups.forEach((rows, productId) => {
      // Validate the first row as representative
      const validation = validateProduct(rows[0], rows[0]._rowNumber);
      if (validation.isValid) {
        // Parse ethical markers from first row
        const ethicalMarkers = {
          vegan: false, // Default since not in current CSV
          crueltyFree: false // Default since not in current CSV
        };
        
        // Collect all unique shades
        const shadesMap = new Map();
        rows.forEach(row => {
          const hexCode = row['Hex code'] || '#000000';
          if (!shadesMap.has(hexCode)) {
            shadesMap.set(hexCode, {
              name: row['Shade name'] || 'Unnamed',
              code: row['Shade code'] || '',
              hexCode: hexCode
            });
          }
        });
        
        const document = {
          id: productId,
          name: rows[0]['Product name'],
          category: rows[0]['Category'],
          price: parseInt(rows[0]['Price (₹)']) || 0,
          stock: parseInt(rows[0]['Stock']) || 0,
          quantity: rows[0]['Quantity'] || '',
          tagline: rows[0]['Tagline'] || '',
          shortDescription: rows[0]['Short description'] || '',
          description: rows[0]['Description'] || '',
          keyBenefits: rows[0]['Key benefits'] || '',
          ingredients: rows[0]['Ingredients'] || '',
          howToUse: rows[0]['How to Use'] || '',
          caution: rows[0]['Caution'] || '',
          shades: Array.from(shadesMap.values()),
          ethicalMarkers,
          metadata: {
            productCode: rows[0]['Product code'] || '',
            sku: rows[0]['SKU'] || '',
            url: rows[0]['URL'] || '',
            productLink: rows[0]['Product link'] || '',
            shippingAndDelivery: rows[0]['Shipping and Delivery'] || '',
            shadeVariants: rows.length,
            importedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        };
        
        validProducts.push(document);
      } else {
        validationErrors.push(...validation.errors);
      }
    });
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors found:');
      validationErrors.forEach(error => console.error(`  ${error}`));
      console.error(`\n${validationErrors.length} validation error(s) found. Please correct CSV and retry.`);
      process.exit(1);
    }
    
    console.log(`✅ All ${validProducts.length} products validated successfully`);
    
    // Clear existing products collection
    console.log('🧹 Clearing existing products collection...');
    const existingSnapshot = await db.collection(COLLECTION_NAME).get();
    if (!existingSnapshot.empty) {
      const deleteBatch = db.batch();
      existingSnapshot.docs.forEach(doc => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
      console.log(`Deleted ${existingSnapshot.size} existing products`);
    }
    
    // Write products to Firestore
    const writtenCount = await writeProductsToFirestore(validProducts);
    
    // Verify import
    const verificationSuccess = await verifyImport(writtenCount);
    
    if (verificationSuccess) {
      console.log('🎉 Import complete successfully!');
      console.log(`📈 Summary: ${writtenCount} products imported to Firestore`);
      process.exit(0);
    } else {
      console.error('❌ Import verification failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main();
}

module.exports = { main, validateProduct, transformToFirestoreDocument };