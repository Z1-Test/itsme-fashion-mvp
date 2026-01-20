const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

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

  // Batch write to Firestore
  let batch = db.batch();
  let count = 0;

  for (const product of results) {
    const docId = product['SKU'];
    if (!docId) {
      console.warn('Skipping product without SKU:', product);
      continue;
    }

    // Clean up the data, convert types
    const cleanedProduct = {
      no: parseInt(product['No']) || 0,
      url: product['URL'] || '',
      productId: product['Product ID'],
      category: product['Category'] || '',
      productName: product['Product name'] || '',
      productCode: product['Product code'] || '',
      sku: product['SKU'] || '',
      shadeName: product['Shade name'] || '',
      shadeCode: product['Shade code'] || '',
      hexCode: product['Hex code'] || '',
      price: parseFloat(product['Price (₹)']) || 0,
      stock: parseInt(product['Stock']) || 0,
      quantity: product['Quantity'] || '',
      tagline: product['Tagline'] || '',
      shortDescription: product['Short description'] || '',
      description: product['Description'] || '',
      keyBenefits: product['Key benefits'] || '',
      ingredients: product['Ingredients'] || '',
      howToUse: product['How to Use'] || '',
      caution: product['Caution'] || '',
      shippingAndDelivery: product['Shipping and Delivery'] || '',
      productLink: product['Product link'] || '',
    };

    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, cleanedProduct);
    count++;

    // Firestore batch limit is 500
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Committed batch of ${count} products.`);
      batch = db.batch();
    }
  }

  // Commit remaining
  if (count % 500 !== 0) {
    await batch.commit();
    console.log(`Committed final batch of ${count % 500} products.`);
  }

  console.log(`Successfully imported ${count} products to Firestore.`);
  process.exit(0);
}

importCSV().catch((error) => {
  console.error('Error importing CSV:', error);
  process.exit(1);
});