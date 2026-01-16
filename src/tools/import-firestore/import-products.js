import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, connectFirestoreEmulator } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase configuration (minimal config for emulator)
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "localhost",
  projectId: "dev-ecom-test",
  storageBucket: "dev-ecom-test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefg12345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to Firestore Emulator
connectFirestoreEmulator(db, 'localhost', 8080);
console.log('🔧 Connected to Firestore Emulator on localhost:8080\n');

// Read and parse CSV
const csvPath = join(__dirname, '../../../data/products.csv');
const csvData = readFileSync(csvPath, 'utf-8');
const records = parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

// Helper function to generate image URL based on product
function generateImageUrl(product) {
  const category = product.Category.toLowerCase();
  const name = product['Product name'].toLowerCase();
  const shadeName = (product['Shade name'] || '').toLowerCase();
  
  // Specific product mappings with high-quality makeup images
  if (name.includes('kajal')) {
    return 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop&q=85'; // Black kajal/eye pencil
  }
  
  if (name.includes('mascara')) {
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85'; // Mascara wand
  }
  
  if (name.includes('eyeliner')) {
    return 'https://images.unsplash.com/photo-1583241800698-c2e99cae8068?w=600&h=600&fit=crop&q=85'; // Eyeliner pencil
  }
  
  // Lip Gloss variations
  if (name.includes('lip gloss')) {
    if (shadeName.includes('orchid') || shadeName.includes('purple')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85'; // Purple/pink gloss
    }
    if (shadeName.includes('sunset') || shadeName.includes('orange')) {
      return 'https://images.unsplash.com/photo-1542992015-4a0b729b1385?w=600&h=600&fit=crop&q=85'; // Coral/orange gloss
    }
    return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85'; // Clear/nude gloss
  }
  
  // Finishing Powder
  if (name.includes('finishing powder') || name.includes('pro+')) {
    return 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=85'; // Loose powder
  }
  
  // Compact Powder
  if (name.includes('compact powder')) {
    return 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=600&h=600&fit=crop&q=85'; // Pressed powder compact
  }
  
  // Lipstick variations by type
  if (name.includes('liquid matte lipstick')) {
    if (shadeName.includes('red') || shadeName.includes('rosebud') || shadeName.includes('jam')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85'; // Red liquid lipstick
    }
    if (shadeName.includes('pink') || shadeName.includes('libra')) {
      return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85'; // Pink liquid lipstick
    }
    if (shadeName.includes('nude') || shadeName.includes('lychee')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85'; // Nude liquid lipstick
    }
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85'; // Default liquid lipstick
  }
  
  if (name.includes('satin matte lipstick')) {
    if (shadeName.includes('red') || shadeName.includes('crimson') || shadeName.includes('scarlet')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85'; // Red lipstick
    }
    if (shadeName.includes('pink') || shadeName.includes('rose')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85'; // Pink lipstick
    }
    if (shadeName.includes('nude') || shadeName.includes('flesh') || shadeName.includes('bisque')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85'; // Nude lipstick
    }
    if (shadeName.includes('burgundy') || shadeName.includes('marlot')) {
      return 'https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=600&h=600&fit=crop&q=85'; // Dark burgundy
    }
    return 'https://images.unsplash.com/photo-1542992015-4a0b729b1385?w=600&h=600&fit=crop&q=85'; // Default satin lipstick
  }
  
  if (name.includes('shine on') || name.includes('all day long')) {
    if (shadeName.includes('red') || shadeName.includes('rosso')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85'; // Red lipstick
    }
    if (shadeName.includes('pink') || shadeName.includes('lily') || shadeName.includes('blossom')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85'; // Pink lipstick
    }
    if (shadeName.includes('purple') || shadeName.includes('morado')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85'; // Purple lipstick
    }
    if (shadeName.includes('brown') || shadeName.includes('yezi')) {
      return 'https://images.unsplash.com/photo-1588514727390-91fd5ebaef81?w=600&h=600&fit=crop&q=85'; // Brown lipstick
    }
    return 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop&q=85'; // Default long-lasting lipstick
  }
  
  if (name.includes('hydrating matte lipstick')) {
    if (shadeName.includes('rose') || shadeName.includes('wild')) {
      return 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&h=600&fit=crop&q=85'; // Rose/pink
    }
    if (shadeName.includes('amber') || shadeName.includes('breeze')) {
      return 'https://images.unsplash.com/photo-1615397587950-3cbb55f2e0e1?w=600&h=600&fit=crop&q=85'; // Nude/amber
    }
    if (shadeName.includes('tokyo') || shadeName.includes('sisley')) {
      return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85'; // Bold red
    }
    return 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=600&h=600&fit=crop&q=85'; // Default hydrating lipstick
  }
  
  // Hair oil
  if (name.includes('hair oil')) {
    return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop&q=85'; // Hair oil bottle
  }
  
  // Face pack
  if (name.includes('facepack') || name.includes('face pack')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=600&fit=crop&q=85'; // Face mask/pack
  }
  
  // Default fallbacks by category
  if (category === 'eyes') return 'https://images.unsplash.com/photo-1583241800698-c2e99cae8068?w=600&h=600&fit=crop&q=85';
  if (category === 'lips') return 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop&q=85';
  if (category === 'face') return 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop&q=85';
  
  return 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=85';
}

// Convert CSV record to Firestore document
function convertToFirestoreDoc(record) {
  return {
    productId: record['Product ID'],
    category: record.Category.toLowerCase(),
    name: record['Product name'],
    productCode: record['Product code'],
    sku: record.SKU,
    shadeName: record['Shade name'],
    shadeCode: record['Shade code'],
    hexCode: record['Hex code'],
    price: parseInt(record['Price (₹)'].replace(/,/g, '')),
    stock: parseInt(record.Stock),
    quantity: record.Quantity,
    tagline: record.Tagline,
    shortDescription: record['Short description'],
    description: record.Description,
    keyBenefits: record['Key benefits'],
    ingredients: record.Ingredients,
    howToUse: record['How to Use'],
    caution: record.Caution,
    shippingAndDelivery: record['Shipping and Delivery'],
    productLink: record['Product link'],
    image: generateImageUrl(record),
    createdAt: new Date().toISOString()
  };
}

// Upload to Firestore
async function uploadProducts() {
  console.log(`📦 Starting import of ${records.length} products...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    try {
      const productData = convertToFirestoreDoc(record);
      // Use row number to create unique document ID since Product IDs have duplicates
      const uniqueDocId = `product_${String(i + 1).padStart(3, '0')}`;
      const docRef = doc(db, 'products', uniqueDocId);
      await setDoc(docRef, productData);
      
      successCount++;
      console.log(`✅ [${successCount}/${records.length}] Added: ${productData.name} - ${productData.shadeName}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Error adding product ${record['Product ID']}:`, error.message);
    }
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`   Total: ${records.length}`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log('\n🎉 Import complete!');
}

// Run the import
uploadProducts()
  .then(() => {
    console.log('\n✨ All products imported successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
