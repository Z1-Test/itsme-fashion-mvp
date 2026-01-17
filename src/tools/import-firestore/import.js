import admin from 'firebase-admin';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load service account key
const serviceAccountPath = path.join(__dirname, 'serviceAcccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// ============================================================================
// Emulator Configuration
// ============================================================================

const USE_EMULATOR = process.env.USE_EMULATOR === 'true';

if (USE_EMULATOR) {
  console.log(`🔥 EMULATOR MODE - Connecting to Firestore Emulator (localhost:8080)\n`);
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
} else {
  console.log(`📋 Service Account Project: ${serviceAccount.project_id}`);
  console.log(`📚 Target Database: dev-db\n`);
  console.log('🔧 PRODUCTION MODE - Using production Firebase\n');
}

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

// Get Firestore - will auto-connect to emulator if FIRESTORE_EMULATOR_HOST is set
const db = admin.firestore();

// ============================================================================
// Helper Functions
// ============================================================================

function generateImageUrl(product) {
  const name = (product['Product name'] || '').toLowerCase();
  const shadeName = (product['Shade name'] || '').toLowerCase();
  
  if (name.includes('kajal')) {
    return 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('mascara')) {
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('eyeliner')) {
    return 'https://images.unsplash.com/photo-1583241800698-c2e99cae8068?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('lip gloss')) {
    if (shadeName.includes('purple') || shadeName.includes('orchid')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('orange') || shadeName.includes('sunset')) {
      return 'https://images.unsplash.com/photo-1542992015-4a0b729b1385?w=600&h=600&fit=crop&q=85';
    }
    return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('finishing powder') || name.includes('pro+')) {
    return 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('compact powder')) {
    return 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('liquid matte lipstick')) {
    if (shadeName.includes('red') || shadeName.includes('rosebud') || shadeName.includes('jam')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('pink') || shadeName.includes('libra')) {
      return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('nude') || shadeName.includes('lychee')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85';
    }
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('satin matte lipstick')) {
    if (shadeName.includes('red') || shadeName.includes('crimson') || shadeName.includes('scarlet')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('pink') || shadeName.includes('rose')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('nude') || shadeName.includes('flesh') || shadeName.includes('bisque')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('burgundy') || shadeName.includes('marlot')) {
      return 'https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=600&h=600&fit=crop&q=85';
    }
    return 'https://images.unsplash.com/photo-1542992015-4a0b729b1385?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('shine on') || name.includes('all day long')) {
    if (shadeName.includes('red') || shadeName.includes('rosso')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('pink') || shadeName.includes('lily') || shadeName.includes('blossom')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('purple') || shadeName.includes('morado')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('brown') || shadeName.includes('yezi')) {
      return 'https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=600&h=600&fit=crop&q=85';
    }
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('hydrating matte lipstick')) {
    if (shadeName.includes('rose') || shadeName.includes('wild')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('amber') || shadeName.includes('breeze')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85';
    }
    if (shadeName.includes('tokyo') || shadeName.includes('sisley')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
    }
    return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('hair oil')) {
    return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85';
  }
  if (name.includes('facepack') || name.includes('face pack')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=85';
  }

  const category = (product.Category || '').toLowerCase();
  if (category === 'eyes') return 'https://images.unsplash.com/photo-1583241800698-c2e99cae8068?w=600&h=600&fit=crop&q=85';
  if (category === 'lips') return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
  if (category === 'face') return 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=85';
  
  return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85';
}

function convertToFirestoreDoc(record, index) {
  return {
    productId: record['Product ID'] || `product_${index}`,
    category: (record.Category || '').toLowerCase(),
    name: record['Product name'] || 'Unnamed Product',
    productCode: record['Product code'] || '',
    sku: record.SKU || '',
    shadeName: record['Shade name'] || '',
    shadeCode: record['Shade code'] || '',
    hexCode: record['Hex code'] || '',
    price: record['Price (₹)'] ? parseInt(record['Price (₹)'].replace(/,/g, '')) : 0,
    stock: record.Stock ? parseInt(record.Stock) : 0,
    quantity: record.Quantity || '',
    tagline: record.Tagline || '',
    shortDescription: record['Short description'] || '',
    description: record.Description || '',
    keyBenefits: record['Key benefits'] || '',
    ingredients: record.Ingredients || '',
    howToUse: record['How to Use'] || '',
    caution: record.Caution || '',
    shippingAndDelivery: record['Shipping and Delivery'] || '',
    productLink: record['Product link'] || '',
    image: generateImageUrl(record),
    createdAt: new Date().toISOString()
  };
}

// ============================================================================
// Main Import Function
// ============================================================================

async function importProducts() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      process.exit(1);
    }
    
    // Read CSV file
    const csvPath = path.join(__dirname, '../../../data/products.csv');
    console.log(`\n📂 Reading CSV from: ${csvPath}`);
    
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`✅ CSV loaded with ${records.length} products\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Import each product
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const docId = `product_${String(i + 1).padStart(3, '0')}`;
      
      try {
        const productData = convertToFirestoreDoc(record, i);
        
        // Write to Firestore
        await db.collection('products').doc(docId).set(productData);
        
        successCount++;
        process.stdout.write(`\r✅ Progress: ${successCount}/${records.length} - ${productData.name.substring(0, 40)}`);
      } catch (error) {
        errorCount++;
        errors.push({
          index: i,
          docId,
          productName: record['Product name'],
          error: error.message
        });
        process.stdout.write(`\r❌ Error at ${i + 1}/${records.length}`);
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Products:  ${records.length}`);
    console.log(`✅ Successfully Imported: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('='.repeat(70));

    if (errors.length > 0) {
      console.log('\n⚠️  ERRORS:');
      errors.forEach(e => {
        console.log(`  [${e.index + 1}] ${e.productName}: ${e.error}`);
      });
    }

    if (successCount === records.length) {
      console.log('\n🎉 ALL PRODUCTS IMPORTED SUCCESSFULLY!\n');
    }

    process.exit(successCount === records.length ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Fatal Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run import
console.log('🚀 Starting Firestore Product Import...\n');
importProducts();
