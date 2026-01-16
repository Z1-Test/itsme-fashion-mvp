import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, 'localhost', 8080);

async function checkProducts() {
  const productsCollection = collection(db, 'products');
  const snapshot = await getDocs(productsCollection);
  
  console.log(`Total products in Firestore: ${snapshot.docs.length}`);
  console.log('\nProducts:');
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data();
    console.log(`${index + 1}. ${doc.id} - ${data.name} - ${data.shadeName}`);
  });
}

checkProducts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
