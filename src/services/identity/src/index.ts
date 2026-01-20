import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/*
request body:
{
  "data": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "securePassword123"
  }
}
*/
export const registerUser = onCall(async (request) => {
  try {
    const { name, email, password } = request.data;

    // Validate input
   if (!name || !email || !password) {  
      throw new HttpsError("invalid-argument", "Missing required fields: name, email, password.");  
    }  

    if (typeof name !== "string" || name.trim().length === 0) {  
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
      displayName: name.trim(),
    });

    logger.info(`User created in Auth: ${userRecord.uid}`, {
      uid: userRecord.uid,
      email: userRecord.email,
    });

    // Create user document in Firestore with default role
    const userData = {
      uid: userRecord.uid,
      name: name.trim(),
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
        name: userData.name,
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
}}
);