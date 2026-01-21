import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/*
request body:
{
  "data": {
    "displayName": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123"
  }
}
*/
export const registerUser = onCall(async (request) => {
  try {
    const { displayName, email, password } = request.data;

    // Validate input
   if (!displayName || !email || !password) {  
      throw new HttpsError("invalid-argument", "Missing required fields: displayName, email, password.");  
    }  

    if (typeof displayName !== "string" || displayName.trim().length === 0) {  
      throw new HttpsError("invalid-argument", "Name must be a non-empty string.");  
    }  

    // Use a regex for more robust email validation.  
    const emailRegex = /^[\s\S]+@[\s\S]+\.[\s\S]+$/;  
    if (typeof email !== "string" || !emailRegex.test(email)) {  
      throw new HttpsError("invalid-argument", "Invalid email address.");  
    }  

    if (typeof password !== "string" || password.length < 6) {  
      throw new HttpsError("invalid-argument", "Password must be at least 6 characters long.");  
    }  


    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email.toLowerCase(),
      password: password,
      displayName: displayName.trim(),
    });

    logger.info(`User created in Auth: ${userRecord.uid}`, {
      uid: userRecord.uid,
      email: userRecord.email,
    });

    // Create user document in Firestore with default role
    const userData = {
      uid: userRecord.uid,
      displayName: displayName.trim(),
      email: email.toLowerCase(),
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "active",
    };

    await db.collection("users").doc(userRecord.uid).set(userData);

    logger.info(`User document created in Firestore: ${userRecord.uid}`, {
      uid: userRecord.uid,
    });

    return {
      success: true,
      uid: userRecord.uid,
      message: "User registered successfully",
      user: {
        uid: userRecord.uid,
        displayName: userData.displayName,
        email: userData.email,
        role: userData.role,
      },
    };
  } catch (error) {
    logger.error("Registration error", error);

    // Handle Firebase Auth errors
    if (error instanceof HttpsError) {  
      // This will catch HttpsErrors thrown from the validation logic.  
      throw error;  
    }  

    if (error instanceof Error) {  
      const firebaseError = error as { code?: string; message: string };  
      // Handle Firebase Auth errors by code for robustness  
      if (firebaseError.code) {  
        switch (firebaseError.code) {  
          case 'auth/email-already-exists':  
          case 'auth/email-already-in-use':  
            throw new HttpsError('already-exists', 'An account with this email already exists.');  
          case 'auth/invalid-email':  
            throw new HttpsError('invalid-argument', 'The email address is badly formatted.');  
          case 'auth/weak-password':  
            throw new HttpsError('invalid-argument', 'Password must be at least 6 characters long.');  
          default:  
            // Log other Firebase errors but return a generic message to the client  
            logger.error('Unhandled Firebase Auth error', { code: firebaseError.code, message: firebaseError.message });  
            throw new HttpsError('internal', 'An unexpected error occurred during registration.');  
        }  
      }  
    }  

    // Fallback for other types of errors  
    throw new HttpsError("internal", "Registration failed due to an unknown error.");  
}});






/*
Save or update address request body:
{
  "data": {
    "uid": "user-id",
    "street": "123 Fashion Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip": "400001",
    "phone": "+91 98765 43210",
    "label": "Home"
  }
}
*/
export const saveAddress = onCall(async (request) => {
  try {
    const { uid, street, city, state, zip, phone, label } = request.data;

    // Validate input
    if (!uid || !street || !city || !state || !zip) {
      throw new HttpsError("invalid-argument", "Missing required fields: uid, street, city, state, zip.");
    }

    if (!request.auth || request.auth.uid !== uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated and match the uid.");
    }

    // Prepare address data
    const addressData = {
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
      phone: phone ? phone.trim() : "",
      label: label ? label.trim() : "Home",
      updatedAt: new Date(),
    };

    // Update the address field in the user document and remove any old addresses array
    await db.collection("users").doc(uid).update({
      address: addressData,
      addresses: admin.firestore.FieldValue.delete() // Remove old array if it exists
    });

    logger.info(`Address saved for user: ${uid}`);

    return {
      success: true,
      message: "Address saved successfully",
      address: addressData,
    };
  } catch (error) {
    logger.error("Save address error", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError("internal", "Failed to save address.");
  }
});

/*
Get address request body:
{
  "data": {
    "uid": "user-id"
  }
}
*/
export const getAddresses = onCall(async (request) => {
  try {
    const { uid } = request.data;

    if (!uid) {
      throw new HttpsError("invalid-argument", "Missing required field: uid.");
    }

    if (!request.auth || request.auth.uid !== uid) {
      throw new HttpsError("unauthenticated", "User must be authenticated and match the uid.");
    }

    // Fetch address from user document
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    // Check for single address field (new structure)
    let address = userData.address;

    // If no single address but old addresses array exists, migrate it
    if (!address && userData.addresses && Array.isArray(userData.addresses) && userData.addresses.length > 0) {
      address = userData.addresses[0]; // Take the first address
      // Update the document to use new structure and remove old array
      await userRef.update({
        address: address,
        addresses: admin.firestore.FieldValue.delete() // Remove old array
      });
      logger.info(`Migrated old addresses array to single address for user: ${uid}`);
    }

    // Return as array for frontend compatibility
    const addresses = address ? [address] : [];

    logger.info(`Fetched address for user: ${uid}`);

    return {
      success: true,
      addresses: addresses,
    };
  } catch (error) {
    logger.error("Get address error", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError("internal", "Failed to fetch address.");
  }
});


