# Firebase Emulator Import Script

## Setup Instructions

1. **Install dependencies**:
```bash
cd src/tools/import-firestore
npm install
```

2. **Start Firebase Emulators** (from project root):
```bash
cd ../../..
firebase emulators:start
```

3. **Run the import** (in a new terminal):
```bash
cd src/tools/import-firestore
npm run import
```

## What This Script Does

- ✅ Reads products from `/data/products.csv`
- ✅ Converts CSV data to Firestore-compatible format
- ✅ Adds appropriate product images from Unsplash
- ✅ **Uploads to Firebase Emulator** (localhost:8080)
- ✅ Uses Product ID as document ID for easy reference
- ✅ Displays progress and summary

## Firestore Emulator

This script is configured to use the **Firebase Emulator** automatically:
- **Host**: localhost
- **Port**: 8080 (configured in firebase.json)
- **No credentials needed** - works with demo config
- **Safe for testing** - no production data affected

## View Your Data

After import, access the Emulator UI:
- Open: http://localhost:4000
- Navigate to: **Firestore** tab
- Collection: `products`

## Firestore Structure

Each product document will have:
- `productId`: Unique product identifier
- `category`: eyes, lips, or face
- `name`: Product name
- `price`: Price in ₹
- `shadeName`: Shade/color name
- `hexCode`: Color hex code
- `image`: High-quality product image URL
- `description`: Full product description
- All other CSV fields preserved
