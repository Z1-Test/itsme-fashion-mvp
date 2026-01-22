import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export interface UserRole {
  role: "admin" | "user";
}

/**
 * Wait for Firebase Auth to be ready and get current user
 */
function getAuthUser(): Promise<{ uid: string } | null> {
  return new Promise((resolve) => {
    const auth = getAuth();
    
    // If user is already loaded, return immediately
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    // Otherwise, wait for auth state to load
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });

    // Also try localStorage as a fallback
    setTimeout(() => {
      if (auth.currentUser) {
        unsubscribe();
        resolve(auth.currentUser);
      }
    }, 1000);
  });
}

/**
 * Check if the current user is an admin
 * Queries the users collection in Firestore for role information
 */
export async function isUserAdmin(): Promise<boolean> {
  try {
    // First try to get auth user
    let user = await getAuthUser();

    // If no auth user, try localStorage as fallback
    if (!user) {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        return false;
      }
      try {
        const parsedUser = JSON.parse(userStr) as { uid?: string };
        if (!parsedUser.uid) {
          return false;
        }
        user = { uid: parsedUser.uid };
      } catch (e) {
        return false;
      }
    }

    if (!user?.uid) {
      return false;
    }

    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return false;
    }

    const userData = userDocSnap.data() as UserRole;
    const isAdmin = userData.role === "admin";

    return isAdmin;
  } catch (error) {
    return false;
  }
}

/**
 * Get user role from Firestore
 */
export async function getUserRole(): Promise<"admin" | "user" | null> {
  try {
    // First try to get auth user
    let user = await getAuthUser();

    // If no auth user, try localStorage as fallback
    if (!user) {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        return null;
      }
      try {
        const parsedUser = JSON.parse(userStr) as { uid?: string };
        if (!parsedUser.uid) {
          return null;
        }
        user = { uid: parsedUser.uid };
      } catch (e) {
        return null;
      }
    }

    if (!user?.uid) {
      return null;
    }

    const db = getFirestore();
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    const userData = userDocSnap.data() as UserRole;
    return userData.role || "user";
  } catch (error) {
    return null;
  }
}
