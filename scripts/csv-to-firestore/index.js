import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BATCH_SIZE = 500;

// Initialize Firebase Admin SDK for emulator
admin.initializeApp({
  projectId: 'dev-ecom-test-010126',
});

// Set emulator host
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const csvFilePath = path.join(__dirname, '../../data/products.csv');
const collectionName = 'products';

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
          url: row['URL'] || '',
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

  // Batch write to Firestore
  let batch = db.batch();
  let count = 0;

  for (const [productId, productData] of productsMap) {
    const docRef = db.collection(collectionName).doc(productId);
    batch.set(docRef, {
      ...productData.common,
      shades: productData.shades
    });
    count++;

    // Firestore batch limit is 500
    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      console.log(`Committed batch of ${count} products.`);
      batch = db.batch();
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