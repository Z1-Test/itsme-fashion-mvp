import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
  User
} from "firebase/auth";
import { httpsCallable, Functions } from "firebase/functions";

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export class AuthService {
  private auth: Auth;
  private functions: Functions;
  private currentUser: AuthUser | null = null;

  constructor(auth: Auth, functions: Functions) {
    this.auth = auth;
    this.functions = functions;
    this.setupAuthStateListener();
  }

  /**
   * Sign in with email and password using Firebase Auth SDK
   */
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
      
      this.currentUser = authUser;
      return authUser;
    } catch (error: any) {
      console.error("Login failed:", error);
      throw new Error(error.message || "Login failed");
    }
  }

  /**
   * Register new user using cloud function
   */
  async register(data: RegisterData): Promise<AuthUser> {
    try {
      const registerFunction = httpsCallable(this.functions, "registerUser");
      const result = await registerFunction({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });

      const user = result.data as any;
      
      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
      
      this.currentUser = authUser;
      return authUser;
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw new Error(error.message || "Registration failed");
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
      this.currentUser = null;
    } catch (error: any) {
      console.error("Logout failed:", error);
      throw new Error(error.message || "Logout failed");
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Setup auth state listener
   */
  private setupAuthStateListener(): void {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  /**
   * Get the current Firebase Auth instance
   */
  getAuth(): Auth {
    return this.auth;
  }
}
