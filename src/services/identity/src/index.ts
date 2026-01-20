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
      throw new Error("Missing required fields: name, email, password");
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      throw new Error("Name must be a non-empty string");
    }

    if (typeof email !== "string" || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    if (typeof password !== "string" || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
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
    if (error instanceof Error) {
      if (error.message.includes("email-already-exists") || error.message.includes("already in use")) {
        throw new HttpsError("already-exists", "Email already registered");
      }
      if (error.message.includes("Missing required fields")) {
        throw new HttpsError("invalid-argument", error.message);
      }
      if (error.message.includes("Invalid email")) {
        throw new HttpsError("invalid-argument", error.message);
      }
      if (error.message.includes("Password must be")) {
        throw new HttpsError("invalid-argument", error.message);
      }
      if (error.message.includes("Name must be")) {
        throw new HttpsError("invalid-argument", error.message);
      }
      throw new HttpsError("internal", error.message);
    }

    throw new HttpsError("internal", "Registration failed");
  }
});