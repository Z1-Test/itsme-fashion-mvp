import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
  User
} from "firebase/auth";
import { httpsCallable, Functions } from "firebase/functions";
import { RemoteConfig, getValue } from "firebase/remote-config";

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
  private remoteConfig: RemoteConfig;
  private currentUser: AuthUser | null = null;
  private authInitialized = false;

  constructor(auth: Auth, functions: Functions, remoteConfig: RemoteConfig) {
    this.auth = auth;
    this.functions = functions;
    this.remoteConfig = remoteConfig;
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
   * Wait for auth to be initialized (useful after page refresh)
   */
  async waitForAuthInitialized(): Promise<void> {
    return new Promise((resolve) => {
      if (this.authInitialized) {
        resolve();
        return;
      }
      
      // Check every 50ms until auth is initialized (max 5 seconds)
      const startTime = Date.now();
      const interval = setInterval(() => {
        if (this.authInitialized) {
          clearInterval(interval);
          resolve();
        } else if (Date.now() - startTime > 5000) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
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
      // Mark auth as initialized after first check
      this.authInitialized = true;
    });
  }

  /**
   * Get the current Firebase Auth instance
   */
  getAuth(): Auth {
    return this.auth;
  }

  /**
   * Check if authentication feature is enabled via Remote Config
   */
  isAuthenticationEnabled(): boolean {
    try {
      const isEnabled = getValue(this.remoteConfig, "feature_fe_38_fl_39_user_authentication_enabled").asBoolean();
      return isEnabled;
    } catch (error) {
      // Default to true if remote config is not available
      return true;
    }
  }
}
